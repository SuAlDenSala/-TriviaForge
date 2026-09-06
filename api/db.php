<?php
// api/db.php - MySQL Only Database Connection
require_once __DIR__ . '/../config/db_config.php';

function get_db() {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    try {
        $dsn_no_db = sprintf("mysql:host=%s;port=%s;charset=%s", DB_HOST, DB_PORT, DB_CHARSET);
        $temp_pdo = new PDO($dsn_no_db, DB_USER, DB_PASS, $options);
        
        $dbname = DB_NAME;
        $temp_pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        
        $dsn = sprintf("mysql:host=%s;port=%s;dbname=%s;charset=%s", DB_HOST, DB_PORT, DB_NAME, DB_CHARSET);
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

        ensure_mysql_schema_initialized($pdo);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'MySQL Database Connection Failed: ' . $e->getMessage()
        ]);
        exit;
    }
}

function ensure_mysql_schema_initialized($pdo) {
    $stmt = $pdo->query("SHOW TABLES LIKE 'quizzes'");
    if ($stmt->rowCount() == 0) {
        $sql_file = __DIR__ . '/../schema.sql';
        if (file_exists($sql_file)) {
            $sql = file_get_contents($sql_file);
            $pdo->exec($sql);
        }
    }
}
