<?php
// api/leaderboard.php - Single Leaderboard Entry per User API
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$pdo = get_db();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
    handle_submit_score($pdo);
} else {
    handle_get_leaderboard($pdo);
}

function handle_get_leaderboard($pdo) {
    $quiz_id = isset($_GET['quiz_id']) ? intval($_GET['quiz_id']) : 0;
    $timeframe = isset($_GET['timeframe']) ? trim($_GET['timeframe']) : 'all';

    // Fetch highest score per user per quiz
    $sql = "
        SELECT l.id, l.quiz_id, l.user_id, l.player_name, l.score, l.accuracy, 
               l.total_time, l.streak_max, l.created_at,
               q.title as quiz_title, q.category,
               COALESCE(u.avatar_icon, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80') as avatar_icon
        FROM leaderboard l
        JOIN quizzes q ON l.quiz_id = q.id
        INNER JOIN users u ON l.user_id = u.id
        WHERE l.user_id IS NOT NULL
    ";
    $params = [];

    if ($quiz_id > 0) {
        $sql .= " AND l.quiz_id = ?";
        $params[] = $quiz_id;
    }

    if ($timeframe === 'today') {
        $sql .= " AND DATE(l.created_at) = CURDATE()";
    } elseif ($timeframe === 'week') {
        $sql .= " AND l.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    }

    $sql .= " ORDER BY l.score DESC, l.accuracy DESC, l.total_time ASC LIMIT 50";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // Top 3 Podium vs Rest
    $podium = array_slice($rows, 0, 3);

    echo json_encode([
        'status' => 'success',
        'podium' => $podium,
        'leaderboard' => $rows
    ]);
}

function handle_submit_score($pdo) {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;

    $quiz_id = intval($data['quiz_id'] ?? 0);
    $player_name = trim($data['player_name'] ?? '');
    $score = intval($data['score'] ?? 0);
    $accuracy = floatval($data['accuracy'] ?? 0);
    $total_time = intval($data['total_time'] ?? 0);
    $streak_max = intval($data['streak_max'] ?? 0);

    if ($quiz_id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid quiz_id']);
        return;
    }

    $user_id = $_SESSION['user_id'] ?? null;
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authentication required to save scores. Please log in.']);
        return;
    }

    $player_name = $_SESSION['username'] ?? 'Player';
    $clean_name = substr($player_name, 0, 50);

    // Check if entry already exists for this logged in user FOR THIS SPECIFIC QUIZ
    $check = $pdo->prepare("SELECT id, score FROM leaderboard WHERE user_id = ? AND quiz_id = ?");
    $check->execute([$user_id, $quiz_id]);

    $existing = $check->fetch();

    if ($existing) {
        // Update existing record ONLY if new score is higher for this quiz
        if ($score >= $existing['score']) {
            $update = $pdo->prepare("
                UPDATE leaderboard 
                SET player_name = ?, score = ?, accuracy = ?, total_time = ?, streak_max = ?, created_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ");
            $update->execute([
                $clean_name,
                max(0, $score),
                max(0, min(100, $accuracy)),
                max(0, $total_time),
                max(0, $streak_max),
                $existing['id']
            ]);
        }
        $rank_entry_id = $existing['id'];
    } else {
        // Insert new high score entry for this user and this quiz
        $insert = $pdo->prepare("
            INSERT INTO leaderboard (quiz_id, user_id, player_name, score, accuracy, total_time, streak_max)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $insert->execute([
            $quiz_id,
            $user_id,
            $clean_name,
            max(0, $score),
            max(0, min(100, $accuracy)),
            max(0, $total_time),
            max(0, $streak_max)
        ]);
        $rank_entry_id = $pdo->lastInsertId();
    }

    // Calculate rank for this specific quiz
    $rank_stmt = $pdo->prepare("SELECT COUNT(*) + 1 as rank FROM leaderboard WHERE quiz_id = ? AND score > ?");
    $rank_stmt->execute([$quiz_id, $score]);
    $rank = $rank_stmt->fetch()['rank'];

    echo json_encode([
        'status' => 'success',
        'message' => 'Score saved successfully!',
        'rank' => intval($rank),
        'score' => $score
    ]);
}
