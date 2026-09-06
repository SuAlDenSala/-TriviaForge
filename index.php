<?php
// index.php - Main Single Page Application (SPA) with Left Sidebar Navigation Panel
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TriviaForge - Custom Trivia Quiz Maker & Dynamic Leaderboards</title>
    <meta name="description" content="Create custom trivia quizzes, compete in real-time timed challenges, and conquer dynamic leaderboards.">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Design System CSS -->
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>

    <div class="app-layout">

        <!-- MOBILE SIDEBAR BACKDROP OVERLAY -->
        <div id="sidebarBackdrop" class="sidebar-backdrop" onclick="toggleSidebar(false)"></div>

        <!-- LEFT SIDEBAR NAVIGATION PANEL -->
        <aside id="appSidebar" class="app-sidebar glass-panel">
            <div class="sidebar-header">
                <a href="#explore" class="logo-wrapper" onclick="switchTab('explore')">
                    <i class="fas fa-bolt logo-icon"></i>
                    <span class="logo-text">Trivia<span class="logo-highlight">Forge</span></span>
                </a>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="btn-icon-toggle sidebar-toggle-btn" onclick="toggleSidebarCollapse()" title="Toggle Sidebar">
                        <i class="fas fa-bars"></i>
                    </button>
                    <button class="sidebar-close-btn" onclick="toggleSidebar(false)" title="Close Menu">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section-label">Main Navigation</div>
                <button id="navBtn_explore" class="sidebar-nav-btn active" onclick="switchTab('explore')">
                    <i class="fas fa-compass nav-icon"></i>
                    <span>Explore Quizzes</span>
                </button>
                <button id="navBtn_creator" class="sidebar-nav-btn" onclick="switchTab('creator')">
                    <i class="fas fa-plus-circle nav-icon"></i>
                    <span>Add Quiz</span>
                </button>
                <button id="navBtn_leaderboard" class="sidebar-nav-btn" onclick="switchTab('leaderboard')">
                    <i class="fas fa-trophy nav-icon"></i>
                    <span>Leaderboards</span>
                </button>
                <button id="navBtn_help" class="sidebar-nav-btn" onclick="switchTab('help')">
                    <i class="fas fa-question-circle nav-icon"></i>
                    <span>How to Play & Rules</span>
                </button>
            </nav>

            <div class="sidebar-footer">
                <button id="navBtn_settings" class="sidebar-nav-btn" onclick="switchTab('settings')">
                    <i class="fas fa-cog nav-icon"></i>
                    <span>Settings & Account</span>
                </button>
            </div>
        </aside>

        <!-- MAIN CONTENT WRAPPER -->
        <div class="main-content-wrapper">

            <!-- Top Mobile Bar & Quick Controls -->
            <header class="top-mobile-bar">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <button class="mobile-toggle-btn" onclick="toggleSidebar()" title="Open Navigation Menu">
                        <i class="fas fa-bars"></i>
                    </button>
                    <span class="mobile-logo"><i class="fas fa-bolt text-cyan"></i> TriviaForge</span>
                </div>

                <div class="header-controls">
                    <div id="topUserContainer" style="display: flex; align-items: center; gap: 0.5rem;"></div>
                    <button id="audioMuteBtn" class="btn-icon-toggle" onclick="toggleSound(this)" title="Toggle Sound Effects">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </header>

            <!-- TAB 1: EXPLORE QUIZZES -->
            <section id="tab_explore" class="tab-content">
                <div class="hero-banner glass-panel fade-in">
                    <h1 class="hero-title">Custom Trivia & Dynamic Leaderboards</h1>
                    <p class="hero-sub">Challenge your speed with timed AJAX question delivery, earn streak multipliers, and battle for the top spot on live leaderboards.</p>
                </div>

                <div class="filters-bar">
                    <div style="display: flex; flex-direction: column; gap: 0.75rem; flex: 1; overflow: hidden;">
                        <div id="categoryFilter" class="cat-pills-row" style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.25rem; scrollbar-width: thin;">
                            <!-- Populated dynamically via app.js -->
                        </div>
                        <div id="difficultyFilter" class="cat-pills-row diff-pills-row">
                            <!-- Populated dynamically via app.js -->
                        </div>
                    </div>

                    <div class="search-box-wrapper">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="searchInput" class="search-input" placeholder="Search quizzes by keyword..." onkeyup="window.app.loadQuizzes(window.app.currentCategory, window.app.currentDifficulty, this.value)">
                    </div>
                </div>

                <div id="quizzesGrid" class="quizzes-grid">
                    <!-- Quizzes grid populated via app.js -->
                </div>
            </section>

            <!-- TAB 2: QUIZ CREATOR (ADD QUIZ) -->
            <section id="tab_creator" class="tab-content" style="display: none;">
                <div class="creator-container">
                    <div class="creator-header-card glass-panel fade-in">
                        <h2 id="creatorHeaderTitle" class="hero-title" style="font-size: 1.8rem;"><i class="fas fa-tools text-cyan"></i> Custom Quiz Builder</h2>
                        <p class="hero-sub" style="margin-bottom: 1.5rem;">Create and add your custom quizzes with timed questions, custom point values, and visual image attachments.</p>

                        <div class="form-group">
                            <label>Quiz Title *</label>
                            <input type="text" id="quizTitle" class="input-field" placeholder="e.g. Master Class in Cyber Security & Network Defense" required>
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="quizDescription" class="input-field" rows="2" placeholder="Brief summary of what players will learn or test in this quiz..."></textarea>
                        </div>

                        <div class="form-group" style="margin-bottom: 1.25rem;">
                            <label style="font-weight: 700; display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span><i class="fas fa-tags text-cyan"></i> Category *</span>
                                <span id="selectedCategoryTagBadge" style="font-size: 0.78rem; font-weight: 800; background: var(--primary-cyan); color: #000; padding: 0.2rem 0.65rem; border-radius: 12px; text-transform: uppercase;">CCS</span>
                            </label>
                            <input type="hidden" id="quizCategory" value="CCS">

                            <div id="categoryButtonHolder" class="category-btn-holder" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                                <button type="button" class="cat-choice-btn active" data-cat="CCS" onclick="selectCreatorCategory(this, 'CCS')"><i class="fas fa-laptop-code text-cyan"></i> CCS</button>
                                <button type="button" class="cat-choice-btn" data-cat="Web Dev" onclick="selectCreatorCategory(this, 'Web Dev')"><i class="fas fa-code text-violet"></i> Web Dev</button>
                                <button type="button" class="cat-choice-btn" data-cat="Science" onclick="selectCreatorCategory(this, 'Science')"><i class="fas fa-flask text-emerald"></i> Science</button>
                                <button type="button" class="cat-choice-btn" data-cat="Gaming" onclick="selectCreatorCategory(this, 'Gaming')"><i class="fas fa-gamepad text-amber"></i> Gaming</button>
                                <button type="button" class="cat-choice-btn" data-cat="Cyber Sec" onclick="selectCreatorCategory(this, 'Cyber Sec')"><i class="fas fa-shield-alt text-rose"></i> Cyber Sec</button>
                                <button type="button" class="cat-choice-btn" data-cat="AI & ML" onclick="selectCreatorCategory(this, 'AI & ML')"><i class="fas fa-robot text-cyan"></i> AI & ML</button>
                                <button type="button" class="cat-choice-btn" data-cat="Movies & Culture" onclick="selectCreatorCategory(this, 'Movies & Culture')"><i class="fas fa-film text-violet"></i> Movies & Culture</button>
                                <button type="button" class="cat-choice-btn" data-cat="Geography" onclick="selectCreatorCategory(this, 'Geography')"><i class="fas fa-globe-americas text-emerald"></i> Geography</button>
                                <button type="button" class="cat-choice-btn" data-cat="Anime & Manga" onclick="selectCreatorCategory(this, 'Anime & Manga')"><i class="fas fa-tv text-amber"></i> Anime & Manga</button>
                                <button type="button" class="cat-choice-btn" data-cat="Mathematics" onclick="selectCreatorCategory(this, 'Mathematics')"><i class="fas fa-calculator text-rose"></i> Mathematics</button>
                                <button type="button" class="cat-choice-btn" data-cat="General" onclick="selectCreatorCategory(this, 'General')"><i class="fas fa-brain text-cyan"></i> General</button>
                                <button type="button" class="cat-choice-btn cat-choice-custom" data-cat="__custom__" onclick="selectCreatorCategory(this, '__custom__')"><i class="fas fa-plus-circle text-gold"></i> + Custom Category...</button>
                            </div>

                            <input type="text" id="customCategoryInput" class="input-field" placeholder="Type new custom category name (e.g. Mobile Legends, Sports...)" style="display: none; margin-top: 0.75rem;">
                        </div>

                        <div class="form-row-split">
                            <div class="form-group half">
                                <label>Difficulty Level</label>
                                <select id="quizDifficulty" class="input-field">
                                    <option value="Easy">Easy</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row-split">
                            <div class="form-group half">
                                <label>Time per Question (Seconds)</label>
                                <input type="number" id="quizTimePerQ" class="input-field" value="15" min="5" max="120">
                            </div>
                            <div class="form-group half">
                                <label><i class="fas fa-image text-cyan"></i> Quiz Banner Cover Picture</label>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <input type="text" id="quizBannerUrl" class="input-field" placeholder="Upload file or paste image URL...">
                                    <label class="btn btn-secondary-glow btn-sm" style="white-space: nowrap; cursor: pointer; margin: 0;">
                                        <i class="fas fa-upload text-cyan"></i> Upload
                                        <input type="file" accept="image/*" style="display: none;" onchange="window.quizCreator.uploadFile(this, 'quizBannerUrl')">
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="quick-preset-bar" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">Quick Action Templates:</span>
                            <button type="button" class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.loadPresetPack('web')">
                                <i class="fas fa-code text-cyan"></i> Add Web Dev Pack
                            </button>
                            <button type="button" class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.loadPresetPack('science')">
                                <i class="fas fa-atom text-violet"></i> Add Science Pack
                            </button>
                            <button type="button" class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.loadPresetPack('opinionstage')">
                                <i class="fas fa-utensils text-emerald"></i> Add OpinionStage Pack
                            </button>
                            <button type="button" class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.importJSONModal()">
                                <i class="fas fa-file-import text-gold"></i> Bulk JSON Import
                            </button>
                        </div>
                    </div>

                    <!-- Questions List Container -->
                    <div id="questionsList">
                        <!-- Dynamic Question Cards populated via js/creator.js -->
                    </div>

                    <div class="creator-bottom-actions" style="display: flex; gap: 1rem; margin-bottom: 3rem;">
                        <button type="button" class="btn btn-secondary-glow btn-lg" onclick="window.quizCreator.addQuestionCard()">
                            <i class="fas fa-plus"></i> Add Question
                        </button>
                        <button id="creatorCancelBtn" type="button" class="btn btn-secondary-glow btn-lg" style="display: none;" onclick="window.quizCreator.cancelEdit()">
                            <i class="fas fa-times"></i> Cancel Edit
                        </button>
                        <button id="creatorSubmitBtn" type="button" class="btn btn-primary-glow btn-lg btn-block" onclick="window.quizCreator.submitQuiz()">
                            <i class="fas fa-save"></i> Publish Custom Quiz
                        </button>
                    </div>
                </div>
            </section>

            <!-- TAB 3: QUIZ PLAYER ENGINE -->
            <section id="tab_player" class="tab-content" style="display: none;">
                <div id="playerArea" class="player-container">
                    <!-- Dynamically rendered via js/player.js -->
                </div>
            </section>

            <!-- TAB 4: LEADERBOARD -->
            <section id="tab_leaderboard" class="tab-content" style="display: none;">
                <div class="hero-banner glass-panel fade-in text-center" style="padding: 2rem;">
                    <h2 class="hero-title"><i class="fas fa-crown text-gold"></i> Dynamic Leaderboards</h2>
                    <p class="hero-sub" style="margin: 0 auto;">Live global ranking showcase. Speed and high accuracy yield maximum points!</p>
                </div>

                <div id="podiumContainer">
                    <!-- Top 3 Podium render via js/leaderboard.js -->
                </div>

                <div id="leaderboardList">
                    <!-- Full leaderboard table render via js/leaderboard.js -->
                </div>
            </section>

            <!-- TAB 5: MY PROFILE -->
            <section id="tab_profile" class="tab-content" style="display: none;">
                <div class="creator-container">
                    <div class="glass-panel fade-in" style="padding: 2rem;">
                        <div id="profilePageContent">
                            <!-- Dynamically populated -->
                        </div>
                    </div>
                </div>
            </section>

            <!-- TAB 6: SETTINGS & ACCOUNT -->
            <section id="tab_settings" class="tab-content" style="display: none;">
                <div class="creator-container">
                    <!-- My Account Section Inside Settings -->
                    <div id="settingsAccountSection"></div>

                    <div class="creator-header-card glass-panel fade-in">
                        <h2 class="hero-title" style="font-size: 1.8rem;"><i class="fas fa-cog text-cyan"></i> Application Settings</h2>
                        <p class="hero-sub" style="margin-bottom: 2rem;">Customize your theme appearance, trivia gameplay preferences, and sound effects.</p>

                        <!-- Theme Mode Switcher -->
                        <div class="form-group">
                            <label><i class="fas fa-adjust text-cyan"></i> Appearance Theme Mode</label>
                            <select id="themeModeSelect" class="input-field" onchange="window.app.setThemeMode(this.value)">
                                <option value="dark">🌙 Dark Mode (Default Obsidian)</option>
                                <option value="light">☀️ Light Mode (Studio Bright)</option>
                                <option value="system">🖥️ System Default Preference</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-volume-up text-cyan"></i> Sound Effects</label>
                            <button class="btn btn-secondary-glow" onclick="toggleSound(document.getElementById('audioMuteBtn'))">
                                Toggle Sound Effects (On / Mute)
                            </button>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-stopwatch text-violet"></i> Preferred Default Question Timer</label>
                            <select id="prefDefaultTimer" class="input-field" onchange="showToast('Default timer preference saved!', 'success')">
                                <option value="10">10 Seconds (Fast)</option>
                                <option value="15" selected>15 Seconds (Standard)</option>
                                <option value="30">30 Seconds (Relaxed)</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-trash-alt text-amber"></i> Local Storage & Cache</label>
                            <button class="btn btn-secondary-glow btn-sm" onclick="localStorage.clear(); showToast('Local storage cleared!', 'info')">
                                Clear Local Storage Cache
                            </button>
                        </div>

                    </div>
                </div>
            </section>

            <!-- TAB 7: HOW TO PLAY & RULES -->
            <section id="tab_help" class="tab-content" style="display: none;">
                <div class="creator-container">
                    <div class="creator-header-card glass-panel fade-in">
                        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
                            <div>
                                <h2 class="hero-title" style="font-size: 1.8rem;"><i class="fas fa-book-open text-cyan"></i> New User Guide & Rules</h2>
                                <p class="hero-sub" style="margin-bottom: 0;">Step-by-step walkthrough on exploring quizzes, timer rules, streak multipliers, and creator features.</p>
                            </div>
                            <button class="btn btn-primary-glow btn-sm" onclick="openTutorialModal()">
                                <i class="fas fa-play-circle"></i> Launch Interactive Walkthrough
                            </button>
                        </div>

                        <div id="helpTabContentArea">
                            <!-- Populated dynamically via js/tutorial.js -->
                        </div>
                    </div>
                </div>
            </section>

        </div>
    </div>


    <!-- MODAL: AUTHENTICATION (LOGIN / REGISTER) -->
    <div id="authModal" class="modal-overlay">
        <div class="modal-box glass-panel" style="max-width: 480px;">
            <button class="modal-close" onclick="closeModal('authModal')">&times;</button>
            
            <div class="auth-tabs-header" style="display: flex; gap: 0.75rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem; padding-bottom: 0.5rem;">
                <button id="authLoginTab" class="cat-pill active" onclick="openAuthModal('login')">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                </button>
                <button id="authRegTab" class="cat-pill" onclick="openAuthModal('register')">
                    <i class="fas fa-user-plus"></i> Register Account
                </button>
            </div>

            <!-- Login Form -->
            <div id="loginFormContainer">
                <div class="form-group">
                    <label><i class="fas fa-user text-cyan"></i> Username or Email</label>
                    <input type="text" id="loginUsername" class="input-field" placeholder="Enter your username or email" onkeyup="if(event.key === 'Enter') window.authManager.login(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value)">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lock text-cyan"></i> Password</label>
                    <input type="password" id="loginPassword" class="input-field" placeholder="••••••••" onkeyup="if(event.key === 'Enter') window.authManager.login(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value)">
                </div>
                <button class="btn btn-primary-glow btn-block mt-3" onclick="window.authManager.login(document.getElementById('loginUsername').value, document.getElementById('loginPassword').value)">
                    <i class="fas fa-sign-in-alt"></i> Sign In
                </button>
            </div>

            <!-- Register Form -->
            <div id="regFormContainer" style="display: none;">
                <div class="form-group">
                    <label><i class="fas fa-user text-cyan"></i> Username</label>
                    <input type="text" id="regUsername" class="input-field" placeholder="Choose a unique username">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-envelope text-cyan"></i> Email Address</label>
                    <input type="email" id="regEmail" class="input-field" placeholder="name@domain.com">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-lock text-cyan"></i> Password</label>
                    <input type="password" id="regPassword" class="input-field" placeholder="••••••••" onkeyup="if(event.key === 'Enter') window.authManager.register(document.getElementById('regUsername').value, document.getElementById('regEmail').value, document.getElementById('regPassword').value)">
                </div>
                <button class="btn btn-primary-glow btn-block mt-3" onclick="window.authManager.register(document.getElementById('regUsername').value, document.getElementById('regEmail').value, document.getElementById('regPassword').value)">
                    <i class="fas fa-user-plus"></i> Create Free Account
                </button>
            </div>
        </div>
    </div>


    <!-- MODAL: USER PROFILE & STATS -->
    <div id="profileModal" class="modal-overlay">
        <div class="modal-box glass-panel" style="max-width: 550px;">
            <button class="modal-close" onclick="closeModal('profileModal')">&times;</button>
            <div id="profileModalContent">
                <!-- Dynamically populated via js/auth.js -->
            </div>
        </div>
    </div>


    <!-- MODAL: BULK JSON IMPORT -->
    <div id="jsonImportModal" class="modal-overlay">
        <div class="modal-box glass-panel" style="max-width: 600px;">
            <button class="modal-close" onclick="closeModal('jsonImportModal')">&times;</button>
            <h3 style="margin-bottom: 1rem;"><i class="fas fa-file-code text-cyan"></i> Bulk JSON Importer</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Paste a valid JSON quiz structure or array of questions to load them instantly into the builder.</p>

            <div class="form-group">
                <textarea id="jsonTextarea" class="input-field" rows="10" placeholder='{
  "title": "My Custom JSON Quiz",
  "category": "Web Dev",
  "questions": [
    {
      "question_text": "What is 2 + 2?",
      "option_a": "3", "option_b": "4", "option_c": "5", "option_d": "6",
      "correct_option": 1, "points": 100
    }
  ]
}'></textarea>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button class="btn btn-secondary-glow" onclick="closeModal('jsonImportModal')">Cancel</button>
                <button class="btn btn-primary-glow" onclick="window.quizCreator.processImportedJSON()">Import Data</button>
            </div>
        </div>
    </div>


    <!-- MODAL: IMAGE LIGHTBOX ZOOM -->
    <div id="imageModal" class="modal-overlay" onclick="closeModal('imageModal')">
        <div style="max-width: 80vw; max-height: 80vh;">
            <img id="modalImageDisplay" src="" style="width: 100%; height: 100%; object-fit: contain; border-radius: var(--radius-md);" alt="Zoomed Visual">
        </div>
    </div>


    <!-- MODAL: INTERACTIVE TUTORIAL GUIDE MODAL -->
    <div id="tutorialModal" class="modal-overlay">
        <div class="modal-box glass-panel" style="max-width: 580px; text-align: center;">
            <button class="modal-close" onclick="closeModal('tutorialModal')">&times;</button>
            <h3 id="tutorialStepTitle" style="margin-bottom: 1rem; color: var(--primary-cyan); font-size: 1.3rem;">
                <i class="fas fa-graduation-cap"></i> Quick Tutorial Guide
            </h3>
            
            <div id="tutorialStepContent">
                <!-- Dynamically populated via js/tutorial.js -->
            </div>

            <div id="tutorialStepDots" style="margin-bottom: 1.25rem; display: flex; justify-content: center; gap: 0.4rem; align-items: center;"></div>

            <div style="display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                <button id="tutorialPrevBtn" class="btn btn-secondary-glow" onclick="window.tutorialManager.prevStep()">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <button id="tutorialNextBtn" class="btn btn-primary-glow" onclick="window.tutorialManager.nextStep()">
                    Next Step <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    </div>


    <!-- MODAL: QUIZ WRONG ANSWER / FAIL VIDEO MODAL -->
    <div id="quizVideoModal" class="modal-overlay">
        <div class="modal-box glass-panel" style="max-width: 650px; text-align: center;">
            <button id="videoCloseBtn" class="modal-close" style="display: none;" onclick="closeQuizVideoModal()">&times;</button>
            <h3 id="videoModalTitle" style="margin-bottom: 1rem; color: var(--accent-danger);">
                <i class="fas fa-video"></i> Video Alert!
            </h3>
            <div style="width: 100%; border-radius: var(--radius-md); overflow: hidden; background: #000; margin-bottom: 1rem;">
                <video id="quizVideoElement" controls autoplay style="width: 100%; max-height: 400px; display: block;">
                    <source id="quizVideoSource" src="video/rasman.mp4" type="video/mp4">
                    Your browser does not support HTML5 video.
                </video>
            </div>
            <div id="videoModalNotice" style="margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-muted);">
                <i class="fas fa-lock text-amber"></i> Please watch the video to proceed...
            </div>
            <button id="videoContinueBtn" class="btn btn-secondary" disabled onclick="closeQuizVideoModal()">
                <i class="fas fa-lock"></i> Watch Video to Continue
            </button>
        </div>
    </div>



    <!-- Global Toast Container -->
    <div id="toastContainer" class="toast-container"></div>


    <!-- JavaScript Modules -->
    <script src="js/audio.js?v=1.5"></script>
    <script src="js/auth.js?v=1.5"></script>
    <script src="js/creator.js?v=1.5"></script>
    <script src="js/player.js?v=1.5"></script>
    <script src="js/leaderboard.js?v=1.5"></script>
    <script src="js/tutorial.js?v=1.5"></script>
    <script src="js/app.js?v=1.5"></script>
</body>
</html>
