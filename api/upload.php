<?php
/**
 * API de Upload de Imágenes - Credihogar
 * Endpoint: /api/upload.php
 */

require_once 'config.php';

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Método no permitido'], 405);
}

// Verificar autenticación
session_start();

if (!isset($_SESSION['user_id']) || !isset($_SESSION['token'])) {
    jsonResponse(['error' => 'No autenticado'], 401);
}

$db = getDB();
$stmt = $db->prepare("
    SELECT u.id 
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

// Verificar que se subió un archivo
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMsg = isset($_FILES['image']) ? getUploadErrorMessage($_FILES['image']['error']) : 'No se subió ningún archivo';
    jsonResponse(['error' => $errorMsg], 400);
}

$file = $_FILES['image'];

// Validar tamaño
if ($file['size'] > MAX_FILE_SIZE) {
    jsonResponse(['error' => 'El archivo es demasiado grande. Máximo ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB'], 400);
}

// Validar tipo de archivo
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, ALLOWED_EXTENSIONS)) {
    jsonResponse(['error' => 'Tipo de archivo no permitido. Solo: ' . implode(', ', ALLOWED_EXTENSIONS)], 400);
}

// Validar que sea una imagen real
$imageInfo = getimagesize($file['tmp_name']);
if (!$imageInfo) {
    jsonResponse(['error' => 'El archivo no es una imagen válida'], 400);
}

// Generar nombre único
$filename = generateUUID() . '.' . $ext;
$uploadPath = UPLOAD_DIR . $filename;

// Crear directorio si no existe
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Mover archivo
if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
    jsonResponse(['error' => 'Error al guardar el archivo'], 500);
}

// Optimizar imagen (redimensionar si es muy grande)
optimizeImage($uploadPath, $imageInfo[0], $imageInfo[1]);

// URL relativa de la imagen
$imageUrl = 'uploads/products/' . $filename;

jsonResponse([
    'success' => true,
    'url' => $imageUrl,
    'full_url' => BASE_URL . '/' . $imageUrl,
    'filename' => $filename
], 201);

/**
 * Obtener mensaje de error de upload
 */
function getUploadErrorMessage($error) {
    switch ($error) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            return 'El archivo es demasiado grande';
        case UPLOAD_ERR_PARTIAL:
            return 'El archivo se subió parcialmente';
        case UPLOAD_ERR_NO_FILE:
            return 'No se subió ningún archivo';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Falta carpeta temporal';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Error al escribir el archivo';
        case UPLOAD_ERR_EXTENSION:
            return 'Upload bloqueado por extensión';
        default:
            return 'Error desconocido al subir archivo';
    }
}

/**
 * Optimizar imagen (redimensionar si es muy grande)
 */
function optimizeImage($path, $width, $height) {
    $maxWidth = 1200;
    $maxHeight = 1200;
    
    // Si la imagen es pequeña, no hacer nada
    if ($width <= $maxWidth && $height <= $maxHeight) {
        return;
    }
    
    // Calcular nuevo tamaño manteniendo proporción
    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = round($width * $ratio);
    $newHeight = round($height * $ratio);
    
    // Obtener tipo de imagen
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    
    // Crear imagen desde archivo
    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            $source = imagecreatefromjpeg($path);
            break;
        case 'png':
            $source = imagecreatefrompng($path);
            break;
        case 'gif':
            $source = imagecreatefromgif($path);
            break;
        case 'webp':
            $source = imagecreatefromwebp($path);
            break;
        default:
            return; // No soportado
    }
    
    if (!$source) {
        return;
    }
    
    // Crear nueva imagen
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Preservar transparencia para PNG y GIF
    if ($ext === 'png' || $ext === 'gif') {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Redimensionar
    imagecopyresampled($newImage, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    // Guardar imagen optimizada
    switch ($ext) {
        case 'jpg':
        case 'jpeg':
            imagejpeg($newImage, $path, 85); // Calidad 85%
            break;
        case 'png':
            imagepng($newImage, $path, 8); // Compresión nivel 8
            break;
        case 'gif':
            imagegif($newImage, $path);
            break;
        case 'webp':
            imagewebp($newImage, $path, 85);
            break;
    }
    
    // Liberar memoria
    imagedestroy($source);
    imagedestroy($newImage);
}
