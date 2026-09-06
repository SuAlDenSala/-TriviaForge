<?php
// api/quizzes.php - Fetch quizzes list or quiz details with 1-hour cooldown support
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = get_db();
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$difficulty = isset($_GET['difficulty']) ? trim($_GET['difficulty']) : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$user_id = $_SESSION['user_id'] ?? null;

// Quiz Deletion Handler
if ($_SERVER['REQUEST_METHOD'] === 'POST' && (($_GET['action'] ?? $_POST['action'] ?? '') === 'delete')) {
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Please log in to delete quizzes.']);
        exit;
    }

    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;
    $quiz_id = intval($data['quiz_id'] ?? $data['id'] ?? 0);

    if ($quiz_id <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid quiz ID.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT user_id FROM quizzes WHERE id = ?");
    $stmt->execute([$quiz_id]);
    $quiz = $stmt->fetch();

    if (!$quiz) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Quiz not found.']);
        exit;
    }

    if (intval($quiz['user_id']) !== intval($user_id)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You can only delete quizzes that you published.']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        $pdo->prepare("DELETE FROM questions WHERE quiz_id = ?")->execute([$quiz_id]);
        $pdo->prepare("DELETE FROM leaderboard WHERE quiz_id = ?")->execute([$quiz_id]);
        $pdo->prepare("DELETE FROM quizzes WHERE id = ?")->execute([$quiz_id]);
        $pdo->commit();

        echo json_encode(['status' => 'success', 'message' => 'Quiz deleted successfully.']);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete quiz: ' . $e->getMessage()]);
    }
    exit;
}

function get_quiz_cooldown_sec($pdo, $quiz_id, $user_id) {
    $cooldown_limit = 3600; // 1 hour = 3600 seconds
    $last_play_time = 0;

    // Check PHP session first for recent play
    if (isset($_SESSION['last_play_quiz_' . $quiz_id])) {
        $last_play_time = max($last_play_time, intval($_SESSION['last_play_quiz_' . $quiz_id]));
    }

    // If logged in, check leaderboard DB for latest play
    if ($user_id > 0) {
        $stmt = $pdo->prepare("SELECT UNIX_TIMESTAMP(created_at) as play_ts FROM leaderboard WHERE quiz_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$quiz_id, $user_id]);
        $row = $stmt->fetch();
        if ($row && !empty($row['play_ts'])) {
            $last_play_time = max($last_play_time, intval($row['play_ts']));
        }
    }

    if ($last_play_time > 0) {
        $elapsed = time() - $last_play_time;
        if ($elapsed < $cooldown_limit) {
            return $cooldown_limit - $elapsed;
        }
    }
    return 0;
}

if ($id > 0) {
    // Single quiz detail
    $stmt = $pdo->prepare("
        SELECT q.*, u.username as creator_name, u.avatar_icon as creator_avatar,
               (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
               (SELECT COUNT(*) FROM leaderboard WHERE quiz_id = q.id) as play_count
        FROM quizzes q
        LEFT JOIN users u ON q.user_id = u.id
        WHERE q.id = ?
    ");
    $stmt->execute([$id]);
    $quiz = $stmt->fetch();

    if ($quiz) {
        $quiz['cooldown_sec'] = get_quiz_cooldown_sec($pdo, $id, $user_id);
        
        $stmt_qs = $pdo->prepare("
            SELECT id, question_text, image_url, option_a, option_b, option_c, option_d, correct_option, points, explanation
            FROM questions
            WHERE quiz_id = ?
            ORDER BY id ASC
        ");
        $stmt_qs->execute([$id]);
        $quiz['questions'] = $stmt_qs->fetchAll();

        echo json_encode(['status' => 'success', 'quiz' => $quiz]);
    } else {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Quiz not found']);
    }
} else {
    // List all quizzes
    $sql = "
        SELECT q.id, q.user_id, q.title, q.description, q.category, q.difficulty, q.banner_url, 
               q.time_per_question, q.created_at,
               COALESCE(u.username, 'Community') as creator_name,
               (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) as question_count,
               (SELECT COUNT(*) FROM leaderboard WHERE quiz_id = q.id) as play_count
        FROM quizzes q
        LEFT JOIN users u ON q.user_id = u.id
        WHERE 1=1
    ";
    $params = [];

    if (!empty($category) && $category !== 'All') {
        $sql .= " AND q.category = ?";
        $params[] = $category;
    }

    if (!empty($difficulty) && $difficulty !== 'All') {
        $sql .= " AND q.difficulty = ?";
        $params[] = $difficulty;
    }

    if (!empty($search)) {
        $sql .= " AND (q.title LIKE ? OR q.description LIKE ?)";
        $params[] = '%' . $search . '%';
        $params[] = '%' . $search . '%';
    }

    $sql .= " ORDER BY q.created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $quizzes = $stmt->fetchAll();

    foreach ($quizzes as &$q) {
        $q['cooldown_sec'] = get_quiz_cooldown_sec($pdo, intval($q['id']), $user_id);
    }
    unset($q);

    // Get categories count
    $cat_stmt = $pdo->query("SELECT category, COUNT(*) as count FROM quizzes GROUP BY category");
    $categories = $cat_stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'quizzes' => $quizzes,
        'categories' => $categories
    ]);
}
