/**
 * js/tutorial.js - New User Interactive Tutorial & Guide Engine
 */
class TutorialManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.steps = [
            {
                step: 1,
                title: "Step 1: Explore & Pick a Quiz",
                icon: "fa-compass",
                color: "var(--primary-cyan)",
                text: "Browse custom quizzes by <strong>Category Tag</strong> (CCS, Web Dev, Science, Gaming, Cyber Sec...) or filter by <strong>Difficulty Level</strong> (Easy, Medium, Hard). You can also search quizzes by title or keyword!",
                tip: "💡 Tip: Click any Category Tag pill to filter quizzes instantly."
            },
            {
                step: 2,
                title: "Step 2: Timed Question Delivery",
                icon: "fa-stopwatch",
                color: "var(--accent-violet)",
                text: "When you start a quiz, each question features a <strong>live SVG timer countdown ring</strong>. Select your answer choice (Option A, B, C, or D) before time runs out!",
                tip: "💡 Tip: Click on question image attachments to zoom in and inspect visual diagrams."
            },
            {
                step: 3,
                title: "Step 3: Speed Bonuses & Streaks",
                icon: "fa-fire",
                color: "var(--accent-gold)",
                text: "Earn <strong>Base Points</strong> for every correct answer. Answer fast to earn up to <strong>+50% Speed Bonus</strong>! Build consecutive correct answers to unlock up to <strong>2.0x Streak Multiplier</strong>!",
                tip: "💡 Tip: Maintaining a streak yields maximum points for top leaderboard rankings."
            },
            {
                step: 4,
                title: "Step 4: Incorrect Choices & Streak Resets",
                icon: "fa-times-circle",
                color: "var(--accent-danger)",
                text: "Selecting an incorrect choice or letting the question timer run out resets your streak multiplier and displays the correct answer explanation.",
                tip: "💡 Tip: Take a quick second to review explanations to improve your score on your next attempt!"
            },
            {
                step: 5,
                title: "Step 5: Leaderboards & Custom Creator",
                icon: "fa-trophy",
                color: "var(--accent-emerald)",
                text: "Compete for top positions on the live <strong>Leaderboard Podium</strong>! You can also build your own custom trivia quizzes in the <strong>Quiz Builder</strong> and edit your published quizzes anytime.",
                tip: "💡 Tip: Create an account to save your scores and publish custom quizzes."
            }
        ];
    }

    openTutorialModal() {
        this.currentStep = 1;
        this.renderStep();
        openModal('tutorialModal');
    }

    renderStep() {
        const s = this.steps[this.currentStep - 1];
        const titleEl = document.getElementById('tutorialStepTitle');
        const contentEl = document.getElementById('tutorialStepContent');
        const dotsEl = document.getElementById('tutorialStepDots');
        const prevBtn = document.getElementById('tutorialPrevBtn');
        const nextBtn = document.getElementById('tutorialNextBtn');

        if (titleEl) titleEl.innerHTML = `<i class="fas ${s.icon}" style="color: ${s.color};"></i> ${s.title}`;
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="glass-panel" style="padding: 1.25rem; border-radius: var(--radius-md); text-align: left; margin-bottom: 1rem;">
                    <p style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem; color: var(--text-color);">${s.text}</p>
                    <div style="background: rgba(0,242,254,0.1); border-left: 3px solid ${s.color}; padding: 0.6rem 0.85rem; border-radius: 4px; font-size: 0.85rem; color: var(--text-color);">
                        ${s.tip}
                    </div>
                </div>
            `;
        }

        if (dotsEl) {
            let dotsHtml = '';
            for (let i = 1; i <= this.totalSteps; i++) {
                const active = i === this.currentStep;
                dotsHtml += `<span onclick="window.tutorialManager.goToStep(${i})" style="display: inline-block; width: ${active ? '22px' : '10px'}; height: 10px; border-radius: 5px; background: ${active ? 'var(--primary-cyan)' : 'rgba(255,255,255,0.2)'}; cursor: pointer; transition: all 0.2s ease;"></span> `;
            }
            dotsEl.innerHTML = dotsHtml;
        }

        if (prevBtn) {
            prevBtn.style.visibility = this.currentStep === 1 ? 'hidden' : 'visible';
        }

        if (nextBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.className = 'btn btn-primary-glow pulse-glow';
                nextBtn.innerHTML = 'Start Playing! <i class="fas fa-gamepad"></i>';
                nextBtn.onclick = () => {
                    closeModal('tutorialModal');
                    switchTab('explore');
                };
            } else {
                nextBtn.className = 'btn btn-primary-glow';
                nextBtn.innerHTML = 'Next Step <i class="fas fa-arrow-right"></i>';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.renderStep();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderStep();
        }
    }

    goToStep(stepNum) {
        if (stepNum >= 1 && stepNum <= this.totalSteps) {
            this.currentStep = stepNum;
            this.renderStep();
        }
    }

    renderHelpTabContent() {
        const container = document.getElementById('helpTabContentArea');
        if (!container) return;

        let html = `
            <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                ${this.steps.map(s => `
                    <div class="glass-panel fade-in" style="padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid ${s.color};">
                        <h4 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-color);">
                            <i class="fas ${s.icon}" style="color: ${s.color}; margin-right: 0.4rem;"></i> ${s.title}
                        </h4>
                        <p style="font-size: 0.92rem; line-height: 1.55; color: var(--text-muted); margin-bottom: 0.75rem;">${s.text}</p>
                        <div style="background: rgba(255,255,255,0.05); padding: 0.5rem 0.85rem; border-radius: var(--radius-xs); font-size: 0.85rem; color: var(--primary-cyan);">
                            ${s.tip}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.innerHTML = html;
    }
}

window.tutorialManager = new TutorialManager();

function openTutorialModal() {
    if (window.tutorialManager) {
        window.tutorialManager.openTutorialModal();
    }
}
