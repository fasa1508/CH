<?php
/**
 * API de Categorías - Credihogar
 * Endpoint: /api/categories.php
 */

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        getCategories();
        break;
        
    default:
        jsonResponse(['error' => 'Método no permitido'], 405);
}

/**
 * Obtener todas las categorías
 */
function getCategories() {
    $db = getDB();
    $stmt = $db->query("SELECT * FROM categories ORDER BY name ASC");
    $categories = $stmt->fetchAll();
    
    jsonResponse($categories);
}
