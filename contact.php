<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');
ini_set('display_errors', '0');
session_set_cookie_params(['httponly' => true, 'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'samesite' => 'Strict']);
session_start();

function respond(int $code, string $message): void {
    http_response_code($code);
    echo json_encode(['message' => $message]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method === 'GET') {
    $_SESSION['contact_csrf'] ??= bin2hex(random_bytes(32));
    $_SESSION['contact_started'] ??= time();
    echo json_encode(['csrf' => $_SESSION['contact_csrf']]);
    exit;
}
if ($method !== 'POST') {
    header('Allow: GET, POST');
    respond(405, 'Method not allowed.');
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) respond(413, 'Message is too large.');
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, ['https://robodev.online', 'https://www.robodev.online', 'http://robodev.online', 'http://www.robodev.online'], true)) {
    respond(403, 'Please submit from the RoboDev website.');
}
foreach (['csrf', 'name', 'email', 'message', 'website'] as $field) {
    if (!isset($_POST[$field]) || !is_string($_POST[$field])) respond(400, 'Please complete the form.');
}
if (!isset($_SESSION['contact_csrf']) || !hash_equals($_SESSION['contact_csrf'], $_POST['csrf'])) {
    respond(403, 'Your session expired. Reload the page and try again.');
}
if ($_POST['website'] !== '' || time() - (int) ($_SESSION['contact_started'] ?? time()) < 2) {
    respond(400, 'Please wait a moment and try again.');
}
$name = trim($_POST['name']);
$email = trim($_POST['email']);
$message = trim($_POST['message']);
if ($name === '' || strlen($name) > 100 || preg_match('/[\x00-\x1F\x7F]/', $name) || strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email) || strlen($message) < 10 || strlen($message) > 5000 || strpos($message, "\0") !== false) {
    respond(422, 'Enter a valid name, email address and a message of 10–5,000 characters.');
}

// Store only a hashed IP and attempt timestamps outside the public web root.
$directory = sys_get_temp_dir() . '/robodev-contact-rate';
if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) respond(503, 'Please email kevintootill@hotmail.com while the form is unavailable.');
$rateFile = $directory . '/' . hash('sha256', 'robodev.online:' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$handle = @fopen($rateFile, 'c+');
if (!$handle || !flock($handle, LOCK_EX)) respond(503, 'The form is temporarily unavailable.');
$attempts = json_decode(stream_get_contents($handle), true);
$attempts = is_array($attempts) ? array_values(array_filter($attempts, fn($timestamp) => is_int($timestamp) && $timestamp > time() - 3600)) : [];
if (count($attempts) >= 5) {
    flock($handle, LOCK_UN);
    fclose($handle);
    respond(429, 'Too many messages. Please try again in an hour.');
}
$attempts[] = time();
rewind($handle);
ftruncate($handle, 0);
fwrite($handle, json_encode($attempts));
flock($handle, LOCK_UN);
fclose($handle);

$headers = [
    'From: RoboDev Website <website@robodev.online>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8'
];
$body = "New RoboDev website enquiry\n\nName: {$name}\nEmail: {$email}\n\n{$message}\n";
if (!mail('kevintootill@hotmail.com', 'RoboDev website enquiry', $body, implode("\r\n", $headers))) {
    respond(503, 'Unable to send right now. Please email kevintootill@hotmail.com.');
}
respond(200, 'Your message has been submitted. Thank you for getting in touch.');
