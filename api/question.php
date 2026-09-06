<?php
// api/question.php - Timed AJAX question delivery endpoint
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = get_db();

$quiz_id = isset($_GET['quiz_id']) ? intval($_GET['quiz_id']) : 0;
$index = isset($_GET['index']) ? intval($_GET['index']) : 0;

session_start();
$user_id = $_SESSION['user_id'] ?? null;

if ($quiz_id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid quiz_id']);
    exit;
}

// Check 1-hour cooldown when attempting to start quiz (index 0)
if ($index === 0) {
    $cooldown_limit = 3600;
    $last_play_time = 0;
    if (isset($_SESSION['last_play_quiz_' . $quiz_id])) {
        $last_play_time = max($last_play_time, intval($_SESSION['last_play_quiz_' . $quiz_id]));
    }
    if ($user_id > 0) {
        $stmt_cd = $pdo->prepare("SELECT UNIX_TIMESTAMP(created_at) as play_ts FROM leaderboard WHERE quiz_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1");
        $stmt_cd->execute([$quiz_id, $user_id]);
        $cd_row = $stmt_cd->fetch();
        if ($cd_row && !empty($cd_row['play_ts'])) {
            $last_play_time = max($last_play_time, intval($cd_row['play_ts']));
        }
    }
    if ($last_play_time > 0) {
        $elapsed = time() - $last_play_time;
        if ($elapsed < $cooldown_limit) {
            $rem_sec = $cooldown_limit - $elapsed;
            $mins = ceil($rem_sec / 60);
            echo json_encode([
                'status' => 'cooldown',
                'cooldown_remaining' => $rem_sec,
                'message' => "Quiz Cooldown Active! You can play this quiz again in $mins minute" . ($mins > 1 ? 's' : '') . '.'
            ]);
            exit;
        }
    }
}

// Fetch quiz info
$stmt_quiz = $pdo->prepare("SELECT id, title, time_per_question FROM quizzes WHERE id = ?");
$stmt_quiz->execute([$quiz_id]);
$quiz = $stmt_quiz->fetch();

if (!$quiz) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Quiz not found']);
    exit;
}

// Fetch all questions for this quiz
$stmt_qs = $pdo->prepare("
    SELECT id, question_text, image_url, option_a, option_b, option_c, option_d, points 
    FROM questions 
    WHERE quiz_id = ? 
    ORDER BY id ASC
");
$stmt_qs->execute([$quiz_id]);
$all_questions = $stmt_qs->fetchAll();

$total_count = count($all_questions);

if ($total_count === 0) {
    echo json_encode(['status' => 'error', 'message' => 'This quiz has no questions.']);
    exit;
}

if ($index < 0 || $index >= $total_count) {
    echo json_encode([
        'status' => 'complete',
        'message' => 'Quiz completed!',
        'total_questions' => $total_count
    ]);
    exit;
}

$question = $all_questions[$index];

echo json_encode([
    'status' => 'success',
    'quiz_title' => $quiz['title'],
    'time_per_question' => intval($quiz['time_per_question']),
    'current_index' => $index,
    'total_questions' => $total_count,
    'question' => [
        'id' => intval($question['id']),
        'question_text' => $question['question_text'],
        'image_url' => $question['image_url'],
        'options' => [
            $question['option_a'],
            $question['option_b'],
            $question['option_c'],
            $question['option_d']
        ],
        'points' => intval($question['points'])
    ]
]);
