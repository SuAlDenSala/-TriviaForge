<?php
// api/submit_answer.php - Live score calculation & answer validation endpoint
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = get_db();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true) ?? $_POST;

$quiz_id = intval($data['quiz_id'] ?? 0);
$question_id = intval($data['question_id'] ?? 0);
$selected_option = intval($data['selected_option'] ?? -1); // -1 = timeout
$time_spent_ms = intval($data['time_spent_ms'] ?? 0);
if ($quiz_id > 0) {
    $_SESSION['last_play_quiz_' . $quiz_id] = time();
}

if ($question_id <= 0) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid question_id']);
    exit;
}

// Fetch correct answer from DB
$stmt = $pdo->prepare("
    SELECT q.correct_option, q.points, q.explanation, qz.time_per_question 
    FROM questions q
    JOIN quizzes qz ON q.quiz_id = qz.id
    WHERE q.id = ?
");
$stmt->execute([$question_id]);
$item = $stmt->fetch();

if (!$item) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Question not found']);
    exit;
}

$correct_option = intval($item['correct_option']);
$base_points = intval($item['points']);
$total_time_ms = intval($item['time_per_question']) * 1000;
$explanation = $item['explanation'];

$is_correct = ($selected_option === $correct_option);

$points_earned = 0;
$speed_bonus = 0;
$streak_multiplier = 1.0;
$new_streak = 0;

if ($is_correct) {
    $new_streak = $current_streak + 1;
    
    // Calculate speed bonus (up to 50% bonus if answered in < 25% of time limit)
    $remaining_time_ms = max(0, $total_time_ms - $time_spent_ms);
    $time_ratio = $total_time_ms > 0 ? ($remaining_time_ms / $total_time_ms) : 0;
    $speed_bonus = round($base_points * 0.5 * $time_ratio);

    // Calculate streak multiplier (+10% per streak up to +100% max)
    $bonus_multiplier = min(1.0, ($new_streak - 1) * 0.1);
    $streak_multiplier = round(1.0 + $bonus_multiplier, 2);

    $points_earned = round(($base_points + $speed_bonus) * $streak_multiplier);
} else {
    $new_streak = 0;
}

echo json_encode([
    'status' => 'success',
    'is_correct' => $is_correct,
    'selected_option' => $selected_option,
    'correct_option' => $correct_option,
    'base_points' => $base_points,
    'speed_bonus' => $speed_bonus,
    'streak_multiplier' => $streak_multiplier,
    'new_streak' => $new_streak,
    'points_earned' => $points_earned,
    'explanation' => $explanation ?: ($is_correct ? 'Great job!' : 'Better luck next question!')
]);
