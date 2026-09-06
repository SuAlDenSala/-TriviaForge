/**
 * js/auth.js - User Authentication, Guest Session & Avatar Manager
 */
class AuthManager {
    constructor() {
        this.currentUser = null;
    }

    async checkSession() {
        try {
            const res = await fetch('api/auth.php?action=session');
            const data = await res.json();
            if (data.status === 'success' && data.logged_in) {
                this.currentUser = data.user;
            } else {
                this.currentUser = null;
            }
            this.updateUI();
            return this.currentUser;
        } catch (err) {
            console.error('Session check failed:', err);
            return null;
        }
    }

    async login(username, password) {
        try {
            const res = await fetch('api/auth.php?action=login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.status === 'success') {
                this.currentUser = data.user;
                this.updateUI();
                showToast(data.message, 'success');
                closeModal('authModal');
                return true;
            } else {
                showToast(data.message, 'error');
                return false;
            }
        } catch (err) {
            showToast('Login request failed', 'error');
            return false;
        }
    }

    async register(username, email, password, avatar_icon) {
        try {
            const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
            const finalAvatar = avatar_icon || defaultAvatar;
            const res = await fetch('api/auth.php?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, avatar_icon: finalAvatar })
            });
            const data = await res.json();
            if (data.status === 'success') {
                this.currentUser = data.user;
                this.updateUI();
                showToast(data.message, 'success');
                closeModal('authModal');
                return true;
            } else {
                showToast(data.message, 'error');
                return false;
            }
        } catch (err) {
            showToast('Registration failed', 'error');
            return false;
        }
    }

    async logout() {
        try {
            await fetch('api/auth.php?action=logout');
            this.currentUser = null;
            this.updateUI();
            showToast('Logged out successfully', 'info');
        } catch (err) {
            console.error('Logout error:', err);
        }
    }

    getPlayerIdentity() {
        if (this.currentUser) {
            return {
                name: this.currentUser.username,
                avatar: this.currentUser.avatar_icon,
                user_id: this.currentUser.id
            };
        }
        return null;
    }

    async openProfileModal() {
        if (!this.currentUser) {
            openAuthModal('login');
            return;
        }

        openModal('profileModal');
        const container = document.getElementById('profileModalContent');
        if (container) container.innerHTML = '<div class="loader-spinner"></div>';

        try {
            const res = await fetch('api/profile.php?action=get');
            const data = await res.json();

            if (data.status === 'success') {
                this.renderProfileView(data);
            } else {
                showToast(data.message || 'Failed to load profile', 'error');
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
    }

    renderProfileView(data) {
        const container = document.getElementById('profileModalContent');
        if (!container) return;

        const user = data.user;
        const stats = data.stats;
        const recent = data.recent_history || [];

        const presetAvatars = [
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80'
        ];

        let html = `
            <div class="profile-header-card text-center" style="margin-bottom: 1.5rem;">
                <div class="profile-avatar-box" style="position: relative; display: inline-block; margin-bottom: 0.75rem;">
                    <img id="currentProfileAvatar" src="${escapeHTML(user.avatar_icon)}" class="podium-avatar" style="width: 80px; height: 80px; border-color: var(--primary-cyan);" alt="Avatar">
                </div>
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.2rem;">${escapeHTML(user.username)}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${escapeHTML(user.email)} • Joined ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>

            <!-- Profile Edit Section -->
            <div class="form-group" style="background: rgba(0,0,0,0.25); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div class="form-group" style="margin-bottom: 0.75rem;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: var(--primary-cyan);"><i class="fas fa-user-edit"></i> Edit Your Name / Username</label>
                    <input type="text" id="customUsernameInput" class="input-field" value="${escapeHTML(user.username)}" placeholder="Enter your display name">
                </div>

                <div class="form-group" style="margin-bottom: 0.75rem;">
                    <label style="font-size: 0.85rem; font-weight: 700; color: var(--primary-cyan);"><i class="fas fa-image"></i> Custom Profile Picture</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="text" id="customAvatarInput" class="input-field" value="${escapeHTML(user.avatar_icon)}" placeholder="Upload file or paste image URL...">
                        <label class="btn btn-secondary-glow btn-sm" style="white-space: nowrap; cursor: pointer; margin: 0;">
                            <i class="fas fa-upload text-cyan"></i> Upload
                            <input type="file" accept="image/*" style="display: none;" onchange="window.quizCreator.uploadFile(this, 'customAvatarInput')">
                        </label>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 0.75rem;">
                    <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Choose Preset Avatar:</label>
                    <div class="avatar-presets-grid" style="display: flex; gap: 0.5rem; margin-top: 0.3rem;">
                        ${presetAvatars.map(url => `
                            <img src="${url}" class="avatar-preset-item ${user.avatar_icon === url ? 'active-avatar' : ''}" onclick="document.getElementById('customAvatarInput').value='${url}';" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; border: 2px solid ${user.avatar_icon === url ? 'var(--primary-cyan)' : 'transparent'};">
                        `).join('')}
                    </div>
                </div>

                <div style="display: flex; gap: 0.5rem; justify-content: space-between;">
                    <button class="btn btn-primary-glow btn-sm" style="flex: 1;" onclick="window.authManager.saveProfileModalChanges()">
                        <i class="fas fa-save"></i> Save Profile
                    </button>
                    <button class="btn btn-secondary-glow btn-sm" style="border-color: rgba(244, 63, 94, 0.4); color: #f43f5e;" onclick="window.authManager.deleteAccount()">
                        <i class="fas fa-trash-alt"></i> Delete Account
                    </button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="victory-stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin: 1.5rem 0;">
                <div class="v-stat-card text-center" style="padding: 0.75rem;">
                    <span class="v-stat-num text-gold" style="font-size: 1.3rem;">${stats.total_score.toLocaleString()}</span>
                    <span class="v-stat-label">Total Points</span>
                </div>
                <div class="v-stat-card text-center" style="padding: 0.75rem;">
                    <span class="v-stat-num text-cyan" style="font-size: 1.3rem;">${stats.total_plays}</span>
                    <span class="v-stat-label">Quizzes Played</span>
                </div>
                <div class="v-stat-card text-center" style="padding: 0.75rem;">
                    <span class="v-stat-num text-emerald" style="font-size: 1.3rem;">${stats.avg_accuracy}%</span>
                    <span class="v-stat-label">Avg Accuracy</span>
                </div>
            </div>

            <!-- My Created / Published Quizzes -->
            <div class="recent-history-box" style="margin-bottom: 1.5rem;">
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.75rem;"><i class="fas fa-layer-group text-cyan"></i> My Published Quizzes</h4>
                ${(!data.created_quizzes || data.created_quizzes.length === 0) ? '<p style="font-size: 0.85rem; color: var(--text-muted);">You haven\'t created any custom quizzes yet.</p>' : `
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${data.created_quizzes.map(q => `
                            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                <div style="display: flex; align-items: center; gap: 0.75rem; overflow: hidden; margin-right: 0.5rem;">
                                    <img src="${escapeHTML(q.banner_url || 'https://via.placeholder.com/80')}" style="width: 48px; height: 48px; border-radius: var(--radius-xs); object-fit: cover;" alt="Banner">
                                    <div>
                                        <h5 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.1rem;">${escapeHTML(q.title)}</h5>
                                        <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHTML(q.category)} • ${q.question_count} Qs • ${q.play_count} plays</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.4rem; white-space: nowrap;">
                                    <button class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.editQuiz(${q.id})">
                                        <i class="fas fa-edit text-amber"></i> Edit
                                    </button>
                                    <button class="btn btn-secondary-glow btn-sm" style="border-color: rgba(244, 63, 94, 0.4); color: #f43f5e;" onclick="window.authManager.deletePublishedQuiz(${q.id}, '${escapeHTML(q.title.replace(/'/g, "\\'"))}')">
                                        <i class="fas fa-trash-alt"></i> Delete
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <!-- Recent History -->
            <div class="recent-history-box">
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem;"><i class="fas fa-history text-violet"></i> Recent Activity</h4>
                ${recent.length === 0 ? '<p style="font-size: 0.85rem; color: var(--text-muted);">No quiz plays recorded yet.</p>' : `
                    <table class="leaderboard-table" style="font-size: 0.82rem;">
                        <thead>
                            <tr>
                                <th>Quiz</th>
                                <th>Score</th>
                                <th>Accuracy</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recent.map(r => `
                                <tr>
                                    <td><strong>${escapeHTML(r.quiz_title)}</strong></td>
                                    <td class="score-cell">${r.score}</td>
                                    <td>${r.accuracy}%</td>
                                    <td>${r.total_time}s</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `}
            </div>
        `;

        container.innerHTML = html;
    }

    async loadSettingsAccount() {
        const container = document.getElementById('settingsAccountSection') || document.getElementById('settingsAccountArea');
        const profileContainer = document.getElementById('profilePageContent');

        if (!this.currentUser) {
            const authHtml = `
                <div class="creator-header-card glass-panel fade-in" style="margin-bottom: 2rem;">
                    <h2 class="hero-title" style="font-size: 1.8rem;"><i class="fas fa-user-shield text-cyan"></i> Account Sign In & Sign Up</h2>
                    <p class="hero-sub" style="margin-bottom: 1.5rem;">Sign in or create a free account to play trivia challenges, save your scores, and publish custom quizzes.</p>

                    <div style="display: flex; gap: 0.75rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1.5rem; padding-bottom: 0.5rem;">
                        <button id="inlineLoginTab" class="cat-pill active" onclick="window.authManager.switchInlineAuth('login')">
                            <i class="fas fa-sign-in-alt"></i> Sign In / Login
                        </button>
                        <button id="inlineRegTab" class="cat-pill" onclick="window.authManager.switchInlineAuth('register')">
                            <i class="fas fa-user-plus"></i> Sign Up / Create Account
                        </button>
                    </div>

                    <!-- Inline Login Form -->
                    <div id="inlineLoginForm">
                        <div class="form-group">
                            <label><i class="fas fa-user text-cyan"></i> Username or Email</label>
                            <input type="text" id="inlineLoginUsername" class="input-field" placeholder="Enter your username or email" onkeyup="if(event.key === 'Enter') window.authManager.login(document.getElementById('inlineLoginUsername').value, document.getElementById('inlineLoginPassword').value)">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-lock text-cyan"></i> Password</label>
                            <input type="password" id="inlineLoginPassword" class="input-field" placeholder="••••••••" onkeyup="if(event.key === 'Enter') window.authManager.login(document.getElementById('inlineLoginUsername').value, document.getElementById('inlineLoginPassword').value)">
                        </div>
                        <button class="btn btn-primary-glow btn-block mt-3" onclick="window.authManager.login(document.getElementById('inlineLoginUsername').value, document.getElementById('inlineLoginPassword').value)">
                            <i class="fas fa-sign-in-alt"></i> Sign In to Account
                        </button>
                    </div>

                    <!-- Inline Register Form -->
                    <div id="inlineRegForm" style="display: none;">
                        <div class="form-group">
                            <label><i class="fas fa-user text-cyan"></i> Username</label>
                            <input type="text" id="inlineRegUsername" class="input-field" placeholder="Choose a unique username">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-envelope text-cyan"></i> Email Address</label>
                            <input type="email" id="inlineRegEmail" class="input-field" placeholder="name@domain.com">
                        </div>
                        <div class="form-group">
                            <label><i class="fas fa-lock text-cyan"></i> Password</label>
                            <input type="password" id="inlineRegPassword" class="input-field" placeholder="••••••••" onkeyup="if(event.key === 'Enter') window.authManager.register(document.getElementById('inlineRegUsername').value, document.getElementById('inlineRegEmail').value, document.getElementById('inlineRegPassword').value)">
                        </div>
                        <button class="btn btn-primary-glow btn-block mt-3" onclick="window.authManager.register(document.getElementById('inlineRegUsername').value, document.getElementById('inlineRegEmail').value, document.getElementById('inlineRegPassword').value)">
                            <i class="fas fa-user-plus"></i> Create Free Account
                        </button>
                    </div>
                </div>
            `;
            if (container) container.innerHTML = authHtml;
            if (profileContainer) profileContainer.innerHTML = authHtml;
            return;
        }

        if (container) container.innerHTML = '<div class="loader-spinner"></div>';
        if (profileContainer) profileContainer.innerHTML = '<div class="loader-spinner"></div>';

        try {
            const res = await fetch('api/profile.php?action=get');
            const data = await res.json();
            if (data.status === 'success') {
                if (container) this.renderSettingsAccountView(container, data);
                if (profileContainer) this.renderSettingsAccountView(profileContainer, data);
            }
        } catch (err) {
            console.error('Account load error:', err);
        }
    }

    renderSettingsAccountView(container, data) {
        const user = data.user;
        const stats = data.stats;

        const presetAvatars = [
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80'
        ];

        container.innerHTML = `
            <div class="account-card glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <img id="userSettingsAvatarImg" src="${escapeHTML(user.avatar_icon)}" class="podium-avatar" style="width: 65px; height: 65px; border-color: var(--primary-cyan);" alt="Avatar">
                        <div>
                            <h3 style="font-size: 1.3rem; font-weight: 800; line-height: 1.2;">${escapeHTML(user.username)}</h3>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">${escapeHTML(user.email)}</span>
                            <span style="display: block; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem;"><i class="fas fa-circle" style="color: #22c55e; font-size: 0.6rem;"></i> Logged in</span>
                        </div>
                    </div>
                </div>

                <!-- Profile Edit Form -->
                <div style="margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.85rem; font-weight: 700; color: var(--primary-cyan);"><i class="fas fa-user-edit"></i> Display Name / Username</label>
                            <input type="text" id="editUsernameInput" class="input-field" value="${escapeHTML(user.username)}" placeholder="Enter your display name">
                        </div>

                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.85rem; font-weight: 700; color: var(--primary-cyan);"><i class="fas fa-image"></i> Custom Profile Picture</label>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <input type="text" id="editAvatarInput" class="input-field" value="${escapeHTML(user.avatar_icon)}" placeholder="Upload file or paste URL">
                                <label class="btn btn-secondary-glow btn-sm" style="white-space: nowrap; cursor: pointer; margin: 0;">
                                    <i class="fas fa-upload text-cyan"></i> Upload
                                    <input type="file" accept="image/*" style="display: none;" onchange="window.quizCreator.uploadFile(this, 'editAvatarInput')">
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Avatar Presets Row -->
                    <div class="form-group" style="margin-top: 1rem;">
                        <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted);">Preset Avatars:</label>
                        <div class="avatar-presets-grid" style="display: flex; gap: 0.5rem; margin-top: 0.4rem;">
                            ${presetAvatars.map(url => `
                                <img src="${url}" class="avatar-preset-item ${user.avatar_icon === url ? 'active-avatar' : ''}" onclick="document.getElementById('editAvatarInput').value = '${url}'; window.authManager.updateProfile();" style="width: 38px; height: 38px; border-radius: 50%; cursor: pointer; border: 2px solid ${user.avatar_icon === url ? 'var(--primary-cyan)' : 'transparent'};">
                            `).join('')}
                        </div>
                    </div>

                    <div style="margin-top: 1rem; text-align: right;">
                        <button class="btn btn-primary-glow" onclick="window.authManager.updateProfile()">
                            <i class="fas fa-save"></i> Save Profile Changes
                        </button>
                    </div>
                </div>

                <!-- Password Change Section -->
                <div style="margin-top: 1rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                    <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--primary-cyan); margin-bottom: 0.75rem;"><i class="fas fa-key"></i> Security & Password</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">Current Password</label>
                            <input type="password" id="curPasswordInput" class="input-field" placeholder="••••••••">
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">New Password</label>
                            <input type="password" id="newPasswordInput" class="input-field" placeholder="New password">
                        </div>
                    </div>
                    <div style="margin-top: 0.75rem; text-align: right;">
                        <button class="btn btn-secondary-glow btn-sm" onclick="window.authManager.changePassword(document.getElementById('curPasswordInput').value, document.getElementById('newPasswordInput').value)">
                            <i class="fas fa-lock"></i> Update Password
                        </button>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="victory-stats-grid" style="grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1.5rem;">
                    <div class="v-stat-card text-center" style="padding: 0.75rem;">
                        <span class="v-stat-num text-gold" style="font-size: 1.2rem;">${stats.total_score.toLocaleString()}</span>
                        <span class="v-stat-label">Total Points</span>
                    </div>
                    <div class="v-stat-card text-center" style="padding: 0.75rem;">
                        <span class="v-stat-num text-cyan" style="font-size: 1.2rem;">${stats.total_plays}</span>
                        <span class="v-stat-label">Quizzes Played</span>
                    </div>
                    <div class="v-stat-card text-center" style="padding: 0.75rem;">
                        <span class="v-stat-num text-emerald" style="font-size: 1.2rem;">${stats.avg_accuracy}%</span>
                        <span class="v-stat-label">Avg Accuracy</span>
                    </div>
                </div>

                <!-- My Published Quizzes CRUD Section -->
                <div style="margin-top: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                        <h4 style="font-size: 1rem; font-weight: 700;"><i class="fas fa-layer-group text-cyan"></i> My Published Quizzes (${data.created_quizzes ? data.created_quizzes.length : 0})</h4>
                        <button class="btn btn-primary-glow btn-sm" onclick="switchTab('creator')">
                            <i class="fas fa-plus"></i> Create New Quiz
                        </button>
                    </div>
                    ${(!data.created_quizzes || data.created_quizzes.length === 0) ? '<p style="font-size: 0.85rem; color: var(--text-muted);">You haven\'t published any custom quizzes yet.</p>' : `
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            ${data.created_quizzes.map(q => `
                                <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                                    <div style="display: flex; align-items: center; gap: 0.75rem; overflow: hidden; margin-right: 0.5rem;">
                                        <img src="${escapeHTML(q.banner_url || 'https://via.placeholder.com/80')}" style="width: 48px; height: 48px; border-radius: var(--radius-xs); object-fit: cover;" alt="Banner">
                                        <div>
                                            <h5 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.1rem;">${escapeHTML(q.title)}</h5>
                                            <span style="font-size: 0.78rem; color: var(--text-muted);">${escapeHTML(q.category)} • ${q.question_count} Qs • ${q.play_count} plays</span>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 0.4rem; white-space: nowrap;">
                                        <button class="btn btn-secondary-glow btn-sm" onclick="window.quizCreator.editQuiz(${q.id})">
                                            <i class="fas fa-edit text-amber"></i> Edit
                                        </button>
                                        <button class="btn btn-secondary-glow btn-sm" style="border-color: rgba(244, 63, 94, 0.4); color: #f43f5e;" onclick="window.authManager.deletePublishedQuiz(${q.id}, '${escapeHTML(q.title.replace(/'/g, "\\'"))}')">
                                            <i class="fas fa-trash-alt"></i> Delete
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>

                <!-- Logout Section (clearly separated at the bottom) -->
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid var(--border-color);">
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.2rem;"><i class="fas fa-sign-out-alt text-amber"></i> Account Session</h4>
                            <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0;">Signed in as <strong>${escapeHTML(user.username)}</strong></p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-secondary-glow" style="border-color: rgba(245, 158, 11, 0.7); color: var(--primary-amber); font-weight: 700; padding: 0.55rem 1.2rem;" onclick="window.authManager.logout()">
                                <i class="fas fa-sign-out-alt"></i> Log Out
                            </button>
                            <button class="btn btn-secondary-glow btn-sm" style="border-color: rgba(244, 63, 94, 0.4); color: #f43f5e;" onclick="window.authManager.deleteAccount()">
                                <i class="fas fa-trash-alt"></i> Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async updateProfile() {
        const usernameInput = document.getElementById('editUsernameInput');
        const avatarInput = document.getElementById('editAvatarInput');

        const username = usernameInput ? usernameInput.value.trim() : '';
        const avatar_icon = avatarInput ? avatarInput.value.trim() : (this.currentUser ? this.currentUser.avatar_icon : '');

        try {
            const res = await fetch('api/profile.php?action=update_profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, avatar_icon })
            });
            const data = await res.json();
            if (data.status === 'success') {
                if (this.currentUser) {
                    this.currentUser.username = data.user.username;
                    this.currentUser.avatar_icon = data.user.avatar_icon;
                }
                this.updateUI();
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast(data.message || 'Profile update failed', 'error');
            }
        } catch (err) {
            showToast('Error updating profile', 'error');
        }
    }

    async saveProfileModalChanges() {
        const usernameInput = document.getElementById('customUsernameInput');
        const avatarInput = document.getElementById('customAvatarInput');

        const username = usernameInput ? usernameInput.value.trim() : '';
        const avatar_icon = avatarInput ? avatarInput.value.trim() : (this.currentUser ? this.currentUser.avatar_icon : '');

        try {
            const res = await fetch('api/profile.php?action=update_profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, avatar_icon })
            });
            const data = await res.json();
            if (data.status === 'success') {
                if (this.currentUser) {
                    this.currentUser.username = data.user.username;
                    this.currentUser.avatar_icon = data.user.avatar_icon;
                }
                this.updateUI();
                showToast('Profile updated successfully!', 'success');
                closeModal('profileModal');
                this.loadSettingsAccount();
            } else {
                showToast(data.message || 'Profile update failed', 'error');
            }
        } catch (err) {
            showToast('Error updating profile', 'error');
        }
    }

    async deleteAccount() {
        if (!confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
            return;
        }

        try {
            const res = await fetch('api/profile.php?action=delete_account', { method: 'POST' });
            const data = await res.json();
            if (data.status === 'success') {
                this.currentUser = null;
                this.updateUI();
                showToast(data.message || 'Account deleted successfully.', 'info');
                closeModal('profileModal');
                switchTab('explore');
            } else {
                showToast(data.message || 'Failed to delete account.', 'error');
            }
        } catch (err) {
            showToast('Error deleting account: ' + err.message, 'error');
        }
    }

    async deletePublishedQuiz(quizId, quizTitle) {
        if (!confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch('api/quizzes.php?action=delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quiz_id: quizId })
            });
            const data = await res.json();

            if (data.status === 'success') {
                showToast('Quiz deleted successfully!', 'success');
                if (window.app) window.app.loadQuizzes();
                if (window.location.hash === '#profile' || window.location.hash === '#settings') {
                    this.loadSettingsAccount();
                } else {
                    this.openProfileModal();
                }
            } else {
                showToast(data.message || 'Failed to delete quiz', 'error');
            }
        } catch (err) {
            showToast('Error deleting quiz: ' + err.message, 'error');
        }
    }

    async changePassword(currentPassword, newPassword) {
        if (!currentPassword || !newPassword) {
            showToast('Please enter your current and new password.', 'warning');
            return;
        }

        try {
            const res = await fetch('api/profile.php?action=update_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
            });
            const data = await res.json();

            if (data.status === 'success') {
                showToast('Password updated successfully!', 'success');
            } else {
                showToast(data.message || 'Failed to update password', 'error');
            }
        } catch (err) {
            showToast('Error updating password: ' + err.message, 'error');
        }
    }

    switchInlineAuth(mode = 'login') {
        const loginTab = document.getElementById('inlineLoginTab');
        const regTab = document.getElementById('inlineRegTab');
        const loginForm = document.getElementById('inlineLoginForm');
        const regForm = document.getElementById('inlineRegForm');

        if (!loginTab || !regTab || !loginForm || !regForm) return;

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

    updateUI() {
        this.loadSettingsAccount();

        const topContainer = document.getElementById('topUserContainer');
        if (!topContainer) return;

        if (this.currentUser) {
            topContainer.innerHTML = `
                <div class="user-pill" onclick="switchTab('settings')" title="View Account & Settings" style="cursor: pointer;">
                    <img src="${escapeHTML(this.currentUser.avatar_icon)}" class="avatar-sm" alt="User Avatar">
                    <span class="user-name">${escapeHTML(this.currentUser.username)}</span>
                </div>
                <button class="btn btn-secondary-glow btn-sm" onclick="window.authManager.logout()" title="Sign Out" style="padding: 0.35rem 0.65rem; font-size: 0.82rem;">
                    <i class="fas fa-sign-out-alt text-amber"></i> Logout
                </button>
            `;
        } else {
            topContainer.innerHTML = `
                <button class="btn btn-secondary-glow btn-sm" onclick="openAuthModal('login')" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; font-weight: 600;">
                    <i class="fas fa-sign-in-alt text-cyan"></i> Sign In
                </button>
                <button class="btn btn-primary-glow btn-sm" onclick="openAuthModal('register')" style="padding: 0.35rem 0.75rem; font-size: 0.85rem; font-weight: 600;">
                    <i class="fas fa-user-plus"></i> Sign Up
                </button>
            `;
        }
    }
}

window.authManager = new AuthManager();

