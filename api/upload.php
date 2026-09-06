<?php
// api/upload.php - Local Image Upload Handler
session_start();
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No image file uploaded or upload error occurred.']);
    exit;
}

$file = $_FILES['image'];
$allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

if (!in_array($ext, $allowed_extensions)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid file format. Allowed: JPG, PNG, GIF, WEBP, SVG.']);
    exit;
}

// Max 5MB file size
if ($file['size'] > 5 * 1024 * 1024) {
    echo json_encode(['status' => 'error', 'message' => 'File size exceeds 5MB limit.']);
    exit;
}

$uploads_dir = __DIR__ . '/../uploads';
if (!file_exists($uploads_dir)) {
    mkdir($uploads_dir, 0777, true);
}

$new_filename = 'img_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$target_path = $uploads_dir . '/' . $new_filename;

if (move_uploaded_file($file['tmp_name'], $target_path)) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8088';
    
    // Relative URL for seamless environment support
    $image_url = 'uploads/' . $new_filename;

    echo json_encode([
        'status' => 'success',
        'message' => 'Image uploaded successfully!',
        'image_url' => $image_url
    ]);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save uploaded image.']);
}
