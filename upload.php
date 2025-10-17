<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_TYPES', ['image/bmp', 'image/jpeg', 'image/png', 'image/tiff', 'application/pdf']);

// Response helper
function sendResponse($success, $message, $data = []) {
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message
    ], $data));
    exit();
}

// Ensure upload directory exists
if (!file_exists(UPLOAD_DIR)) {
    if (!mkdir(UPLOAD_DIR, 0755, true)) {
        sendResponse(false, 'Failed to create upload directory');
    }
}

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(false, 'Invalid request method');
}

// Check if file was uploaded
if (!isset($_FILES['document'])) {
    sendResponse(false, 'No file uploaded');
}

$file = $_FILES['document'];

// Check for upload errors
if ($file['error'] !== UPLOAD_ERR_OK) {
    $errors = [
        UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
        UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE',
        UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
        UPLOAD_ERR_NO_FILE => 'No file was uploaded',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
        UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
    ];

    $errorMessage = isset($errors[$file['error']]) ? $errors[$file['error']] : 'Unknown upload error';
    sendResponse(false, $errorMessage);
}

// Validate file size
if ($file['size'] > MAX_FILE_SIZE) {
    sendResponse(false, 'File size exceeds maximum allowed size (10MB)');
}

// Validate file type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, ALLOWED_TYPES)) {
    sendResponse(false, 'Invalid file type. Allowed types: BMP, JPEG, PNG, TIFF, PDF');
}

// Generate unique filename
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
if (empty($extension)) {
    // Determine extension from MIME type
    $mimeToExt = [
        'image/bmp' => 'bmp',
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/tiff' => 'tiff',
        'application/pdf' => 'pdf'
    ];
    $extension = isset($mimeToExt[$mimeType]) ? $mimeToExt[$mimeType] : 'bin';
}

$filename = 'scan_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.' . $extension;
$filepath = UPLOAD_DIR . $filename;

// Move uploaded file
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    sendResponse(false, 'Failed to save file');
}

// Set proper permissions
chmod($filepath, 0644);

// Log the upload (optional)
$logFile = UPLOAD_DIR . 'upload_log.txt';
$logEntry = sprintf(
    "[%s] File: %s, Size: %d bytes, Type: %s, IP: %s\n",
    date('Y-m-d H:i:s'),
    $filename,
    $file['size'],
    $mimeType,
    $_SERVER['REMOTE_ADDR'] ?? 'unknown'
);
file_put_contents($logFile, $logEntry, FILE_APPEND);

// Return success response
sendResponse(true, 'File uploaded successfully', [
    'filename' => $filename,
    'size' => $file['size'],
    'type' => $mimeType,
    'url' => 'uploads/' . $filename
]);
?>
