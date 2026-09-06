/**
 * js/leaderboard.js - Dynamic Leaderboards Fetcher, Top 3 Podium & Filters
 */
class LeaderboardManager {
    constructor() {
        this.selectedQuizId = 0;
        this.selectedTimeframe = 'all';
    }

    async loadLeaderboard(quizId = 0, timeframe = 'all') {
        this.selectedQuizId = quizId;
        this.selectedTimeframe = timeframe;

        const podiumContainer = document.getElementById('podiumContainer');
        const listContainer = document.getElementById('leaderboardList');

        if (podiumContainer) podiumContainer.innerHTML = '<div class="loader-spinner"></div>';
        if (listContainer) listContainer.innerHTML = '';

        try {
            const res = await fetch(`api/leaderboard.php?quiz_id=${quizId}&timeframe=${timeframe}`);
            const data = await res.json();

            if (data.status === 'success') {
                this.renderPodium(data.podium || []);
                this.renderList(data.leaderboard || []);
            } else {
                showToast('Failed to load leaderboards.', 'error');
            }
        } catch (err) {
            console.error('Leaderboard error:', err);
        }
    }

    renderPodium(podium) {
        const container = document.getElementById('podiumContainer');
        if (!container) return;

        if (podium.length === 0) {
            container.innerHTML = `<div class="empty-state-card"><i class="fas fa-medal"></i><p>No scores submitted yet. Be the first to claim 1st place!</p></div>`;
            return;
        }

        // Reorder for podium aesthetic: Rank 2 (Silver), Rank 1 (Gold), Rank 3 (Bronze)
        const first = podium[0] || null;
        const second = podium[1] || null;
        const third = podium[2] || null;

        const ordered = [second, first, third].filter(p => p !== null);

        container.innerHTML = `
            <div class="podium-wrapper">
                ${second ? this.buildPodiumCard(second, 2, 'silver-rank') : ''}
                ${first ? this.buildPodiumCard(first, 1, 'gold-rank') : ''}
                ${third ? this.buildPodiumCard(third, 3, 'bronze-rank') : ''}
            </div>
        `;
    }

    buildPodiumCard(entry, rank, rankClass) {
        const crowns = { 1: '👑', 2: '🥈', 3: '🥉' };
        return `
            <div class="podium-card ${rankClass} glass-panel fade-in">
                <div class="podium-badge">${crowns[rank] || rank}</div>
                <div class="podium-avatar-wrapper">
                    <img src="${escapeHTML(entry.avatar_icon)}" class="podium-avatar" alt="Avatar">
                </div>
                <h4 class="podium-name">${escapeHTML(entry.player_name)}</h4>
                <div class="podium-score">${entry.score.toLocaleString()} <span class="pts-unit">PTS</span></div>
                <div class="podium-sub-meta">
                    <span><i class="fas fa-bullseye"></i> ${entry.accuracy}%</span>
                    <span><i class="fas fa-stopwatch"></i> ${entry.total_time}s</span>
                </div>
                <span class="podium-quiz-tag">${escapeHTML(entry.quiz_title)}</span>
            </div>
        `;
    }

    renderList(leaderboard) {
        const container = document.getElementById('leaderboardList');
        if (!container) return;

        if (leaderboard.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <div class="leaderboard-table-card glass-panel">
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Player</th>
                            <th>Quiz</th>
                            <th>Accuracy</th>
                            <th>Streak</th>
                            <th>Time</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        leaderboard.forEach((item, idx) => {
            const rank = idx + 1;
            const rankIcon = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : `#${rank}`));
            html += `
                <tr class="${rank <= 3 ? 'top-three-row' : ''}">
                    <td class="rank-cell"><strong>${rankIcon}</strong></td>
                    <td class="player-cell">
                        <img src="${escapeHTML(item.avatar_icon)}" class="avatar-table-xs" alt="Avatar">
                        <span class="player-title">${escapeHTML(item.player_name)}</span>
                    </td>
                    <td><span class="quiz-pill-badge">${escapeHTML(item.quiz_title)}</span></td>
                    <td>${item.accuracy}%</td>
                    <td><span class="streak-mini"><i class="fas fa-fire"></i> ${item.streak_max}x</span></td>
                    <td>${item.total_time}s</td>
                    <td class="score-cell">${item.score.toLocaleString()}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }
}

window.leaderboard = new LeaderboardManager();
