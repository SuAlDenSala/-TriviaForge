-- ============================================================
-- Trivia Quiz Maker with Dynamic Leaderboards - Expanded MySQL Schema & Question Bank
-- ============================================================

CREATE DATABASE IF NOT EXISTS `trivia_quiz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `trivia_quiz_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar_icon` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100) NOT NULL DEFAULT 'General',
  `difficulty` ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  `banner_url` TEXT DEFAULT NULL,
  `time_per_question` INT DEFAULT 15,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `image_url` TEXT DEFAULT NULL,
  `option_a` VARCHAR(255) NOT NULL,
  `option_b` VARCHAR(255) NOT NULL,
  `option_c` VARCHAR(255) NOT NULL,
  `option_d` VARCHAR(255) NOT NULL,
  `correct_option` INT NOT NULL COMMENT '0 for A, 1 for B, 2 for C, 3 for D',
  `points` INT DEFAULT 100,
  `explanation` TEXT DEFAULT NULL,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Leaderboard Table
CREATE TABLE IF NOT EXISTS `leaderboard` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `user_id` INT DEFAULT NULL,
  `player_name` VARCHAR(100) NOT NULL,
  `score` INT NOT NULL DEFAULT 0,
  `accuracy` FLOAT DEFAULT 0,
  `total_time` INT DEFAULT 0,
  `streak_max` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed Demo Accounts
-- ============================================================
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `avatar_icon`) VALUES
(1, 'CyberMaster', 'demo@trivia.com', '$2y$10$wE9946pA27mYlC.bT1c9m.kE4Tq7/zK0PjW6.0E0V83818xG5X78G', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'),
(2, 'AstroNova', 'astro@trivia.com', '$2y$10$wE9946pA27mYlC.bT1c9m.kE4Tq7/zK0PjW6.0E0V83818xG5X78G', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'),
(3, 'CodeVixen', 'code@trivia.com', '$2y$10$wE9946pA27mYlC.bT1c9m.kE4Tq7/zK0PjW6.0E0V83818xG5X78G', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'),
(4, 'AiOverlord', 'ai@trivia.com', '$2y$10$wE9946pA27mYlC.bT1c9m.kE4Tq7/zK0PjW6.0E0V83818xG5X78G', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- ============================================================
-- Seed 8 Quizzes
-- ============================================================
INSERT INTO `quizzes` (`id`, `user_id`, `title`, `description`, `category`, `difficulty`, `banner_url`, `time_per_question`) VALUES
(1, 1, 'Full-Stack Web Engineering Mastery', 'Test your knowledge on JavaScript, CSS Grid, PHP PDO, SQL queries, DOM manipulation, and modern web architectures.', 'Web Dev', 'Medium', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', 15),
(2, 2, 'Astrophysics & Deep Space Exploration', 'From black hole event horizons to quantum gravity, cosmic microwave background, and interstellar probes.', 'Science', 'Hard', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 20),
(3, 3, 'World History, Ancient Civilizations & Myths', 'Journey through ancient Egypt, Greek mythology, the Silk Road, and pivotal historical battles.', 'History', 'Medium', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80', 15),
(4, 1, 'Cyber Security & Ethical Hacking', 'Uncover secrets of SQL injection, XSS defense, public key cryptography, network protocols, and zero-day exploits.', 'Cyber Sec', 'Hard', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 15),
(5, 2, 'Gaming Lore & Video Game Legends', 'From retro 8-bit arcade classics to open-world RPG legends and esports history.', 'Gaming', 'Easy', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', 12),
(6, 4, 'Artificial Intelligence & Machine Learning', 'Neural networks, transformer models, reinforcement learning, NLP, and computer vision fundamentals.', 'Web Dev', 'Hard', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80', 18),
(7, 3, 'Cinema & Pop Culture Trivia', 'Iconic movie quotes, Academy Award winners, legendary directors, and blockbuster soundtracks.', 'General', 'Easy', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', 12),
(8, 2, 'World Geography & Natural Wonders', 'Extreme peaks, mighty rivers, island nations, capitals, and natural phenomena across 7 continents.', 'General', 'Medium', 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', 15)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- ============================================================
-- Seed 60+ Questions
-- ============================================================

-- Quiz 1: Web Engineering
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(1, 'Which PHP PDO method is used to execute a prepared SQL query with bound parameters safely?', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80', 'PDO::query()', 'PDOStatement::execute()', 'PDO::commit()', 'PDOStatement::run()', 1, 100, 'PDOStatement::execute() executes a prepared statement safely.'),
(1, 'What CSS layout module is specifically designed for two-dimensional grid-based layouts?', NULL, 'Flexbox', 'CSS Grid', 'Float Layout', 'Position Relative', 1, 100, 'CSS Grid Layout is optimized for 2D layouts.'),
(1, 'In JavaScript, what does Promise.allSettled() return compared to Promise.all()?', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80', 'Rejects immediately if any promise rejects', 'Waits for all promises to fulfill or reject', 'Only resolves when fastest promise completes', 'Cancels remaining promises', 1, 100, 'Promise.allSettled() waits for all promises regardless of outcome.'),
(1, 'Which HTTP status code signifies "201 Created"?', NULL, '200 OK', '201 Created', '202 Accepted', '204 No Content', 1, 100, 'HTTP 201 Created indicates a new resource has been created.'),
(1, 'In modern JavaScript, what is the primary benefit of Event Delegation?', 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80', 'Accelerates CSS animations', 'Attaches a single listener to a parent to handle dynamic child events', 'Prevents API requests', 'Encrypts user input data', 1, 100, 'Event delegation uses event bubbling on a parent element.'),
(1, 'What is the purpose of localStorage in web browsers?', NULL, 'Expires when browser tab closes', 'Stores persistent key-value data with no expiration', 'Transmits session tokens automatically', 'Caches server-side PHP templates', 1, 100, 'localStorage stores persistent client-side data.'),
(1, 'What does the SQL clause HAVING do in a database query?', NULL, 'Filters records before grouping', 'Filters group summaries AFTER GROUP BY', 'Orders results alphabetically', 'Joins two tables on foreign keys', 1, 100, 'HAVING filters aggregate group rows after GROUP BY.'),
(1, 'Which JavaScript array method creates a NEW array with transformed items?', NULL, 'forEach()', 'filter()', 'map()', 'reduce()', 2, 100, 'Array.prototype.map() returns a new transformed array.');

-- Quiz 2: Astrophysics & Deep Space
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(2, 'What is the theoretical boundary around a black hole beyond which nothing can escape?', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80', 'Accretion Disk', 'Event Horizon', 'Photon Sphere', 'Singularity Point', 1, 120, 'The Event Horizon is the gravitational point of no return.'),
(2, 'Which celestial body in our solar system possesses Olympus Mons?', 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80', 'Venus', 'Mars', 'Jupiter moon Io', 'Asteroid Ceres', 1, 100, 'Olympus Mons on Mars is a giant shield volcano 21.9 km high.'),
(2, 'What parameter measures the rate of expansion of the universe in cosmology?', NULL, 'Planck Constant', 'Hubble Constant', 'Chandrasekhar Limit', 'Schwarzschild Radius', 1, 120, 'The Hubble Constant describes the cosmic expansion speed.'),
(2, 'What cosmic phenomenon was first directly detected by LIGO in September 2015?', 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80', 'Dark Matter particles', 'Gravitational Waves', 'Hawking Radiation', 'Cosmic Neutrino Background', 1, 150, 'LIGO detected gravitational waves caused by colliding black holes.'),
(2, 'What is the dominant element by mass in the observable universe?', NULL, 'Helium', 'Carbon', 'Hydrogen', 'Oxygen', 2, 100, 'Hydrogen constitutes approximately 75% of elemental mass in space.'),
(2, 'What type of star represents the final evolutionary stage of stars like our Sun?', 'https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=600&q=80', 'Neutron Star', 'Red Supergiant', 'White Dwarf', 'Pulsar', 2, 110, 'Sun-like stars shed outer layers and leave behind a dense White Dwarf.'),
(2, 'What is the closest stellar system to Earth at 4.24 light-years distance?', NULL, 'Sirius', 'Alpha Centauri / Proxima Centauri', 'Betelgeuse', 'Vega', 1, 100, 'Proxima Centauri is the nearest star to the Solar System.');

-- Quiz 3: History & Myths
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(3, 'Which Egyptian Pharaoh tomb was discovered intact by Howard Carter in 1922?', 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80', 'Ramses II', 'Tutankhamun', 'Akhenaten', 'Thutmose III', 1, 100, 'King Tutankhamun tomb KV62 was uncovered in 1922.'),
(3, 'In Greek mythology, who forged the thunderbolts of Zeus in his volcanic forge?', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80', 'Ares', 'Hephaestus', 'Hermes', 'Poseidon', 1, 100, 'Hephaestus crafted weapons for Mount Olympus including lightning bolts.'),
(3, 'Which historic trade route connected Chang\'an in China with the Mediterranean world?', NULL, 'Incense Route', 'Amber Road', 'Silk Road', 'Spice Route', 2, 100, 'The Silk Road facilitated commercial and cultural exchange.'),
(3, 'What major empire fell after the Siege of Constantinople in 1453?', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80', 'Holy Roman Empire', 'Byzantine Empire', 'Persian Empire', 'Ottoman Empire', 1, 100, 'The fall of Constantinople marked the end of the Byzantine Empire.'),
(3, 'Who was the first emperor of unified China who built the Terra Cotta Army?', NULL, 'Han Wudi', 'Qin Shi Huang', 'Tang Taizong', 'Kublai Khan', 1, 100, 'Qin Shi Huang unified China in 221 BC.'),
(3, 'Which ancient treaty signed in 1494 divided newly discovered lands between Spain and Portugal?', NULL, 'Treaty of Versailles', 'Treaty of Tordesillas', 'Treaty of Utrecht', 'Treaty of Westphalia', 1, 110, 'The Treaty of Tordesillas re-established the meridian dividing line between Portugal and Spain.');

-- Quiz 4: Cyber Security
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(4, 'Which web security vulnerability occurs when malicious scripts are injected into trusted web apps?', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80', 'SQLi', 'Cross-Site Scripting (XSS)', 'CSRF', 'Buffer Overflow', 1, 120, 'XSS allows executing client-side scripts in victim browsers.'),
(4, 'What is the cryptographic algorithm underlying modern RSA public-key encryption?', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', 'Symmetric AES block cipher', 'Factorization of large prime numbers', 'Elliptic Curve Point Multiplication', 'SHA-3 Hashing algorithm', 1, 150, 'RSA security relies on factoring products of large prime numbers.'),
(4, 'Which security mechanism enforces that requests can only access matching protocol, domain, and port?', NULL, 'CSP', 'Same-Origin Policy (SOP)', 'HSTS', 'CORS', 1, 100, 'Same-Origin Policy restricts scripts on one origin from interacting with another.'),
(4, 'What type of attack floods a target server with overwhelming traffic from distributed botnets?', NULL, 'MitM', 'Phishing', 'Distributed Denial of Service (DDoS)', 'Zero-Day', 2, 100, 'DDoS uses infected botnets to saturate target bandwidth.'),
(4, 'What is the term for an undisclosed software vulnerability exploited before developers release a patch?', NULL, 'Trojan Horse', 'Zero-Day Exploit', 'Man-in-the-Middle', 'Brute Force', 1, 130, 'A Zero-Day exploit targets vulnerabilities unknown to vendors.');

-- Quiz 5: Gaming Lore
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(5, 'In "The Legend of Zelda" series, what three virtues compose the sacred Triforce?', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', 'Strength, Honor, Glory', 'Power, Wisdom, Courage', 'Light, Shadow, Time', 'Truth, Faith, Justice', 1, 100, 'The Triforce consists of Power, Wisdom, and Courage.'),
(5, 'What is the highest-selling video game of all time with over 300 million copies sold?', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80', 'Grand Theft Auto V', 'Tetris', 'Minecraft', 'Super Mario Bros.', 2, 100, 'Minecraft has sold over 300M+ copies worldwide.'),
(5, 'What iconic gaming company introduced the Game Boy handheld system in 1989?', NULL, 'SEGA', 'Nintendo', 'Sony', 'Atari', 1, 100, 'Nintendo released the original 8-bit Game Boy in 1989.'),
(5, 'In the game "Half-Life", what is the name of the protagonist holding the iconic crowbar?', NULL, 'Duke Nukem', 'Gordon Freeman', 'B.J. Blazkowicz', 'Master Chief', 1, 100, 'Dr. Gordon Freeman is the silence protagonist of Half-Life.');

-- Quiz 6: AI & Machine Learning
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(6, 'Which deep learning neural network architecture introduced the Self-Attention mechanism in 2017?', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80', 'Convolutional Neural Network (CNN)', 'Recurrent Neural Network (RNN)', 'Transformer Architecture', 'Generative Adversarial Network (GAN)', 2, 150, 'The Transformer architecture ("Attention Is All You Need") revolutionized NLP and LLMs.'),
(6, 'What activation function outputs values strictly between 0 and 1?', NULL, 'ReLU', 'Sigmoid', 'Leaky ReLU', 'Tanh', 1, 100, 'Sigmoid function maps real-valued numbers to the (0, 1) probability range.'),
(6, 'What machine learning technique relies on Rewards and Penalties to train autonomous agents?', NULL, 'Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Transfer Learning', 2, 120, 'Reinforcement Learning trains agents to maximize cumulative rewards in dynamic environments.');

-- Quiz 7: Cinema & Pop Culture
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(7, 'Which 1994 film won the Academy Award for Best Picture starring Tom Hanks?', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80', 'Pulp Fiction', 'Forrest Gump', 'The Shawshank Redemption', 'Speed', 1, 100, 'Forrest Gump won 6 Academy Awards including Best Picture in 1994.'),
(7, 'Who directed the 2010 sci-fi blockbuster "Inception"?', NULL, 'Steven Spielberg', 'Christopher Nolan', 'Denis Villeneuve', 'James Cameron', 1, 100, 'Christopher Nolan directed and wrote Inception.'),
(7, 'What fictional metal coats Wolverine\'s skeleton in Marvel Comics?', NULL, 'Vibranium', 'Adamantium', 'Kryptonite', 'Mithril', 1, 100, 'Adamantium is the virtually indestructible steel alloy bound to Wolverine.');

-- Quiz 8: World Geography
INSERT INTO `questions` (`quiz_id`, `question_text`, `image_url`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `points`, `explanation`) VALUES
(8, 'What is the largest island in the world by land area?', 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80', 'Madagascar', 'Borneo', 'Greenland', 'New Guinea', 2, 100, 'Greenland is the largest non-continental island spanning 2.16M sq km.'),
(8, 'Which river flows through the highest number of sovereign countries in the world?', NULL, 'Amazon River', 'Danube River', 'Nile River', 'Mekong River', 1, 120, 'The Danube River flows through or borders 10 European nations.'),
(8, 'What is the capital city of Australia?', NULL, 'Sydney', 'Melbourne', 'Canberra', 'Brisbane', 2, 100, 'Canberra was selected as Australia capital in 1908 as a compromise between Sydney and Melbourne.');

-- ============================================================
-- Seed Sample Leaderboard Entries
-- ============================================================
INSERT INTO `leaderboard` (`quiz_id`, `user_id`, `player_name`, `score`, `accuracy`, `total_time`, `streak_max`) VALUES
(1, 1, 'CyberMaster', 1250, 100.0, 42, 8),
(1, 3, 'CodeVixen', 980, 87.5, 49, 5),
(1, 2, 'AstroNova', 850, 75.0, 55, 3),
(2, 2, 'AstroNova', 940, 100.0, 38, 7),
(2, 1, 'CyberMaster', 710, 80.0, 45, 4),
(3, 3, 'CodeVixen', 690, 100.0, 31, 6),
(6, 4, 'AiOverlord', 420, 100.0, 22, 3)
ON DUPLICATE KEY UPDATE `id`=`id`;
