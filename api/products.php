<?php
/**
 * API de Productos - Credihogar
 * Endpoints: /api/products.php
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getProduct($_GET['id']);
        } else {
            getProducts();
        }
        break;
        
    case 'POST':
        createProduct();
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateProduct($_GET['id']);
        } else {
            jsonResponse(['error' => 'ID de producto requerido'], 400);
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteProduct($_GET['id']);
        } else {
            jsonResponse(['error' => 'ID de producto requerido'], 400);
        }
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}

/**
 * Verificar autenticación
 */
function requireAuth() {
    session_start();
    
    if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
        jsonResponse(['error' => 'No autenticado'], 401);
    }
    
    $db = getDB();
    $stmt = $db->prepare("
        SELECT u.id, u.is_admin 
        FROM users u
        INNER JOIN sessions s ON s.user_id = u.id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    $stmt->execute([$_SESSION['token']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        session_destroy();
        jsonResponse(['error' => 'Sesión expirada'], 401);
    }
    
    return $user;
}

/**
 * Obtener todos los productos
 */
function getProducts() {
    $db = getDB();
    
    // Filtros opcionales
    $category = $_GET['category'] ?? null;
    $search = $_GET['search'] ?? null;
    
    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];
    
    if ($category && $category !== 'all') {
        $sql .= " AND category = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $sql .= " AND (name LIKE ? OR description LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll();
    
    // Convertir precio a número
    foreach ($products as &$product) {
        $product['price'] = (float)$product['price'];
    }
    
    jsonResponse($products);
}

/**
 * Obtener un producto específico
 */
function getProduct($id) {
    $db = getDB();
    $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        jsonResponse(['error' => 'Producto no encontrado'], 404);
    }
    
    $product['price'] = (float)$product['price'];
    
    jsonResponse($product);
}

/**
 * Crear nuevo producto
 */
function createProduct() {
    $user = requireAuth();
    
    $input = getJsonInput();
    
    if (!isset($input['name']) || !isset($input['price'])) {
        jsonResponse(['error' => 'Nombre y precio son requeridos'], 400);
    }
    
    $db = getDB();
    
    $id = generateUUID();
    $name = trim($input['name']);
    $description = trim($input['description'] ?? '');
    $price = (float)$input['price'];
    $category = trim($input['category'] ?? '');
    $imageUrl = trim($input['image_url'] ?? '');
    
    $stmt = $db->prepare("
        INSERT INTO products (id, name, description, price, category, image_url, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([$id, $name, $description, $price, $category, $imageUrl, $user['id']]);
    
    jsonResponse([
        'success' => true,
        'id' => $id,
        'message' => 'Producto creado exitosamente'
    ], 201);
}

/**
 * Actualizar producto
 */
function updateProduct($id) {
    $user = requireAuth();
    
    $db = getDB();
    
    // Verificar que el producto existe
    $stmt = $db->prepare("SELECT owner_id FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        jsonResponse(['error' => 'Producto no encontrado'], 404);
    }
    
    // Verificar permisos (owner o admin)
    if ($product['owner_id'] !== $user['id'] && !$user['is_admin']) {
        jsonResponse(['error' => 'No tienes permiso para editar este producto'], 403);
    }
    
    $input = getJsonInput();
    
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = isset($input['price']) ? (float)$input['price'] : null;
    $category = trim($input['category'] ?? '');
    $imageUrl = trim($input['image_url'] ?? '');
    
    $updates = [];
    $params = [];
    
    if ($name) {
        $updates[] = "name = ?";
        $params[] = $name;
    }
    
    if (isset($input['description'])) {
        $updates[] = "description = ?";
        $params[] = $description;
    }
    
    if ($price !== null) {
        $updates[] = "price = ?";
        $params[] = $price;
    }
    
    if ($category) {
        $updates[] = "category = ?";
        $params[] = $category;
    }
    
    if (isset($input['image_url'])) {
        $updates[] = "image_url = ?";
        $params[] = $imageUrl;
    }
    
    if (empty($updates)) {
        jsonResponse(['error' => 'No hay datos para actualizar'], 400);
    }
    
    $params[] = $id;
    $sql = "UPDATE products SET " . implode(", ", $updates) . " WHERE id = ?";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    jsonResponse([
        'success' => true,
        'message' => 'Producto actualizado exitosamente'
    ]);
}

/**
 * Eliminar producto
 */
function deleteProduct($id) {
    $user = requireAuth();
    
    $db = getDB();
    
    // Verificar que el producto existe
    $stmt = $db->prepare("SELECT owner_id, image_url FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    
    if (!$product) {
        jsonResponse(['error' => 'Producto no encontrado'], 404);
    }
    
    // Verificar permisos (owner o admin)
    if ($product['owner_id'] !== $user['id'] && !$user['is_admin']) {
        jsonResponse(['error' => 'No tienes permiso para eliminar este producto'], 403);
    }
    
    // Eliminar imagen física si existe
    if ($product['image_url']) {
        $imagePath = '../' . $product['image_url'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }
    
    // Eliminar producto
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Producto eliminado exitosamente'
    ]);
}
