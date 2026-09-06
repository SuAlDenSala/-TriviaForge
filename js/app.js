/**
 * js/app.js - Main Application Controller, Router & UI Interactivity with 1-Hour Quiz Cooldown Ticker
 */
class AppController {
    constructor() {
        this.quizzes = [];
        this.categories = [];
        this.currentCategory = 'All';
        this.currentDifficulty = 'All';
        this.cardSelectedDifficulty = {};
        this.cooldownTicker = null;
    }

    async init() {
        console.log('Trivia Quiz App initializing...');
        this.initTheme();
        initSidebarState();
        await window.authManager.checkSession();
        await this.loadQuizzes();
        window.quizCreator.init();
        this.startCooldownTicker();

        // Handle URL hash tab routing
        const hash = window.location.hash.replace('#', '') || 'explore';
        switchTab(hash);
    }

    initTheme() {
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                const currentMode = localStorage.getItem('trivia_theme_mode') || 'system';
                if (currentMode === 'system') {
                    this.applyEffectiveTheme('system');
                }
            });
        }

        const savedTheme = localStorage.getItem('trivia_theme_mode') || 'system';
        this.setThemeMode(savedTheme, false);
    }

    applyEffectiveTheme(mode) {
        let effectiveTheme = mode;
        if (mode === 'system') {
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            effectiveTheme = prefersDark ? 'dark' : 'light';
        }

        document.documentElement.setAttribute('data-theme', effectiveTheme);
        document.body.setAttribute('data-theme', effectiveTheme);

        const selectEl = document.getElementById('themeModeSelect');
        if (selectEl) {
            selectEl.value = mode;
        }

        return effectiveTheme;
    }

    setThemeMode(mode, showToastMsg = true) {
        localStorage.setItem('trivia_theme_mode', mode);
        const effective = this.applyEffectiveTheme(mode);

        if (showToastMsg) {
            let label = 'System Default';
            if (mode === 'dark') label = 'Dark Mode';
            else if (mode === 'light') label = 'Light Mode';
            else label = `System Default (${effective === 'dark' ? 'Dark' : 'Light'})`;
            
            showToast(`Appearance updated to ${label}`, 'success');
        }
    }

    getRemainingCooldown(quizId, serverCooldownSec = 0) {
        const localEnd = localStorage.getItem(`cooldown_quiz_${quizId}`);
        let localRemaining = 0;
        if (localEnd) {
            localRemaining = Math.max(0, Math.ceil((parseInt(localEnd, 10) - Date.now()) / 1000));
        }
        return Math.max(serverCooldownSec || 0, localRemaining);
    }

    formatCooldown(seconds) {
        if (seconds <= 0) return '0m 00s';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }

    startCooldownTicker() {
        if (this.cooldownTicker) clearInterval(this.cooldownTicker);
        this.cooldownTicker = setInterval(() => {
            if (!this.quizzes || this.quizzes.length === 0) return;
            this.quizzes.forEach(q => {
                const rem = this.getRemainingCooldown(q.id, q.cooldown_sec);
                if (q._prevRem !== rem) {
                    const wasCooldown = (q._prevRem || 0) > 0;
                    q._prevRem = rem;

                    // Update badge and button text directly in the DOM without re-rendering the grid
                    const badgeEl = document.querySelector(`#quizCard_${q.id} .cooldown-pill-badge`);
                    if (badgeEl) {
                        badgeEl.innerHTML = `<i class="fas fa-hourglass-half text-amber"></i> Cooldown: ${this.formatCooldown(rem)}`;
                    }

                    const btnEl = document.querySelector(`#quizCard_${q.id} .btn-cooldown`);
                    if (btnEl) {
                        btnEl.innerHTML = `<i class="fas fa-clock text-amber"></i> ${this.formatCooldown(rem)}`;
                    }

                    // Re-render grid only if a cooldown has completely expired to restore the Play button
                    if (wasCooldown && rem === 0) {
                        this.renderQuizzesGrid();
                    }
                }
            });
        }, 1000);
    }

    async loadQuizzes(category = 'All', difficulty = this.currentDifficulty, search = '') {
        localStorage.removeItem('cooldown_quiz_38');
        this.currentCategory = category;
        this.currentDifficulty = difficulty;

        const grid = document.getElementById('quizzesGrid');
        if (grid && (!this.quizzes || this.quizzes.length === 0)) {
            grid.innerHTML = '<div class="loader-spinner"></div>';
        }

        try {
            const url = `api/quizzes.php?category=${encodeURIComponent(category)}&difficulty=${encodeURIComponent(difficulty)}&search=${encodeURIComponent(search)}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.status === 'success') {
                this.quizzes = data.quizzes;
                this.categories = data.categories;
                this.renderCategoryFilter();
                this.renderDifficultyFilter();
                this.renderQuizzesGrid();
            } else {
                showToast('Failed to fetch quizzes', 'error');
            }
        } catch (err) {
            console.error('Error fetching quizzes:', err);
        }
    }

    renderCategoryFilter() {
        const container = document.getElementById('categoryFilter');
        if (!container) return;

        const defaultCats = ['All', 'CCS', 'Web Dev', 'Science', 'Gaming', 'Cyber Sec', 'AI & ML', 'Movies & Culture', 'Geography', 'Anime & Manga', 'Mathematics'];
        let categories = [...defaultCats];

        if (this.categories && Array.isArray(this.categories)) {
            this.categories.forEach(c => {
                const catName = (typeof c === 'object' && c !== null) ? c.category : c;
                if (catName && typeof catName === 'string' && !categories.includes(catName)) {
                    categories.push(catName);
                }
            });
        }

        let html = '<span class="filter-label" style="white-space: nowrap; display: flex; align-items: center; gap: 0.3rem;"><i class="fas fa-tags text-cyan"></i> Category:</span> ';

        categories.forEach(cat => {
            const isActive = (this.currentCategory || 'All') === cat;
            html += `
                <button class="cat-pill ${isActive ? 'active' : ''}" onclick="window.app.filterByCategory('${escapeHTML(cat)}')" style="white-space: nowrap;">
                    <i class="fas fa-tag text-amber" style="font-size: 0.7rem;"></i> ${escapeHTML(cat)}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    filterByCategory(cat) {
        this.currentCategory = cat;
        const searchVal = document.getElementById('searchInput')?.value || '';
        this.loadQuizzes(cat, this.currentDifficulty, searchVal);
    }

    renderDifficultyFilter() {
        const container = document.getElementById('difficultyFilter');
        if (!container) return;

        const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
        let html = '<span class="filter-label"><i class="fas fa-layer-group text-cyan"></i> Difficulty:</span> ';

        difficulties.forEach(diff => {
            const isActive = this.currentDifficulty === diff;
            const diffClass = diff === 'All' ? 'cat-pill' : `cat-pill diff-pill-${diff.toLowerCase()}`;
            html += `
                <button class="${diffClass} ${isActive ? 'active' : ''}" onclick="window.app.filterByDifficulty('${diff}')">
                    ${diff === 'All' ? 'All Difficulties' : diff}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    filterByDifficulty(diff) {
        this.currentDifficulty = diff;
        const searchVal = document.getElementById('searchInput')?.value || '';
        this.loadQuizzes(this.currentCategory, diff, searchVal);
    }

    renderQuizzesGrid() {
        const grid = document.getElementById('quizzesGrid');
        if (!grid) return;

        if (this.quizzes.length === 0) {
            grid.innerHTML = `
                <div class="empty-state-card full-width glass-panel">
                    <i class="fas fa-search"></i>
                    <h3>No Quizzes Found</h3>
                    <p>Try resetting filters or create your own custom trivia quiz!</p>
                    <button class="btn btn-primary-glow mt-3" onclick="switchTab('creator')">
                        <i class="fas fa-plus"></i> Create Custom Quiz
                    </button>
                </div>
            `;
            return;
        }

        let html = '';
        const currentUser = window.authManager?.currentUser;

        this.quizzes.forEach(q => {
            const cooldownSec = this.getRemainingCooldown(q.id, q.cooldown_sec);
            const isCooldown = cooldownSec > 0;
            const diff = q.difficulty ? q.difficulty.toLowerCase() : 'medium';
            const isOwner = (currentUser && q.user_id && parseInt(q.user_id) === parseInt(currentUser.id)) ||
                            (currentUser && q.creator_name && q.creator_name.toLowerCase() === currentUser.username.toLowerCase()) ||
                            (!q.user_id && q.creator_name && !['official', 'system'].includes(q.creator_name.toLowerCase()));

            html += `
                <div class="quiz-card glass-panel fade-in" id="quizCard_${q.id}">
                    <div class="quiz-card-banner">
                        <img src="${q.banner_url || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" class="quiz-banner-img" alt="Quiz Banner" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';">
                        <div class="banner-gradient-overlay"></div>
                        <span class="difficulty-badge top-left diff-${diff}">${escapeHTML(q.difficulty || 'Medium')}</span>
                        <span class="category-badge top-right"><i class="fas fa-tag text-amber" style="font-size: 0.7rem;"></i> ${escapeHTML(q.category || 'General')}</span>
                        ${isCooldown ? `
                            <span class="cooldown-pill-badge"><i class="fas fa-hourglass-half text-amber"></i> Cooldown: ${this.formatCooldown(cooldownSec)}</span>
                        ` : ''}
                    </div>

                    <div class="quiz-card-body">
                        <h3 class="quiz-card-title">${escapeHTML(q.title)}</h3>
                        <p class="quiz-card-desc">${escapeHTML(q.description || 'Timed AJAX trivia challenge.')}</p>

                        <div class="quiz-card-meta">
                            <span><i class="fas fa-question-circle text-cyan"></i> ${q.question_count} Qs</span>
                            <span><i class="fas fa-stopwatch text-violet"></i> ${q.time_per_question}s / Q</span>
                            <span><i class="fas fa-gamepad text-emerald"></i> ${q.play_count} Plays</span>
                        </div>
                    </div>

                    <div class="quiz-card-footer">
                        <span class="creator-by"><i class="fas fa-user-edit"></i> ${escapeHTML(q.creator_name)}</span>
                        <div style="display: flex; gap: 0.4rem; align-items: center;">
                            ${isOwner ? `
                                <button class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.editQuiz(${q.id})" title="Edit Quiz">
                                    <i class="fas fa-edit text-amber"></i> Edit
                                </button>
                            ` : ''}
                            ${isCooldown ? `
                                <button class="btn btn-secondary-glow btn-sm btn-cooldown" onclick="showToast('Quiz Cooldown Active! You can play this challenge again in ${this.formatCooldown(cooldownSec)}.', 'warning')">
                                    <i class="fas fa-clock text-amber"></i> ${this.formatCooldown(cooldownSec)}
                                </button>
                            ` : `
                                <button class="btn btn-primary-glow btn-sm" onclick="window.quizPlayer.startQuiz(${q.id})">
                                    Play <i class="fas fa-play"></i>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }
}

// Global SPA Router Function
function switchTab(tabId) {
    const tabs = ['explore', 'creator', 'player', 'leaderboard', 'profile', 'settings', 'help'];
    tabs.forEach(t => {
        const sec = document.getElementById(`tab_${t}`);
        const navBtn = document.getElementById(`navBtn_${t}`);
        if (sec) sec.style.display = (t === tabId) ? 'block' : 'none';
        if (navBtn) navBtn.classList.toggle('active', t === tabId);
    });

    // Close mobile drawer on tab switch
    toggleSidebar(false);

    window.location.hash = tabId;

    if (tabId === 'player' && (!window.authManager || !window.authManager.currentUser)) {
        switchTab('explore');
        if (typeof showToast === 'function') {
            showToast('Please log in or create an account to play quizzes!', 'warning');
        }
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
        return;
    }

    if (tabId === 'leaderboard' && window.leaderboard) {
        window.leaderboard.loadLeaderboard();
    }
    if ((tabId === 'settings' || tabId === 'profile') && window.authManager) {
        window.authManager.loadSettingsAccount();
    }
    if (tabId === 'settings' && window.app) {
        window.app.applyEffectiveTheme(localStorage.getItem('trivia_theme_mode') || 'system');
    }
    if (tabId === 'help' && window.tutorialManager) {
        window.tutorialManager.renderHelpTabContent();
    }
}

function updateHamburgerIcons(isMobileOpen, isDesktopCollapsed) {
    const mobileBtn = document.querySelector('.mobile-toggle-btn');
    if (mobileBtn) {
        const icon = mobileBtn.querySelector('i');
        if (icon) {
            icon.className = isMobileOpen ? 'fas fa-times' : 'fas fa-bars';
        }
    }

    const sidebarBtn = document.querySelector('.sidebar-toggle-btn');
    if (sidebarBtn) {
        const icon = sidebarBtn.querySelector('i');
        if (icon) {
            icon.className = isDesktopCollapsed ? 'fas fa-bars' : 'fas fa-times';
        }
    }
}

function toggleSidebar(open) {
    const sidebar = document.getElementById('appSidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (!sidebar) return;

    const isOpen = (open === undefined) ? !sidebar.classList.contains('mobile-open') : open;
    sidebar.classList.toggle('mobile-open', isOpen);
    if (backdrop) {
        backdrop.classList.toggle('active', isOpen);
    }

    const layout = document.querySelector('.app-layout');
    const isCollapsed = layout ? layout.classList.contains('sidebar-collapsed') : false;
    updateHamburgerIcons(isOpen, isCollapsed);
}

function toggleSidebarCollapse() {
    const layout = document.querySelector('.app-layout');
    if (!layout) return;
    const isCollapsed = layout.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebar_collapsed', isCollapsed ? 'true' : 'false');

    const sidebar = document.getElementById('appSidebar');
    const isMobileOpen = sidebar ? sidebar.classList.contains('mobile-open') : false;
    updateHamburgerIcons(isMobileOpen, isCollapsed);
}

function initSidebarState() {
    const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    const layout = document.querySelector('.app-layout');
    if (layout && isCollapsed && window.innerWidth > 992) {
        layout.classList.add('sidebar-collapsed');
    }

    const sidebar = document.getElementById('appSidebar');
    const isMobileOpen = sidebar ? sidebar.classList.contains('mobile-open') : false;
    updateHamburgerIcons(isMobileOpen, isCollapsed);
}

// Audio Toggle Helper Function
function toggleSound(btn) {
    if (!window.quizAudio) return;
    const muted = window.quizAudio.toggleMute();
    if (btn) {
        btn.innerHTML = muted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    }
}

// Modal Global Helpers
function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('active');
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
}

function openAuthModal(mode = 'login') {
    openModal('authModal');
    const loginTab = document.getElementById('authLoginTab');
    const regTab = document.getElementById('authRegTab');
    const loginForm = document.getElementById('loginFormContainer');
    const regForm = document.getElementById('regFormContainer');

    if (mode === 'login') {
        loginTab.classList.add('active');
        regTab.classList.remove('active');
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
    } else {
        regTab.classList.add('active');
        loginTab.classList.remove('active');
        regForm.style.display = 'block';
        loginForm.style.display = 'none';
    }
}

function openImageModal(url) {
    const modal = document.getElementById('imageModal');
    const img = document.getElementById('modalImageDisplay');
    if (modal && img) {
        img.src = url;
        openModal('imageModal');
    }
}

// Global Toast System
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type} slide-up`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${escapeHTML(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Utility: HTML Escaper
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
    window.app.init();
});
