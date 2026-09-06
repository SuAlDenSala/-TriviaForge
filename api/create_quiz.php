<?php
// api/create_quiz.php - Custom quiz builder endpoint with bulk question support
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
$data = json_decode($raw, true);

if (!$data) {
    $data = $_POST;
}

$title = trim($data['title'] ?? '');
$description = trim($data['description'] ?? '');
$category = trim($data['category'] ?? 'General');
$difficulty = trim($data['difficulty'] ?? 'Medium');
$banner_url = trim($data['banner_url'] ?? '');
$time_per_question = intval($data['time_per_question'] ?? 15);
$questions = $data['questions'] ?? [];

if (empty($title)) {
    echo json_encode(['status' => 'error', 'message' => 'Quiz title is required.']);
    exit;
}

if (!is_array($questions) || count($questions) < 1) {
    echo json_encode(['status' => 'error', 'message' => 'At least 1 question is required to create a quiz.']);
    exit;
}

// Fallback banner image if empty
if (empty($banner_url)) {
    $default_banners = [
        'Web Dev' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        'Science' => 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
        'History' => 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80',
        'Cyber Sec' => 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
        'Gaming' => 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
        'AI & ML' => 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
        'Movies & Culture' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        'Geography' => 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
        'Mathematics' => 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
        'Anime & Manga' => 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    ];
    $banner_url = $default_banners[$category] ?? 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';
}

$target_quiz_id = intval($data['quiz_id'] ?? $data['id'] ?? 0);
$user_id = $_SESSION['user_id'] ?? null;

if ($target_quiz_id > 0) {
    $stmt_check = $pdo->prepare("SELECT user_id FROM quizzes WHERE id = ?");
    $stmt_check->execute([$target_quiz_id]);
    $existing = $stmt_check->fetch();

    if (!$existing) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Quiz not found.']);
        exit;
    }

    // Strict ownership verification: only the logged in creator can edit their published quiz
    if (!empty($existing['user_id']) && intval($existing['user_id']) !== intval($user_id)) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You can only edit quizzes that you published.']);
        exit;
    }
}

try {
    $pdo->beginTransaction();

    if ($target_quiz_id > 0) {
        $stmt_quiz = $pdo->prepare("
            UPDATE quizzes
            SET title = ?, description = ?, category = ?, difficulty = ?, banner_url = ?, time_per_question = ?
            WHERE id = ?
        ");
        $stmt_quiz->execute([
            $title,
            $description,
            $category,
            $difficulty,
            $banner_url,
            max(5, min(120, $time_per_question)),
            $target_quiz_id
        ]);
        $quiz_id = $target_quiz_id;

        // Clear existing questions to replace with updated list
        $stmt_del = $pdo->prepare("DELETE FROM questions WHERE quiz_id = ?");
        $stmt_del->execute([$quiz_id]);
    } else {
        $stmt_quiz = $pdo->prepare("
            INSERT INTO quizzes (user_id, title, description, category, difficulty, banner_url, time_per_question)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt_quiz->execute([
            $user_id,
            $title,
            $description,
            $category,
            $difficulty,
            $banner_url,
            max(5, min(120, $time_per_question))
        ]);

        $quiz_id = $pdo->lastInsertId();
    }

    $stmt_q = $pdo->prepare("
        INSERT INTO questions (quiz_id, question_text, image_url, option_a, option_b, option_c, option_d, correct_option, points, explanation)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    foreach ($questions as $q) {
        $q_text = trim($q['question_text'] ?? '');
        $img_url = trim($q['image_url'] ?? '') ?: null;
        $opt_a = trim($q['option_a'] ?? '');
        $opt_b = trim($q['option_b'] ?? '');
        $opt_c = trim($q['option_c'] ?? '');
        $opt_d = trim($q['option_d'] ?? '');
        $correct = intval($q['correct_option'] ?? 0);
        $pts = intval($q['points'] ?? 100);
        $expl = trim($q['explanation'] ?? '') ?: null;

        if (empty($q_text) || empty($opt_a) || empty($opt_b)) {
            continue; // Skip incomplete question rows
        }

        $stmt_q->execute([
            $quiz_id,
            $q_text,
            $img_url,
            $opt_a,
            $opt_b,
            $opt_c ?: 'None of the above',
            $opt_d ?: 'All of the above',
            max(0, min(3, $correct)),
            max(10, min(1000, $pts)),
            $expl
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => $target_quiz_id > 0 ? 'Quiz updated successfully!' : 'Quiz created successfully!',
        'quiz_id' => $quiz_id
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to save quiz: ' . $e->getMessage()]);
}
