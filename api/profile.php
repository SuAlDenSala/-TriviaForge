<?php
// api/profile.php - User Profile Stats & Avatar Update Endpoint
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = get_db();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please log in to view profile.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_GET['action'] ?? $_POST['action'] ?? 'get';

if ($action === 'get') {
    // Fetch user details
    $stmt = $pdo->prepare("SELECT id, username, email, avatar_icon, created_at FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        exit;
    }

    // Fetch lifetime stats from leaderboard table
    $stats_stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_plays,
            COALESCE(SUM(score), 0) as total_score,
            COALESCE(MAX(score), 0) as high_score,
            COALESCE(MAX(streak_max), 0) as max_streak,
            COALESCE(AVG(accuracy), 0) as avg_accuracy
        FROM leaderboard 
        WHERE user_id = ?
    ");
    $stats_stmt->execute([$user_id]);
    $stats = $stats_stmt->fetch();

    // Fetch user's recent scores
    $recent_stmt = $pdo->prepare("
        SELECT l.score, l.accuracy, l.total_time, l.streak_max, l.created_at, q.title as quiz_title
        FROM leaderboard l
        JOIN quizzes q ON l.quiz_id = q.id
        WHERE l.user_id = ?
        ORDER BY l.created_at DESC
        LIMIT 5
    ");
    $recent_stmt->execute([$user_id]);
    $recent = $recent_stmt->fetchAll();

    // Fetch user's created/published quizzes
    $created_stmt = $pdo->prepare("
        SELECT id, title, category, difficulty, banner_url, created_at,
               (SELECT COUNT(*) FROM questions WHERE quiz_id = quizzes.id) as question_count,
               (SELECT COUNT(*) FROM leaderboard WHERE quiz_id = quizzes.id) as play_count
        FROM quizzes
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $created_stmt->execute([$user_id]);
    $created_quizzes = $created_stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'user' => $user,
        'stats' => [
            'total_plays' => intval($stats['total_plays']),
            'total_score' => intval($stats['total_score']),
            'high_score' => intval($stats['high_score']),
            'max_streak' => intval($stats['max_streak']),
            'avg_accuracy' => round(floatval($stats['avg_accuracy']), 1)
        ],
        'recent_history' => $recent,
        'created_quizzes' => $created_quizzes
    ]);
} elseif ($action === 'update_profile' || $action === 'update_avatar') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;

    $username = trim($data['username'] ?? '');
    $avatar_icon = trim($data['avatar_icon'] ?? '');

    if (empty($avatar_icon) && empty($username)) {
        echo json_encode(['status' => 'error', 'message' => 'Profile details cannot be empty.']);
        exit;
    }

    // If username provided, validate uniqueness
    if (!empty($username)) {
        $check_stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $check_stmt->execute([$username, $user_id]);
        if ($check_stmt->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'Username is already taken by another user.']);
            exit;
        }

        $_SESSION['username'] = $username;

        // Update player_name in leaderboard for this user
        $lb_stmt = $pdo->prepare("UPDATE leaderboard SET player_name = ? WHERE user_id = ?");
        $lb_stmt->execute([$username, $user_id]);
    }

    // Get current values if one is omitted
    $cur_stmt = $pdo->prepare("SELECT username, avatar_icon FROM users WHERE id = ?");
    $cur_stmt->execute([$user_id]);
    $cur = $cur_stmt->fetch();

    $new_username = !empty($username) ? $username : $cur['username'];
    $new_avatar = !empty($avatar_icon) ? $avatar_icon : $cur['avatar_icon'];

    $stmt = $pdo->prepare("UPDATE users SET username = ?, avatar_icon = ? WHERE id = ?");
    $stmt->execute([$new_username, $new_avatar, $user_id]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Profile updated successfully!',
        'user' => [
            'id' => $user_id,
            'username' => $new_username,
            'avatar_icon' => $new_avatar
        ]
    ]);
} elseif ($action === 'update_password') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;

    $current_password = $data['current_password'] ?? '';
    $new_password = $data['new_password'] ?? '';

    if (empty($current_password) || empty($new_password)) {
        echo json_encode(['status' => 'error', 'message' => 'Both current and new passwords are required.']);
        exit;
    }

    if (strlen($new_password) < 4) {
        echo json_encode(['status' => 'error', 'message' => 'New password must be at least 4 characters long.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($current_password, $user['password_hash'])) {
        echo json_encode(['status' => 'error', 'message' => 'Current password is incorrect.']);
        exit;
    }

    $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
    $up_stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $up_stmt->execute([$new_hash, $user_id]);

    echo json_encode(['status' => 'success', 'message' => 'Password updated successfully!']);
} elseif ($action === 'delete_account') {
    $del_stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $del_stmt->execute([$user_id]);

    unset($_SESSION['user_id']);
    unset($_SESSION['username']);
    session_destroy();

    echo json_encode([
        'status' => 'success',
        'message' => 'Your account has been permanently deleted.'
    ]);
}

