<?php
// api/seed_more.php - Comprehensive Seeder Script with Easy, Medium, and Hard for ALL Topics
require_once __DIR__ . '/db.php';
$pdo = get_db();

// 1. Define 36 Quizzes (12 Core Topics x 3 Difficulty Tiers: Easy, Medium, Hard)
$quizzes = [
    // --- TOPIC 1: Web Dev ---
    [18, 1, 'Web Development - Easy HTML & CSS Quiz', 'Easy starter quiz on HTML tags, CSS styling, web links, and basic web page structure.', 'Web Dev', 'Easy', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80', 15],
    [1, 1, 'Web Development - Medium Engineering Mastery', 'Test your knowledge on JavaScript, CSS Grid, PHP PDO, SQL queries, REST APIs, DOM manipulation, and modern web architectures.', 'Web Dev', 'Medium', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80', 15],
    [19, 1, 'Web Development - Hard Advanced Architecture', 'Hard technical quiz on WebSocket concurrency, CORS preflight, event loop microtasks, and XSS sanitization.', 'Web Dev', 'Hard', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 2: Science ---
    [20, 2, 'General Science - Easy Fundamentals', 'Easy intro science trivia covering planets, water cycle, photosynthesis, and human anatomy.', 'Science', 'Easy', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80', 15],
    [21, 2, 'General Science - Medium Quantum & Dynamics', 'Medium science quiz covering atomic structure, electromagnetic spectrum, and chemical bonding.', 'Science', 'Medium', 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80', 15],
    [2, 2, 'General Science - Hard Astrophysics & Deep Space', 'From black hole event horizons to quantum gravity, cosmic microwave background, stellar evolution, and interstellar probes.', 'Science', 'Hard', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80', 20],

    // --- TOPIC 3: College of Computer Studies (CCS) ---
    [12, 1, 'College of Computer Studies (CCS) - Easy Fundamentals', 'Easy starter quiz on CCS MSU-TCTO programs (BSIT & BSCS), tagline, and fundamental computer concepts.', 'CCS', 'Easy', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', 15],
    [13, 1, 'College of Computer Studies (CCS) - Medium Faculty & Campus', 'Test your knowledge on CCS MSU-TCTO faculty members, leadership, research specialties (AI, IoT, Mobile Dev), and campus enrollment statistics.', 'CCS', 'Medium', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80', 15],
    [17, 1, 'College of Computer Studies (CCS) - Hard Systems Mastery', 'Hard technical quiz covering Green ICT, algorithm time complexity, database ACID properties, OS memory, and computer science theory.', 'CCS', 'Hard', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 4: Mobile Legends: Bang Bang (MLBB) ---
    [14, 2, 'Mobile Legends: Bang Bang (MLBB) - Easy Novice Quiz', 'Easy starter quiz on MLBB basics: 5v5 map lanes, main hero roles (Tank, Mage, Marksman), Lord & Turtle objectives, and battle spells.', 'Gaming', 'Easy', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 15],
    [15, 2, 'Mobile Legends: Bang Bang (MLBB) - Medium Veteran Quiz', 'Test your knowledge on MLBB hero skills, item passives (Immortality, Dominance Ice), M-Series World Championships, and draft pick counters.', 'Gaming', 'Medium', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', 15],
    [16, 2, 'Mobile Legends: Bang Bang (MLBB) - Hard Mythic Master Quiz', 'Hardcore MLBB trivia covering rotation macro strategy, exact cooldown math, emblem talent combos, and advanced esports tournament history.', 'Gaming', 'Hard', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 5: Cyber Security ---
    [22, 1, 'Cyber Security - Easy Security Starter', 'Basic cybersecurity hygiene: passwords, phishing alerts, antivirus protection, and safe browsing.', 'Cyber Sec', 'Easy', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', 15],
    [23, 1, 'Cyber Security - Medium Network Defense', 'Firewalls, VPN tunneling, SSL/TLS handshake, symmetric vs asymmetric encryption, and DDoS mitigation.', 'Cyber Sec', 'Medium', 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80', 15],
    [4, 1, 'Cyber Security - Hard Expert Penetration', 'SQL injection, XSS defense, public key cryptography, network protocols, Zero Trust, and zero-day exploits.', 'Cyber Sec', 'Hard', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 15],

    // --- TOPIC 6: Gaming Lore ---
    [5, 2, 'Gaming Lore - Easy Arcade & Retro Classics', 'From Pac-Man and Super Mario to Tetris and 8-bit retro arcade gaming legends.', 'Gaming', 'Easy', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80', 12],
    [24, 2, 'Gaming Lore - Medium Esports & Open World RPGs', 'Test your knowledge on Skyrim, Witcher 3, CS:GO majors, League of Legends World Championship, and Zelda games.', 'Gaming', 'Medium', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80', 15],
    [25, 2, 'Gaming Lore - Hard Engine Mechanics & Speedruns', 'Unreal Engine rendering, frame data in fighting games, speedrun TAS glitches, and obscure game engine history.', 'Gaming', 'Hard', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 7: Artificial Intelligence ---
    [26, 4, 'Artificial Intelligence - Easy Robot & Chatbot Basics', 'Introduction to AI chatbots, voice assistants (Siri/Alexa), automation, and smart technology.', 'AI & ML', 'Easy', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80', 15],
    [27, 4, 'Artificial Intelligence - Medium Machine Learning & Computer Vision', 'Supervised vs unsupervised learning, decision trees, neural network activation functions, and image recognition.', 'AI & ML', 'Medium', 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80', 15],
    [6, 4, 'Artificial Intelligence - Hard Deep Learning & Transformers', 'Neural networks, transformer architectures, reinforcement learning, NLP, computer vision, and model optimization.', 'AI & ML', 'Hard', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 8: World History ---
    [28, 3, 'World History - Easy Ancient Timelines', 'Famous historical figures, Pyramids of Giza, Julius Caesar, and simple ancient civilization facts.', 'History', 'Easy', 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80', 15],
    [3, 3, 'World History - Medium Empires & Myths', 'Journey through ancient Egypt, Greek mythology, the Silk Road, pivotal historical battles, and world empires.', 'History', 'Medium', 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80', 15],
    [29, 3, 'World History - Hard Revolutions & Dynasties', 'Industrial revolution inventions, Treaty of Versailles, Ming dynasty politics, and Cold War diplomacy.', 'History', 'Hard', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 9: Cinema & Pop Culture ---
    [7, 3, 'Cinema & Pop Culture - Easy Blockbuster Movies', 'Iconic movie quotes, Disney classics, Marvel superheroes, and widely known Hollywood blockbusters.', 'Movies & Culture', 'Easy', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80', 12],
    [30, 3, 'Cinema & Pop Culture - Medium Award Winners & Actors', 'Academy Award Best Picture winners, famous Hollywood directors, and movie trivia.', 'Movies & Culture', 'Medium', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80', 15],
    [31, 3, 'Cinema & Pop Culture - Hard Film Directors & Cinema Theory', 'Auteur cinema theory, silent film era pioneers, French New Wave, and cinematography technical techniques.', 'Movies & Culture', 'Hard', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 10: Geography ---
    [32, 2, 'World Geography - Easy Capitals & Country Flags', 'Match country capitals, continent locations, and famous global landmarks.', 'Geography', 'Easy', 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', 15],
    [8, 2, 'World Geography - Medium Rivers & Mountain Ranges', 'Extreme peaks, mighty rivers, island nations, capitals, oceanic trenches, and natural phenomena across 7 continents.', 'Geography', 'Medium', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', 15],
    [33, 2, 'World Geography - Hard Tectonic Trench & Climatology', 'Mariana Trench pressure depths, Koppen climate classification, tectonic rift valleys, and enclave/exclave political boundaries.', 'Geography', 'Hard', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 11: Mathematics ---
    [34, 1, 'Mathematics & Logic - Easy Arithmetic & Shapes', 'Addition, multiplication shortcuts, basic geometric shapes, and fun number puzzles.', 'Mathematics', 'Easy', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', 15],
    [35, 1, 'Mathematics & Logic - Medium Algebra & Geometry', 'Pythagorean theorem, quadratic equations, probability fractions, and perimeter/area formulas.', 'Mathematics', 'Medium', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80', 15],
    [9, 1, 'Mathematics & Logic - Hard Calculus & Matrix Algebra', 'Pythagorean theorems, probability, calculus derivatives, Fibonacci sequences, abstract algebra, and logic gates.', 'Mathematics', 'Hard', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80', 18],

    // --- TOPIC 12: Anime & Manga ---
    [36, 3, 'Otaku Lore & Anime - Easy Starter Shonen', 'Popular main characters, Naruto jutsu basics, Dragon Ball Super, and Pokémon starter trivia.', 'Anime & Manga', 'Easy', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', 15],
    [10, 3, 'Otaku Lore & Anime - Medium Classic Series & Ghibli', 'Test your knowledge on Attack on Titan, One Piece, Studio Ghibli, Naruto, Jujutsu Kaisen, and classic mecha legends.', 'Anime & Manga', 'Medium', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', 15],
    [37, 3, 'Otaku Lore & Anime - Hard Studio History & Deep Cut Lore', 'Studio Gainax history, original manga author debuts, obscure light novel adaptations, and seiyuu voice actor trivia.', 'Anime & Manga', 'Hard', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80', 18],
];

$driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
$quiz_sql = ($driver === 'sqlite') 
    ? "INSERT OR REPLACE INTO quizzes (id, user_id, title, description, category, difficulty, banner_url, time_per_question) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    : "REPLACE INTO quizzes (id, user_id, title, description, category, difficulty, banner_url, time_per_question) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

$stmt_q = $pdo->prepare($quiz_sql);
foreach ($quizzes as $q) {
    $stmt_q->execute($q);
}

// 2. Define Questions for all Quizzes
$questions = [
    // --- QUIZ 18: Web Dev (Easy) ---
    [18, 'What HTML tag is used to create a hyperlink to another web page?', NULL, '<a>', '<link>', '<href>', '<url>', 0, 100, 'The <a> (anchor) tag creates hyperlinks.'],
    [18, 'What does CSS stand for in web development?', NULL, 'Cascading Style Sheets', 'Computer Style Syntax', 'Creative Sheet Systems', 'Color Code Specifications', 0, 100, 'CSS stands for Cascading Style Sheets.'],
    [18, 'Which HTML element contains the main visible content of a web document?', NULL, '<head>', '<body>', '<meta>', '<title>', 1, 100, 'The <body> tag holds visible elements.'],
    [18, 'Which CSS property is used to change text color?', NULL, 'font-color', 'text-style', 'color', 'background-color', 2, 100, 'The color property sets text foreground color.'],
    [18, 'What HTML tag is used to insert an image into a web page?', NULL, '<img>', '<picture>', '<media>', '<src>', 0, 100, 'The <img> tag embeds images.'],
    [18, 'Which HTML header tag represents the highest importance heading level?', NULL, '<h6>', '<h3>', '<h1>', '<head>', 2, 100, '<h1> is the top-level main heading.'],

    // --- QUIZ 1: Web Dev (Medium) ---
    [1, 'Which PHP PDO method is used to execute a prepared SQL query with bound parameters safely?', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80', 'PDO::query()', 'PDOStatement::execute()', 'PDO::commit()', 'PDOStatement::run()', 1, 100, 'PDOStatement::execute() executes a prepared statement safely.'],
    [1, 'What CSS layout module is specifically designed for two-dimensional grid-based layouts?', NULL, 'Flexbox', 'CSS Grid', 'Float Layout', 'Position Relative', 1, 100, 'CSS Grid Layout is optimized for 2D layouts.'],
    [1, 'In JavaScript, what does Promise.allSettled() return?', 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80', 'Rejects immediately', 'Waits for all promises to fulfill or reject', 'Resolves fastest promise', 'Cancels remaining promises', 1, 100, 'Promise.allSettled() waits for all promises regardless of outcome.'],
    [1, 'Which HTTP status code signifies 201 Created?', NULL, '200 OK', '201 Created', '202 Accepted', '204 No Content', 1, 100, 'HTTP 201 Created indicates a new resource has been created.'],
    [1, 'In modern JavaScript, what is the primary benefit of Event Delegation?', 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=600&q=80', 'Accelerates CSS animations', 'Attaches a single listener to a parent', 'Prevents API requests', 'Encrypts user input data', 1, 100, 'Event delegation uses event bubbling on a parent element.'],
    [1, 'What is the purpose of localStorage in web browsers?', NULL, 'Expires when tab closes', 'Stores persistent key-value data with no expiration', 'Transmits session tokens automatically', 'Caches server-side PHP templates', 1, 100, 'localStorage stores persistent client-side data.'],

    // --- QUIZ 19: Web Dev (Hard) ---
    [19, 'In the JavaScript event loop, where are resolved Promise then() callbacks queued?', NULL, 'Task Queue (Macrotask)', 'Microtask Queue', 'Render Queue', 'Call Stack directly', 1, 100, 'Promise reactions are queued in the Microtask queue.'],
    [19, 'What HTTP header is sent by a browser during a CORS preflight request using OPTIONS?', NULL, 'Access-Control-Allow-Origin', 'Access-Control-Request-Method', 'X-Requested-With', 'Authorization', 1, 100, 'Access-Control-Request-Method specifies the target HTTP method.'],
    [19, 'In PHP PDO, what attribute setting forces PDO to throw exceptions on database errors?', NULL, 'PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION', 'PDO::ATTR_DEFAULT_FETCH_MODE', 'PDO::ATTR_AUTOCOMMIT', 'PDO::ERR_SILENT', 0, 100, 'ERRMODE_EXCEPTION enables exception handling.'],
    [19, 'What type of XSS attack occurs when malicious user input is saved in a database and rendered to multiple users?', NULL, 'Reflected XSS', 'DOM-based XSS', 'Stored XSS (Persistent)', 'Blind XSS', 2, 100, 'Stored XSS persists in the database.'],
    [19, 'In CSS Grid, what function creates flexible track sizing with min and max bounds?', NULL, 'clamp()', 'minmax()', 'fit-content()', 'repeat()', 1, 100, 'minmax(min, max) sets flexible grid track boundaries.'],
    [19, 'What WebSocket frame opcode represents a Ping heartbeat check from client or server?', NULL, '0x1 (Text)', '0x8 (Close)', '0x9 (Ping)', '0xA (Pong)', 2, 100, 'Opcode 0x9 represents a Ping frame.'],

    // --- QUIZ 20: Science (Easy) ---
    [20, 'What planet in our solar system is known as the "Red Planet"?', NULL, 'Venus', 'Mars', 'Jupiter', 'Saturn', 1, 100, 'Mars is called the Red Planet due to iron oxide.'],
    [20, 'What chemical process do green plants use to convert sunlight into food energy?', NULL, 'Respiration', 'Photosynthesis', 'Fermentation', 'Evaporation', 1, 100, 'Photosynthesis converts light energy into chemical energy.'],
    [20, 'What is the chemical formula for pure water?', NULL, 'CO2', 'H2O', 'NaCl', 'O2', 1, 100, 'H2O consists of two Hydrogen atoms and one Oxygen atom.'],
    [20, 'Which gas do humans inhale to survive and sustain cellular life?', NULL, 'Nitrogen', 'Carbon Dioxide', 'Oxygen', 'Helium', 2, 100, 'Oxygen is vital for human respiration.'],

    // --- QUIZ 21: Science (Medium) ---
    [21, 'What particle in an atom possesses a negative electric charge?', NULL, 'Proton', 'Neutron', 'Electron', 'Positron', 2, 100, 'Electrons carry negative charge.'],
    [21, 'What is the chemical symbol for Gold on the Periodic Table?', NULL, 'Ag', 'Au', 'Fe', 'Cu', 1, 100, 'Au (from Latin Aurum) is Gold.'],
    [21, 'Which law of motion states that for every action there is an equal and opposite reaction?', NULL, 'Newton\'s First Law', 'Newton\'s Second Law', 'Newton\'s Third Law', 'Kepler\'s First Law', 2, 100, 'Newton\'s 3rd Law states equal and opposite forces.'],
    [21, 'What organelle inside plant cells contains chlorophyll and carries out photosynthesis?', NULL, 'Mitochondria', 'Chloroplast', 'Ribosome', 'Golgi Apparatus', 1, 100, 'Chloroplasts contain chlorophyll for photosynthesis.'],

    // --- QUIZ 2: Science (Hard) ---
    [2, 'What is the theoretical boundary around a black hole beyond which nothing can escape?', 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80', 'Accretion Disk', 'Event Horizon', 'Photon Sphere', 'Singularity Point', 1, 120, 'The Event Horizon is the gravitational point of no return.'],
    [2, 'Which celestial body in our solar system possesses Olympus Mons?', 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=600&q=80', 'Venus', 'Mars', 'Jupiter moon Io', 'Asteroid Ceres', 1, 100, 'Olympus Mons on Mars is a giant shield volcano 21.9 km high.'],
    [2, 'What parameter measures the rate of expansion of the universe in cosmology?', NULL, 'Planck Constant', 'Hubble Constant', 'Chandrasekhar Limit', 'Schwarzschild Radius', 1, 120, 'The Hubble Constant describes the cosmic expansion speed.'],
    [2, 'What cosmic phenomenon was first directly detected by LIGO in September 2015?', 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80', 'Dark Matter particles', 'Gravitational Waves', 'Hawking Radiation', 'Cosmic Neutrino Background', 1, 150, 'LIGO detected gravitational waves.'],

    // --- QUIZ 12: CCS (Easy) ---
    [12, 'What does CCS stand for at Mindanao State University - Tawi-Tawi (MSU-TCTO)?', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80', 'College of Computer Studies', 'Center for Computer Sciences', 'Council of Computer Systems', 'College of Computational Software', 0, 100, 'CCS stands for College of Computer Studies.'],
    [12, 'What is the official tagline of the College of Computer Studies (CCS) at MSU-TCTO?', NULL, 'Code the Future', 'Innovating Minds, Connecting Futures', 'Empowering Tech', 'Leading Digital Transformation', 1, 100, 'Innovating Minds, Connecting Futures is the official CCS tagline.'],
    [12, 'What primary degree programs are offered under CCS at MSU-TCTO?', NULL, 'BS Information Technology & BS Computer Science', 'BS Cyber Security & BS Robotics', 'BS Civil Engineering', 'BS Nursing', 0, 100, 'CCS offers BSIT and BSCS degree programs.'],

    // --- QUIZ 13: CCS (Medium) ---
    [13, 'How many students were enrolled in the College of Computer Studies (CCS) at MSU-TCTO in 2025?', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80', '120 students', '185 students', '259 students', '410 students', 2, 100, 'CCS MSU-TCTO recorded an enrollment of 259 active students in 2025 across its computing degree programs.'],
    [13, 'How many core faculty members compose the academic staff of CCS at MSU-TCTO?', NULL, '6 faculty members', '8 faculty members', '12 faculty members', '20 faculty members', 2, 100, 'CCS features a dedicated faculty team of 12 academic members guiding IT and Application degree programs.'],
    [13, 'Who currently serves as the Dean of the College of Computer Studies (CCS) at MSU-TCTO?', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80', 'Associate Prof. Nerico L. Mingoc, MSIT', 'Instructor Estelita Cheng G. Lim', 'Associate Prof. Charisa F. Llema-Abalie, MSIT', 'Instructor Romeo L. Pañares Jr.', 0, 100, 'Associate Prof. Nerico L. Mingoc, MSIT serves as the Dean of the College of Computer Studies.'],

    // --- QUIZ 17: CCS (Hard) ---
    [17, 'What academic advocacy of CCS MSU-TCTO promotes eco-friendly computing practices for social transformation?', NULL, 'Green ICT', 'Clean Power OS', 'Solar Cloud', 'Eco-Code', 0, 100, 'Green ICT advocates sustainable computing technology.'],
    [17, 'Which year was IICT (now CCS) established at MSU-TCTO under BOR Resolution No. 62?', NULL, '1995', '1999', '2004', '2010', 1, 100, 'IICT/CCS was established in 1999 under BOR Resolution No. 62.'],
    [17, 'What time complexity does Binary Search achieve on a sorted array of N elements?', NULL, 'O(N)', 'O(N log N)', 'O(log N)', 'O(1)', 2, 100, 'Binary search runs in O(log N) time.'],

    // --- QUIZ 14: MLBB (Easy) ---
    [14, 'How many lanes are on the standard 5v5 battle map (Land of Dawn) in Mobile Legends?', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80', '2 Lanes', '3 Lanes (EXP, Mid, Gold)', '4 Lanes', '5 Lanes', 1, 100, 'The Land of Dawn features 3 primary lanes: EXP Lane, Mid Lane, and Gold Lane.'],
    [14, 'What is the primary objective monster that spawns in the river at 2 minutes, granting shield and gold to your team?', NULL, 'Lithowanderer', 'The Turtle', 'The Lord', 'Molten Fiend', 1, 100, 'The Turtle spawns at 2 minutes and provides team gold, XP, and a protective shield.'],
    [14, 'Which hero role is primarily responsible for clearing the Gold Lane and dealing high physical damage late in the game?', NULL, 'Tank', 'Support', 'Marksman', 'Fighter', 2, 100, 'Marksmen are long-range damage dealers who scale strongly with Gold Lane minions.'],

    // --- QUIZ 15: MLBB (Medium) ---
    [15, 'Which Filipino team won the M3 World Championship in 2021 behind their signature "Code Black" Estes strategy?', NULL, 'ONIC PH', 'Blacklist International', 'ECHO', 'AP.Bren', 1, 100, 'Blacklist International won M3 in December 2021.'],
    [15, 'Which fighter/tank hero transforms directly into a giant Black Dragon with his ultimate skill?', NULL, 'Zilong', 'Chou', 'Yu Zhong', 'Thamuz', 2, 100, 'Yu Zhong transforms into the Black Dragon gaining flight and CC immunity.'],
    [15, 'What item passive on Dominance Ice reduces nearby enemy healing and attack speed?', NULL, 'Arctic Cold', 'Life Drain', 'Ice Bound', 'Shield Breaker', 0, 100, 'Dominance Ice features Arctic Cold passive reducing HP regen and attack speed.'],

    // --- QUIZ 16: MLBB (Hard) ---
    [16, 'What is the base cooldown of the Flicker battle spell in Mobile Legends?', NULL, '90 seconds', '120 seconds', '100 seconds', '60 seconds', 1, 100, 'Flicker has a 120-second base cooldown.'],
    [16, 'Which emblem talent grants bonus movement speed after dealing damage equal to 7% of enemy max HP?', NULL, 'Impure Rage', 'Lethal Ignition', 'Quantum Charge', 'Focusing Mark', 2, 100, 'Quantum Charge grants movement speed and HP restoration upon basic attacks.'],
    [16, 'What exact percentage of physical lifesteal is converted into shield when using Bloodlust Axe on spell vamp heroes?', NULL, '0% (Spell Vamp is separate)', '50%', '100%', '25%', 0, 100, 'Spell Vamp and Physical Lifesteal are separate mechanics in MLBB.'],

    // --- QUIZ 22: Cyber Sec (Easy) ---
    [22, 'Which password practice creates the strongest defense against brute-force security attacks?', NULL, 'Using your birthday', 'Using a long combination of letters, numbers & symbols', 'Reusing "password123"', 'Writing password on a sticky note', 1, 100, 'Complex long passwords resist brute force attacks.'],
    [22, 'What does 2FA stand for in account security?', NULL, 'Two-Factor Authentication', 'Fast Fast Access', 'Dual Firewall Action', 'Double File Archive', 0, 100, '2FA stands for Two-Factor Authentication.'],

    // --- QUIZ 23: Cyber Sec (Medium) ---
    [23, 'What type of encryption uses a pair of Public and Private keys to secure data exchange?', NULL, 'Symmetric Encryption', 'Asymmetric Public Key Encryption', 'Rot13 Cipher', 'Base64 Encoding', 1, 100, 'Asymmetric encryption relies on a public key for encryption and private key for decryption.'],
    [23, 'What does a VPN (Virtual Private Network) do to protect user internet privacy?', NULL, 'Increases RAM speed', 'Encrypts web traffic and hides client IP address', 'Deletes browser history automatically', 'Blocks computer hardware viruses', 1, 100, 'VPNs encrypt network traffic and mask IP addresses.'],

    // --- QUIZ 4: Cyber Sec (Hard) ---
    [4, 'Uncover secrets of SQL injection, XSS defense, public key cryptography, network protocols, and zero-day exploits.', NULL, 'Prepared Statements', 'SQL Injection', 'Cross Site Scripting', 'Zero Day', 0, 100, 'Prepared statements prevent SQL injection.'],

    // --- QUIZ 5: Gaming Lore (Easy) ---
    [5, 'What golden ghost-chasing hero made his debut in 1980 arcade cabinets eating dots?', NULL, 'Mario', 'Pac-Man', 'Sonic', 'Donkey Kong', 1, 100, 'Pac-Man was released by Namco in 1980.'],

    // --- QUIZ 24: Gaming Lore (Medium) ---
    [24, 'Which open-world RPG title won Game of the Year at The Game Awards 2015 featuring Geralt of Rivia?', NULL, 'Skyrim', 'The Witcher 3: Wild Hunt', 'Fallout 4', 'Bloodborne', 1, 100, 'The Witcher 3 won Game of the Year in 2015.'],

    // --- QUIZ 25: Gaming Lore (Hard) ---
    [25, 'In fighting games, what is the term for an attack that grants positive frame advantage on block?', NULL, 'Punish', 'Plus on Block', 'Option Select', 'Whiff', 1, 100, 'Plus on block attacks allow the attacker to act before defender.'],

    // --- QUIZ 26: AI (Easy) ---
    [26, 'What artificial intelligence tool developed by OpenAI became famous for generating conversational text answers in 2022?', NULL, 'Siri', 'ChatGPT', 'Alexa', 'DeepBlue', 1, 100, 'ChatGPT revolutionized conversational AI.'],

    // --- QUIZ 27: AI (Medium) ---
    [27, 'Which Machine Learning paradigm trains models by giving rewards and penalties based on actions taken in an environment?', NULL, 'Supervised Learning', 'Reinforcement Learning', 'Unsupervised Clustering', 'Rule-based Expert System', 1, 100, 'Reinforcement Learning uses reward/punishment feedback loops.'],

    // --- QUIZ 6: AI (Hard) ---
    [6, 'Which deep learning architecture introduced by Google in 2017 revolutionized NLP with self-attention mechanisms?', NULL, 'Convolutional Neural Network (CNN)', 'Transformer Architecture', 'Recurrent Neural Network (RNN)', 'Perceptron', 1, 100, 'Attention Is All You Need introduced the Transformer.'],

    // --- QUIZ 28: History (Easy) ---
    [28, 'Which ancient civilization built the Great Pyramids of Giza along the Nile River?', NULL, 'Ancient Rome', 'Ancient Egypt', 'Mesopotamia', 'Inca Empire', 1, 100, 'Ancient Egyptians built the Pyramids of Giza.'],

    // --- QUIZ 3: History (Medium) ---
    [3, 'Who was the first Emperor of Rome following the fall of the Roman Republic?', NULL, 'Julius Caesar', 'Augustus Caesar', 'Nero', 'Marcus Aurelius', 1, 100, 'Augustus (Octavian) became the first Emperor of Rome.'],

    // --- QUIZ 29: History (Hard) ---
    [29, 'What year did the French Revolution begin with the Storming of the Bastille?', NULL, '1776', '1789', '1812', '1848', 1, 100, 'The French Revolution began in 1789.'],

    // --- QUIZ 7: Cinema (Easy) ---
    [7, 'Which superhero wears a suit of powered armor created by Tony Stark in Marvel Studios movies?', NULL, 'Captain America', 'Iron Man', 'Thor', 'Spider-Man', 1, 100, 'Iron Man is Tony Stark.'],

    // --- QUIZ 30: Cinema (Medium) ---
    [30, 'Which film directed by Christopher Nolan won Best Picture at the 96th Academy Awards in 2024?', NULL, 'Inception', 'Oppenheimer', 'Dunkirk', 'Interstellar', 1, 100, 'Oppenheimer won Best Picture in 2024.'],

    // --- QUIZ 31: Cinema (Hard) ---
    [31, 'Which 1941 Orson Welles film is famous for pioneering deep focus cinematography and non-linear narrative structure?', NULL, 'Casablanca', 'Citizen Kane', 'Vertigo', 'The Godfather', 1, 100, 'Citizen Kane pioneered deep focus and complex narratives.'],

    // --- QUIZ 32: Geography (Easy) ---
    [32, 'What is the capital city of France?', NULL, 'London', 'Berlin', 'Paris', 'Rome', 2, 100, 'Paris is the capital of France.'],

    // --- QUIZ 8: Geography (Medium) ---
    [8, 'What is the longest river in the world by overall length?', NULL, 'Amazon River', 'Nile River', 'Yangtze River', 'Mississippi River', 1, 100, 'The Nile River is traditionally recorded as the longest.'],

    // --- QUIZ 33: Geography (Hard) ---
    [33, 'What is the deepest known location in Earth\'s oceans, located in the Western Pacific?', NULL, 'Puerto Rico Trench', 'Challenger Deep (Mariana Trench)', 'Java Trench', 'Sunda Trench', 1, 100, 'Challenger Deep reaches nearly 11,000 meters depth.'],

    // --- QUIZ 34: Mathematics (Easy) ---
    [34, 'What is the square root of 64?', NULL, '6', '7', '8', '9', 2, 100, '8 * 8 = 64.'],

    // --- QUIZ 35: Mathematics (Medium) ---
    [35, 'In a right-angled triangle, if sides a = 3 and b = 4, what is the length of hypotenuse c?', NULL, '5', '6', '7', '8', 0, 100, 'By Pythagorean theorem: 3^2 + 4^2 = 9 + 16 = 25; sqrt(25) = 5.'],

    // --- QUIZ 9: Mathematics (Hard) ---
    [9, 'What is the derivative of f(x) = x^3 with respect to x?', NULL, '3x', '3x^2', 'x^2', '6x', 1, 100, 'Using the power rule: d/dx(x^3) = 3x^2.'],

    // --- QUIZ 36: Anime (Easy) ---
    [36, 'What is the name of the main protagonist in the anime series Naruto who aspires to become Hokage?', NULL, 'Sasuke Uchiha', 'Naruto Uzumaki', 'Kakashi Hatake', 'Itachi Uchiha', 1, 100, 'Naruto Uzumaki is the main protagonist.'],

    // --- QUIZ 10: Anime (Medium) ---
    [10, 'Which Studio Ghibli animated film directed by Hayao Miyazaki won the Academy Award for Best Animated Feature in 2003?', NULL, 'My Neighbor Totoro', 'Spirited Away', 'Princess Mononoke', 'Howl\'s Moving Castle', 1, 100, 'Spirited Away won the Oscar for Best Animated Feature.'],

    // --- QUIZ 37: Anime (Hard) ---
    [37, 'In Attack on Titan (Shingeki no Kyojin), what is the original name of the founding titan possessor Ymir?', NULL, 'Ymir Fritz', 'Ymir Tybur', 'Ymir Jaeger', 'Ymir Ackerman', 0, 100, 'Ymir Fritz was the first titan shifter.']
];

// Clear existing questions for clean re-seed
$pdo->exec("DELETE FROM questions");

$stmt_items = $pdo->prepare("INSERT INTO questions (quiz_id, question_text, image_url, option_a, option_b, option_c, option_d, correct_option, points, explanation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
foreach ($questions as $item) {
    $stmt_items->execute($item);
}

echo "Database successfully populated with 36 Quizzes across 12 Topics (with Easy, Medium, Hard options) and questions!\n";
