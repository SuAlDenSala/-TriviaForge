/**
 * js/player.js - Timed AJAX Question Delivery Engine, Live Score Calculator & Audio Synced Gameplay
 */
class QuizPlayer {
    constructor() {
        this.activeQuiz = null;
        this.currentIndex = 0;
        this.totalQuestions = 0;
        this.timePerQuestion = 15;
        
        // Gameplay session stats
        this.totalScore = 0;
        this.currentStreak = 0;
        this.maxStreak = 0;
        this.correctCount = 0;
        this.quizStartTime = 0;
        
        // Timer handles
        this.timerInterval = null;
        this.timeRemainingMs = 0;
        this.questionStartTime = 0;
        this.isAnswering = false;

        // Shuffle map: optionShuffleMap[displayedPosition] = originalIndex
        this.optionShuffleMap = [0, 1, 2, 3];
    }

    async startQuiz(quizId, autoBegin = true) {
        if (!window.authManager || !window.authManager.currentUser) {
            if (typeof showToast === 'function') {
                showToast('Please log in or create an account to play quizzes!', 'warning');
            }
            if (typeof openAuthModal === 'function') {
                openAuthModal('login');
            }
            return;
        }

        try {
            const playerArea = document.getElementById('playerArea');
            if (playerArea) playerArea.innerHTML = '<div class="loader-spinner"></div>';
            switchTab('player');

            const res = await fetch(`api/quizzes.php?id=${quizId}`);
            const data = await res.json();
            if (data.status !== 'success' || !data.quiz) {
                showToast('Failed to load quiz details.', 'error');
                return;
            }

            this.activeQuiz = data.quiz;
            this.currentIndex = 0;
            this.totalScore = 0;
            this.currentStreak = 0;
            this.maxStreak = 0;
            this.correctCount = 0;
            this.quizStartTime = Date.now();

            if (autoBegin) {
                this.beginQuestions();
            } else {
                this.renderLobby();
            }
        } catch (err) {
            showToast('Error starting quiz: ' + err.message, 'error');
        }
    }

    renderLobby() {
        const playerArea = document.getElementById('playerArea');
        if (!playerArea) return;

        const q = this.activeQuiz;
        playerArea.innerHTML = `
            <div class="quiz-lobby-card glass-panel fade-in">
                <div class="lobby-banner-wrapper">
                    <img src="${q.banner_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" class="lobby-banner-img" alt="Banner">
                    <div class="banner-gradient-overlay"></div>
                    <span class="category-badge top-right">${escapeHTML(q.category)}</span>
                </div>
                
                <div class="lobby-content">
                    <h2 class="lobby-title">${escapeHTML(q.title)}</h2>
                    <p class="lobby-desc">${escapeHTML(q.description || 'Test your speed and knowledge in this timed trivia challenge!')}</p>

                    <div class="lobby-meta-grid">
                        <div class="meta-card">
                            <i class="fas fa-list-ol meta-icon text-cyan"></i>
                            <span class="meta-val">${q.question_count || 0} Questions</span>
                        </div>
                        <div class="meta-card">
                            <i class="fas fa-stopwatch meta-icon text-violet"></i>
                            <span class="meta-val">${q.time_per_question}s / Question</span>
                        </div>
                        <div class="meta-card">
                            <i class="fas fa-layer-group meta-icon text-emerald"></i>
                            <span class="meta-val">${escapeHTML(q.difficulty)}</span>
                        </div>
                        <div class="meta-card">
                            <i class="fas fa-user-edit meta-icon text-amber"></i>
                            <span class="meta-val">${escapeHTML(q.creator_name || 'Community')}</span>
                        </div>
                    </div>

                    <div class="lobby-actions">
                        <button class="btn btn-primary-glow btn-lg btn-block" onclick="window.quizPlayer.beginQuestions()">
                            <i class="fas fa-play"></i> Start Timed Trivia Challenge
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    beginQuestions() {
        if (window.quizAudio) window.quizAudio.init();
        const playerArea = document.getElementById('playerArea');
        if (playerArea) playerArea.innerHTML = '<div class="loader-spinner"></div>';
        
        this.currentIndex = 0;
        this.loadNextQuestion();
    }

    async loadNextQuestion() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.isAnswering = false;

        try {
            const res = await fetch(`api/question.php?quiz_id=${this.activeQuiz.id}&index=${this.currentIndex}`);
            const data = await res.json();

            if (data.status === 'complete') {
                this.finishQuiz();
                return;
            }

            if (data.status === 'cooldown') {
                const remSec = data.cooldown_remaining || 3600;
                localStorage.setItem(`cooldown_quiz_${this.activeQuiz.id}`, Date.now() + (remSec * 1000));
                showToast(data.message || 'Quiz cooldown active. Please wait 1 hour before playing again.', 'warning');
                switchTab('explore');
                if (window.app) window.app.loadQuizzes();
                return;
            }

            if (data.status !== 'success') {
                showToast(data.message || 'Error fetching question', 'error');
                return;
            }

            this.totalQuestions = data.total_questions;
            this.timePerQuestion = data.time_per_question;
            this.renderQuestionView(data.question);
            this.startTimer();
        } catch (err) {
            showToast('Error loading question: ' + err.message, 'error');
        }
    }

    /**
     * Fisher-Yates shuffle on options array.
     * Returns shuffled options and the map: shuffleMap[displayPos] = originalIndex
     */
    shuffleOptions(options) {
        const indices = [0, 1, 2, 3];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const shuffledOptions = indices.map(i => options[i]);
        return { shuffledOptions, shuffleMap: indices };
    }

    renderQuestionView(question) {
        const playerArea = document.getElementById('playerArea');
        if (!playerArea) return;

        // Shuffle the answer choices and store the position→original map
        const { shuffledOptions, shuffleMap } = this.shuffleOptions(question.options);
        question.options = shuffledOptions;
        this.optionShuffleMap = shuffleMap;

        // Store reference so handleTimeout() can access the question ID
        this.currentQuestion = question;

        const currentQNum = this.currentIndex + 1;
        const progressPct = ((currentQNum - 1) / this.totalQuestions) * 100;

        playerArea.innerHTML = `
            <div class="active-quiz-info-bar fade-in" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; padding: 0.6rem 1rem; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden;">
                    <span style="font-size: 0.75rem; padding: 0.2rem 0.65rem; border-radius: 20px; background: var(--primary-cyan); color: #000; font-weight: 800; text-transform: uppercase;">${escapeHTML(this.activeQuiz?.category || 'General')}</span>
                    <span style="font-size: 0.75rem; padding: 0.2rem 0.65rem; border-radius: 20px; background: rgba(255,255,255,0.1); border: 1px solid var(--border-color); font-weight: 700;">${escapeHTML(this.activeQuiz?.difficulty || 'Medium')}</span>
                    <strong style="font-size: 0.95rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-color);">${escapeHTML(this.activeQuiz?.title || 'Trivia Quiz')}</strong>
                </div>
                <span style="font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; margin-left: 0.5rem;"><i class="fas fa-user-edit text-amber"></i> ${escapeHTML(this.activeQuiz?.creator_name || 'Community')}</span>
            </div>

            <div class="game-hud-bar glass-panel">
                <div class="hud-item">
                    <span class="hud-label">Question</span>
                    <span class="hud-value text-cyan">${currentQNum} / ${this.totalQuestions}</span>
                </div>

                <div class="timer-container">
                    <svg class="timer-svg" viewBox="0 0 100 100">
                        <circle class="timer-bg-ring" cx="50" cy="50" r="42"></circle>
                        <circle id="timerProgressRing" class="timer-progress-ring" cx="50" cy="50" r="42" stroke-dasharray="264" stroke-dashoffset="0"></circle>
                    </svg>
                    <span id="timerText" class="timer-text">${this.timePerQuestion}</span>
                </div>

                <div class="hud-item text-right">
                    <span class="hud-label">Live Score</span>
                    <span id="hudScore" class="hud-value text-gold">${this.totalScore}</span>
                </div>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progressPct}%;"></div>
            </div>

            ${this.currentStreak > 1 ? `
                <div class="streak-badge-banner bounce-in">
                    <i class="fas fa-fire flame-icon"></i> ${this.currentStreak}x STREAK MULTIPLIER ACTIVE!
                </div>
            ` : ''}

            <div class="question-card glass-panel fade-in">
                <div class="question-header">
                    <h3 class="question-text">${escapeHTML(question.question_text)}</h3>
                </div>

                ${question.image_url ? `
                    <div class="question-image-box" onclick="window.quizPlayer.zoomImage('${escapeHTML(question.image_url)}')">
                        <img src="${escapeHTML(question.image_url)}" class="q-display-img" alt="Trivia Visual">
                        <span class="zoom-hint"><i class="fas fa-search-plus"></i> Click to Zoom</span>
                    </div>
                ` : ''}

                <div class="options-container" id="optionsContainer">
                    ${question.options.map((opt, idx) => `
                        <button class="option-btn" id="optBtn_${idx}" onclick="window.quizPlayer.submitAnswer(${question.id}, ${idx})">
                            <span class="option-prefix">${['A', 'B', 'C', 'D'][idx]}</span>
                            <span class="option-text">${escapeHTML(opt)}</span>
                        </button>
                    `).join('')}
                </div>

                <div id="feedbackContainer" class="feedback-container" style="display: none;"></div>
            </div>
        `;
    }

    startTimer() {
        const totalDurationMs = this.timePerQuestion * 1000;
        this.timeRemainingMs = totalDurationMs;
        this.questionStartTime = Date.now();

        const ring = document.getElementById('timerProgressRing');
        const text = document.getElementById('timerText');
        const totalCircumference = 264;

        this.timerInterval = setInterval(() => {
            const elapsedMs = Date.now() - this.questionStartTime;
            this.timeRemainingMs = Math.max(0, totalDurationMs - elapsedMs);
            const remainingSec = Math.ceil(this.timeRemainingMs / 1000);

            if (text) text.innerText = remainingSec;

            if (ring) {
                const fraction = this.timeRemainingMs / totalDurationMs;
                const offset = totalCircumference * (1 - fraction);
                ring.style.strokeDashoffset = offset;

                if (remainingSec <= 5) {
                    ring.classList.add('warning-pulse');
                    if (Math.floor(elapsedMs / 1000) !== Math.floor((elapsedMs - 100) / 1000)) {
                        window.quizAudio.playTick();
                    }
                }
            }

            if (this.timeRemainingMs <= 0) {
                clearInterval(this.timerInterval);
                this.handleTimeout();
            }
        }, 100);
    }

    async submitAnswer(questionId, selectedDisplayIndex) {
        if (this.isAnswering) return;
        this.isAnswering = true;

        if (this.timerInterval) clearInterval(this.timerInterval);

        const timeSpentMs = Date.now() - this.questionStartTime;

        // Map the displayed (shuffled) position back to the original A/B/C/D index
        // -1 means timeout — pass through unchanged
        const selectedIndex = selectedDisplayIndex === -1
            ? -1
            : this.optionShuffleMap[selectedDisplayIndex];

        // Disable all option buttons
        const container = document.getElementById('optionsContainer');
        if (container) {
            const buttons = container.querySelectorAll('.option-btn');
            buttons.forEach(btn => btn.disabled = true);
        }

        try {
            const res = await fetch('api/submit_answer.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: this.activeQuiz.id,
                    question_id: questionId,
                    selected_option: selectedIndex,
                    time_spent_ms: timeSpentMs,
                    current_streak: this.currentStreak
                })
            });
            const data = await res.json();

            if (data.status === 'success') {
                this.processAnswerResult(data, selectedDisplayIndex);
            } else {
                showToast(data.message || 'Submission error', 'error');
            }
        } catch (err) {
            showToast('Failed to evaluate answer', 'error');
        }
    }

    handleTimeout() {
        if (this.isAnswering) return;
        if (this.currentQuestion) {
            this.submitAnswer(this.currentQuestion.id, -1); // -1 = timeout (no shuffle mapping needed)
        }
    }

    processAnswerResult(result, selectedDisplayIndex) {
        const isCorrect = result.is_correct;
        const correctOriginalIndex = result.correct_option;

        // Find which displayed button position the correct answer landed in after shuffle
        const correctDisplayIndex = this.optionShuffleMap.indexOf(correctOriginalIndex);

        const selBtn = document.getElementById(`optBtn_${selectedDisplayIndex}`);
        const correctBtn = document.getElementById(`optBtn_${correctDisplayIndex}`);

        if (isCorrect) {
            if (selBtn) selBtn.classList.add('opt-correct', 'pulse-glow');
            this.correctCount++;
            this.currentStreak = result.new_streak;
            if (this.currentStreak > this.maxStreak) this.maxStreak = this.currentStreak;
            this.totalScore += result.points_earned;

            if (this.currentStreak >= 3) {
                window.quizAudio.playStreak();
            } else {
                window.quizAudio.playCorrect();
            }
        } else {
            if (selBtn) selBtn.classList.add('opt-wrong', 'shake');
            if (correctBtn) correctBtn.classList.add('opt-correct');
            this.currentStreak = 0;
            window.quizAudio.playWrong();
        }

        // Update score in HUD
        const hudScore = document.getElementById('hudScore');
        if (hudScore) hudScore.innerText = this.totalScore;

        // Render feedback banner without manual next button
        const feedback = document.getElementById('feedbackContainer');
        if (feedback) {
            feedback.style.display = 'block';
            feedback.className = `feedback-container ${isCorrect ? 'feedback-success' : 'feedback-error'} slide-up`;
            feedback.innerHTML = `
                <div class="feedback-header">
                    <h4>${isCorrect ? '🎉 Correct!' : (selectedDisplayIndex === -1 ? '⏰ Time\'s Up! Marked as Wrong' : '❌ Incorrect')}</h4>
                    ${isCorrect ? `<span class="score-popup">+${result.points_earned} Pts ${result.speed_bonus > 0 ? `(+${result.speed_bonus} Speed)` : ''}</span>` : ''}
                </div>
                <p class="feedback-expl">${escapeHTML(result.explanation)}</p>
            `;
        }

        // Automatically advance to next question after feedback delay
        setTimeout(() => {
            this.advanceToNext();
        }, 1200);
    }

    advanceToNext() {
        this.isAnswering = false;
        this.currentIndex++;
        this.loadNextQuestion();
    }

    async finishQuiz() {
        const totalDurationSec = Math.round((Date.now() - this.quizStartTime) / 1000);
        const accuracyPct = this.totalQuestions > 0 ? Math.round((this.correctCount / this.totalQuestions) * 100) : 0;

        window.quizAudio.playVictory();

        const playerIdentity = window.authManager ? window.authManager.getPlayerIdentity() : null;

        // Submit to leaderboard
        try {
            await fetch('api/leaderboard.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quiz_id: this.activeQuiz.id,
                    player_name: (playerIdentity && playerIdentity.name) ? playerIdentity.name : 'Player',
                    score: this.totalScore,
                    accuracy: accuracyPct,
                    total_time: totalDurationSec,
                    streak_max: this.maxStreak
                })
            });
        } catch (err) {
            console.error('Leaderboard submission error:', err);
        }

        // Trigger Confetti effect
        this.triggerConfetti();

        // Record 1-hour cooldown locally for this quiz
        if (this.activeQuiz && this.activeQuiz.id) {
            localStorage.setItem(`cooldown_quiz_${this.activeQuiz.id}`, Date.now() + 3600000);
        }
        if (window.app) window.app.loadQuizzes();

        const playerArea = document.getElementById('playerArea');
        if (!playerArea) return;

        playerArea.innerHTML = `
            <div class="victory-card glass-panel fade-in text-center">
                <div class="victory-trophy-box">
                    <i class="fas fa-trophy trophy-glow"></i>
                </div>

                <h2 class="victory-title">Quiz Complete!</h2>
                <p class="victory-subtitle">Outstanding performance in <strong>${escapeHTML(this.activeQuiz.title)}</strong></p>

                <div class="victory-stats-grid">
                    <div class="v-stat-card">
                        <span class="v-stat-num text-gold">${this.totalScore}</span>
                        <span class="v-stat-label">Final Score</span>
                    </div>
                    <div class="v-stat-card">
                        <span class="v-stat-num text-cyan">${accuracyPct}%</span>
                        <span class="v-stat-label">Accuracy (${this.correctCount}/${this.totalQuestions})</span>
                    </div>
                    <div class="v-stat-card">
                        <span class="v-stat-num text-violet">${this.maxStreak}x</span>
                        <span class="v-stat-label">Max Streak</span>
                    </div>
                    <div class="v-stat-card">
                        <span class="v-stat-num text-emerald">${totalDurationSec}s</span>
                        <span class="v-stat-label">Total Time</span>
                    </div>
                </div>

                <div class="victory-actions">
                    <button class="btn btn-primary-glow" onclick="window.quizPlayer.startQuiz(${this.activeQuiz.id})">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                    <button class="btn btn-secondary-glow" onclick="switchTab('leaderboard'); window.leaderboard.loadLeaderboard(${this.activeQuiz.id});">
                        <i class="fas fa-list-ol"></i> View Leaderboard
                    </button>
                </div>
            </div>
        `;
    }

    triggerConfetti() {
        // Lightweight canvas confetti synthesis
        const canvas = document.createElement('canvas');
        canvas.className = 'confetti-canvas';
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#00f2fe', '#4facfe', '#00f2fe', '#7928ca', '#f59e0b', '#10b981'];

        for (let i = 0; i < 80; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 4 + 2,
                angle: Math.random() * 360
            });
        }

        let frame = 0;
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.speed;
                p.angle += 3;
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.angle * Math.PI) / 180);
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });
            frame++;
            if (frame < 180) {
                requestAnimationFrame(animate);
            } else {
                canvas.remove();
            }
        }
        animate();
    }

    zoomImage(url) {
        openImageModal(url);
    }
}

window.quizPlayer = new QuizPlayer();

// Quiz Video Player Modal Helpers
let isVideoFinished = false;

function playQuizVideo(videoPath = 'video/rasman.mp4', titleText = 'Wrong Answer Video Alert') {
    const modal = document.getElementById('quizVideoModal');
    const video = document.getElementById('quizVideoElement');
    const source = document.getElementById('quizVideoSource');
    const title = document.getElementById('videoModalTitle');
    const closeBtn = document.getElementById('videoCloseBtn');
    const continueBtn = document.getElementById('videoContinueBtn');
    const notice = document.getElementById('videoModalNotice');

    if (!modal || !video) return false;

    isVideoFinished = false;

    if (title) title.innerHTML = `<i class="fas fa-video text-amber"></i> ${escapeHTML(titleText)}`;

    if (closeBtn) closeBtn.style.display = 'none';

    if (continueBtn) {
        continueBtn.disabled = true;
        continueBtn.className = 'btn btn-secondary';
        continueBtn.innerHTML = '<i class="fas fa-lock"></i> Watch Video to Continue';
    }

    if (notice) {
        notice.innerHTML = '<i class="fas fa-lock text-amber"></i> Please watch the video to the end to proceed.';
    }

    const targetPath = videoPath || 'video/rasman.mp4';
    if (source) source.src = targetPath;
    video.src = targetPath;
    video.load();

    openModal('quizVideoModal');

    // Attach event listeners for video completion and error handling
    video.onended = () => {
        isVideoFinished = true;
        if (closeBtn) closeBtn.style.display = 'block';
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.className = 'btn btn-primary-glow pulse-glow';
            continueBtn.innerHTML = 'Continue Gameplay <i class="fas fa-arrow-right"></i>';
        }
        if (notice) {
            notice.innerHTML = '<i class="fas fa-check-circle text-emerald"></i> Video complete! Click continue to proceed.';
        }
    };

    video.onerror = () => {
        // Fallback so user isn't stuck if video file is missing
        isVideoFinished = true;
        if (closeBtn) closeBtn.style.display = 'block';
        if (continueBtn) {
            continueBtn.disabled = false;
            continueBtn.className = 'btn btn-primary-glow';
            continueBtn.innerHTML = 'Continue Gameplay <i class="fas fa-arrow-right"></i>';
        }
        if (notice) {
            notice.innerHTML = '<i class="fas fa-exclamation-triangle text-amber"></i> Video file missing. Place rasman.mp4 in video/ folder.';
        }
    };

    const playPromise = video.play();
    if (playPromise !== undefined) {
        playPromise.catch(err => {
            console.log('Video autoplay status / file check:', err);
        });
    }

    return true;
}

function closeQuizVideoModal() {
    if (!isVideoFinished) {
        if (typeof showToast === 'function') {
            showToast('Please watch the full video before continuing!', 'warning');
        }
        return;
    }

    const video = document.getElementById('quizVideoElement');
    if (video) {
        video.pause();
        video.currentTime = 0;
    }
    closeModal('quizVideoModal');
    if (window.quizPlayer && window.quizPlayer._pendingAdvance) {
        window.quizPlayer._pendingAdvance = false;
        window.quizPlayer.advanceToNext();
    }
}
