<?php
/**
 * Configuración de Base de Datos MySQL - Credihogar (EJEMPLO)
 * 
 * IMPORTANTE: 
 * 1. Copia este archivo como config.php
 * 2. Modifica los valores con tus credenciales reales
 * 3. NO subas config.php al repositorio (está en .gitignore)
 */

// Configuración de base de datos
define('DB_HOST', 'localhost');           // Tu host MySQL (localhost o IP del servidor)
define('DB_NAME', 'credihogar_db');       // Nombre de tu base de datos
define('DB_USER', 'tu_usuario');          // Usuario MySQL
define('DB_PASS', 'tu_password');         // Password MySQL
define('DB_CHARSET', 'utf8mb4');

// Configuración de sesiones y seguridad
// GENERAR UNA CLAVE ÚNICA Y ALEATORIA AQUÍ
define('JWT_SECRET', 'CAMBIAR_POR_CLAVE_SEGURA_' . bin2hex(random_bytes(32)));
define('SESSION_LIFETIME', 86400); // 24 horas

// Configuración de uploads
define('UPLOAD_DIR', '../uploads/products/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// URL base del sitio (sin barra al final)
// CAMBIAR POR TU DOMINIO REAL
define('BASE_URL', 'https://tudominio.com');

// CORS - Dominios permitidos
$allowed_origins = [
    'https://tudominio.com',
    'http://localhost',
    'http://localhost:8080'
];

// ======================================
// NO MODIFICAR DESDE AQUÍ
// ======================================

header('Content-Type: application/json; charset=utf-8');

$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function getDB() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Error de conexión a base de datos: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Error de conexión a base de datos']);
            exit();
        }
    }
    
    return $pdo;
}

function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}

function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}
