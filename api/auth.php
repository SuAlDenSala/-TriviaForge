<?php
// api/auth.php - Authentication API (Register, Login, Session Check, Logout)
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = get_db();
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'session':
        handle_check_session($pdo);
        break;
    case 'register':
        handle_register($pdo);
        break;
    case 'login':
        handle_login($pdo);
        break;
    case 'logout':
        handle_logout();
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}

function handle_check_session($pdo) {
    if (isset($_SESSION['user_id'])) {
        $stmt = $pdo->prepare("SELECT id, username, email, avatar_icon, created_at FROM users WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode(['status' => 'success', 'logged_in' => true, 'user' => $user]);
            return;
        }
    }
    echo json_encode(['status' => 'success', 'logged_in' => false, 'user' => null]);
}

function handle_register($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;
    
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $avatar = trim($data['avatar_icon'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80');

    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Username, Email, and Password are required.']);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email address format.']);
        return;
    }

    // Check if exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Username or Email is already taken.']);
        return;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $insert = $pdo->prepare("INSERT INTO users (username, email, password_hash, avatar_icon) VALUES (?, ?, ?, ?)");
    $insert->execute([$username, $email, $hash, $avatar]);
    
    $new_id = $pdo->lastInsertId();
    $_SESSION['user_id'] = $new_id;
    $_SESSION['username'] = $username;

    echo json_encode([
        'status' => 'success',
        'message' => 'Registration successful!',
        'user' => [
            'id' => $new_id,
            'username' => $username,
            'email' => $email,
            'avatar_icon' => $avatar
        ]
    ]);
}

function handle_login($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;

    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Please enter username/email and password.']);
        return;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];

        unset($user['password_hash']);
        echo json_encode([
            'status' => 'success',
            'message' => 'Logged in successfully!',
            'user' => $user
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid username or password.']);
    }
}

function handle_logout() {
    session_destroy();
    echo json_encode(['status' => 'success', 'message' => 'Logged out successfully.']);
}
