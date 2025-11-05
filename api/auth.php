<?php
/**
 * API de Autenticación - Credihogar
 * Endpoints: /api/auth.php
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = getJsonInput();

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'login') {
            handleLogin($input);
        } elseif ($action === 'register') {
            handleRegister($input);
        } elseif ($action === 'logout') {
            handleLogout();
        } else {
            jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        if ($action === 'session') {
            checkSession();
        } elseif ($action === 'profile') {
            getProfile();
        } else {
            jsonResponse(['error' => 'Acción no válida'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}

/**
 * Login de usuario
 */
function handleLogin($input) {
    if (!isset($input['email']) || !isset($input['password'])) {
        jsonResponse(['error' => 'Email y password son requeridos'], 400);
    }
    
    $email = trim($input['email']);
    $password = $input['password'];
    
    if (!isValidEmail($email)) {
        jsonResponse(['error' => 'Email no válido'], 400);
    }
    
    $db = getDB();
    
    // Buscar usuario
    $stmt = $db->prepare("SELECT id, email, password_hash, role, is_admin FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        jsonResponse(['error' => 'Credenciales inválidas'], 401);
    }
    
    // Crear sesión
    $sessionId = generateUUID();
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
    
    $stmt = $db->prepare("INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)");
    $stmt->execute([$sessionId, $user['id'], $token, $expiresAt]);
    
    // Iniciar sesión PHP
    session_start();
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['token'] = $token;
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'is_admin' => (bool)$user['is_admin']
        ],
        'session' => [
            'token' => $token,
            'expires_at' => $expiresAt
        ]
    ]);
}

/**
 * Registro de nuevo usuario
 */
function handleRegister($input) {
    if (!isset($input['email']) || !isset($input['password'])) {
        jsonResponse(['error' => 'Email y password son requeridos'], 400);
    }
    
    $email = trim($input['email']);
    $password = $input['password'];
    
    if (!isValidEmail($email)) {
        jsonResponse(['error' => 'Email no válido'], 400);
    }
    
    if (strlen($password) < 6) {
        jsonResponse(['error' => 'El password debe tener al menos 6 caracteres'], 400);
    }
    
    $db = getDB();
    
    // Verificar si el usuario ya existe
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'El email ya está registrado'], 409);
    }
    
    // Crear usuario
    $userId = generateUUID();
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);
    
    $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, 'user')");
    $stmt->execute([$userId, $email, $passwordHash]);
    
    // Crear sesión automática
    $sessionId = generateUUID();
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);
    
    $stmt = $db->prepare("INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)");
    $stmt->execute([$sessionId, $userId, $token, $expiresAt]);
    
    session_start();
    $_SESSION['user_id'] = $userId;
    $_SESSION['token'] = $token;
    
    jsonResponse([
        'success' => true,
        'user' => [
            'id' => $userId,
            'email' => $email,
            'role' => 'user',
            'is_admin' => false
        ],
        'session' => [
            'token' => $token,
            'expires_at' => $expiresAt
        ]
    ], 201);
}

/**
 * Logout
 */
function handleLogout() {
    session_start();
    
    if (isset($_SESSION['token'])) {
        $db = getDB();
        $stmt = $db->prepare("DELETE FROM sessions WHERE token = ?");
        $stmt->execute([$_SESSION['token']]);
    }
    
    session_destroy();
    
    jsonResponse(['success' => true, 'message' => 'Sesión cerrada']);
}

/**
 * Verificar sesión activa
 */
function checkSession() {
    session_start();
    
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
        jsonResponse(['authenticated' => false], 401);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.email, u.role, u.is_admin 
        FROM users u
        INNER JOIN sessions s ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$_SESSION['token']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        session_destroy();
        jsonResponse(['authenticated' => false], 401);
    }
    
    jsonResponse([
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'is_admin' => (bool)$user['is_admin']
        ]
    ]);
}

/**
 * Obtener perfil del usuario autenticado
 */
function getProfile() {
    session_start();
    
    if (!isset($_SESSION['user_id'])) {
        jsonResponse(['error' => 'No autenticado'], 401);
    }
    
    $db = getDB();
    $stmt = $db->prepare("SELECT id, email, role, is_admin, created_at FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['error' => 'Usuario no encontrado'], 404);
    }
    
    jsonResponse([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'is_admin' => (bool)$user['is_admin'],
        'created_at' => $user['created_at']
    ]);
}
