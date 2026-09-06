<?php
// Clean up duplicate leaderboard entries keeping only max score per user per quiz
require_once __DIR__ . '/db.php';
$pdo = get_db();

// Fetch all entries
$stmt = $pdo->query("SELECT id, quiz_id, user_id, player_name, score, total_time FROM leaderboard ORDER BY score DESC, total_time ASC");
$rows = $stmt->fetchAll();

$seen_user_quiz = [];
$keep_ids = [];

foreach ($rows as $r) {
    $user_key = $r['user_id'] ? 'user_' . $r['user_id'] : 'name_' . strtolower(trim($r['player_name']));
    $key = $user_key . '_quiz_' . $r['quiz_id'];
    if (!isset($seen_user_quiz[$key])) {
        $seen_user_quiz[$key] = true;
        $keep_ids[] = $r['id'];
    }
}

if (!empty($keep_ids)) {
    $in_clause = implode(',', array_map('intval', $keep_ids));
    $pdo->exec("DELETE FROM leaderboard WHERE id NOT IN ($in_clause)");
    echo "Duplicate leaderboard entries cleaned up! " . count($keep_ids) . " unique quiz high score entries remain.\n";
}

