/**
 * js/creator.js - Custom Quiz Builder, Bulk JSON Importer & Template Generator
 */
class QuizCreator {
    constructor() {
        this.questionsContainer = document.getElementById('questionsList');
        this.questionCount = 0;
        this.editingQuizId = null;
        this.templatePacks = {
            web: [
                {
                    question_text: "What does CSS stand for in web engineering?",
                    image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80",
                    option_a: "Cascading Style Sheets",
                    option_b: "Computer System Sheets",
                    option_c: "Creative Styling Solutions",
                    option_d: "Central Sheet Styling",
                    correct_option: 0,
                    points: 100,
                    explanation: "Cascading Style Sheets (CSS) describes how HTML elements are formatted and presented."
                },
                {
                    question_text: "Which HTML5 tag is used to draw graphics on the fly via JavaScript?",
                    image_url: null,
                    option_a: "<svg>",
                    option_b: "<canvas>",
                    option_c: "<graphics>",
                    option_d: "<paint>",
                    correct_option: 1,
                    points: 100,
                    explanation: "The <canvas> element is an HTML container used to render 2D/3D graphics programmatically."
                },
                {
                    question_text: "In PHP, which superglobal array stores HTTP GET parameters?",
                    image_url: null,
                    option_a: "$_POST",
                    option_b: "$_REQUEST",
                    option_c: "$_GET",
                    option_d: "$_SERVER",
                    correct_option: 2,
                    points: 100,
                    explanation: "$_GET is an associative array of variables passed to the current script via URL query parameters."
                }
            ],
            science: [
                {
                    question_text: "What fundamental force keeps planets in orbit around stars?",
                    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
                    option_a: "Electromagnetism",
                    option_b: "Strong Nuclear Force",
                    option_c: "Gravity",
                    option_d: "Weak Nuclear Force",
                    correct_option: 2,
                    points: 100,
                    explanation: "Gravity is the attractive force exerted by bodies with mass across space."
                },
                {
                    question_text: "What particle is known as the carrier of electromagnetic force?",
                    image_url: null,
                    option_a: "Gluon",
                    option_b: "Photon",
                    option_c: "Z Boson",
                    option_d: "Graviton",
                    correct_option: 1,
                    points: 120,
                    explanation: "The photon is the gauge boson for the electromagnetic force."
                }
            ],
            opinionstage: [
                {
                    question_text: "What is the common name for dried plums?",
                    image_url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
                    option_a: "Raisins",
                    option_b: "Prunes",
                    option_c: "Dates",
                    option_d: "Figs",
                    correct_option: 1,
                    points: 100,
                    explanation: "Dried plums are commercially known as prunes."
                },
                {
                    question_text: "What is the primary ingredient in hummus?",
                    image_url: null,
                    option_a: "Lentils",
                    option_b: "Chickpeas",
                    option_c: "Black Beans",
                    option_d: "Soybeans",
                    correct_option: 1,
                    points: 100,
                    explanation: "Hummus is made from mashed chickpeas, tahini, lemon, and garlic."
                },
                {
                    question_text: "Which country produces the most coffee in the world?",
                    image_url: null,
                    option_a: "Colombia",
                    option_b: "Vietnam",
                    option_c: "Brazil",
                    option_d: "Ethiopia",
                    correct_option: 2,
                    points: 100,
                    explanation: "Brazil produces roughly one-third of the global coffee supply."
                },
                {
                    question_text: "Which organ in the human body has four distinct chambers?",
                    image_url: null,
                    option_a: "The Brain",
                    option_b: "The Liver",
                    option_c: "The Heart",
                    option_d: "The Lungs",
                    correct_option: 2,
                    points: 100,
                    explanation: "The human heart consists of two atria and two ventricles."
                },
                {
                    question_text: "What is the human body's largest organ?",
                    image_url: null,
                    option_a: "Liver",
                    option_b: "Brain",
                    option_c: "Skin",
                    option_d: "Lungs",
                    correct_option: 2,
                    points: 100,
                    explanation: "The skin accounts for about 15% of total human body weight."
                }
            ]
        };
    }

    init() {
        if (!this.questionsContainer) return;
        this.questionsContainer.innerHTML = '';
        this.questionCount = 0;
        // Start with 2 initial question cards
        this.addQuestionCard();
        this.addQuestionCard();
    }

    addQuestionCard(data = null) {
        this.questionCount++;
        const id = this.questionCount;
        const qData = data || {
            question_text: '',
            image_url: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 0,
            points: 100,
            explanation: ''
        };

        const card = document.createElement('div');
        card.className = 'creator-question-card glass-panel';
        card.id = `qCard_${id}`;
        card.innerHTML = `
            <div class="card-header-row">
                <span class="q-badge"><i class="fas fa-question-circle"></i> Question ${id}</span>
                <button type="button" class="btn-icon-danger" onclick="window.quizCreator.removeQuestionCard(${id})" title="Delete Question">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
            
            <div class="form-group">
                <label>Question Text *</label>
                <textarea class="input-field q-text" rows="2" placeholder="e.g. What is the output of typeof null in JavaScript?" required>${escapeHTML(qData.question_text)}</textarea>
            </div>

            <div class="form-group">
                <label><i class="fas fa-image text-cyan"></i> Question Picture (Upload Image File or Paste URL)</label>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" class="input-field q-image" id="qImageInput_${id}" placeholder="e.g. uploads/my_diagram.jpg or https://..." value="${escapeHTML(qData.image_url || '')}" onchange="window.quizCreator.previewQuestionImage(${id}, this.value)">
                    <label class="btn btn-secondary-glow btn-sm" style="white-space: nowrap; cursor: pointer; margin: 0;">
                        <i class="fas fa-upload text-cyan"></i> Upload
                        <input type="file" accept="image/*" style="display: none;" onchange="window.quizCreator.uploadFile(this, 'qImageInput_${id}', ${id})">
                    </label>
                </div>
                <div class="image-preview-container" id="qImgPreview_${id}" style="${qData.image_url ? '' : 'display:none;'}">
                    <img src="${escapeHTML(qData.image_url || '')}" class="q-img-thumb" alt="Preview">
                </div>
            </div>

            <div class="options-grid">
                <div class="option-field-group">
                    <label class="opt-label opt-a"><input type="radio" name="correct_${id}" value="0" ${qData.correct_option === 0 ? 'checked' : ''}> Option A *</label>
                    <input type="text" class="input-field q-opt-a" placeholder="Option A text" value="${escapeHTML(qData.option_a)}" required>
                </div>
                <div class="option-field-group">
                    <label class="opt-label opt-b"><input type="radio" name="correct_${id}" value="1" ${qData.correct_option === 1 ? 'checked' : ''}> Option B *</label>
                    <input type="text" class="input-field q-opt-b" placeholder="Option B text" value="${escapeHTML(qData.option_b)}" required>
                </div>
                <div class="option-field-group">
                    <label class="opt-label opt-c"><input type="radio" name="correct_${id}" value="2" ${qData.correct_option === 2 ? 'checked' : ''}> Option C *</label>
                    <input type="text" class="input-field q-opt-c" placeholder="Option C text" value="${escapeHTML(qData.option_c)}" required>
                </div>
                <div class="option-field-group">
                    <label class="opt-label opt-d"><input type="radio" name="correct_${id}" value="3" ${qData.correct_option === 3 ? 'checked' : ''}> Option D *</label>
                    <input type="text" class="input-field q-opt-d" placeholder="Option D text" value="${escapeHTML(qData.option_d)}" required>
                </div>
            </div>

            <div class="form-row-split">
                <div class="form-group half">
                    <label>Base Points</label>
                    <input type="number" class="input-field q-points" value="${qData.points || 100}" min="10" max="1000" step="10">
                </div>
                <div class="form-group half">
                    <label>Explanation / Hint (Optional)</label>
                    <input type="text" class="input-field q-expl" placeholder="e.g. In JavaScript, typeof null returns 'object' due to historical legacy." value="${escapeHTML(qData.explanation || '')}">
                </div>
            </div>
        `;

        this.questionsContainer.appendChild(card);
    }

    removeQuestionCard(id) {
        const cards = this.questionsContainer.querySelectorAll('.creator-question-card');
        if (cards.length <= 1) {
            showToast('A quiz must contain at least 1 question.', 'warning');
            return;
        }
        const card = document.getElementById(`qCard_${id}`);
        if (card) {
            card.remove();
            this.renumberQuestions();
        }
    }

    renumberQuestions() {
        const cards = this.questionsContainer.querySelectorAll('.creator-question-card');
        cards.forEach((card, idx) => {
            const badge = card.querySelector('.q-badge');
            if (badge) {
                badge.innerHTML = `<i class="fas fa-question-circle"></i> Question ${idx + 1}`;
            }
        });
    }

    previewQuestionImage(id, url) {
        const previewBox = document.getElementById(`qImgPreview_${id}`);
        if (!previewBox) return;
        if (url && url.trim()) {
            previewBox.style.display = 'block';
            previewBox.innerHTML = `<img src="${escapeHTML(url)}" class="q-img-thumb" alt="Preview" onerror="this.src='https://via.placeholder.com/400x200?text=Invalid+Image+URL'">`;
        } else {
            previewBox.style.display = 'none';
        }
    }

    async uploadFile(fileInput, targetInputId, questionCardId = null) {
        if (!fileInput.files || fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('image', file);

        showToast('Uploading image file...', 'info');

        try {
            const res = await fetch('api/upload.php', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.status === 'success') {
                const target = document.getElementById(targetInputId);
                if (target) target.value = data.image_url;
                if (questionCardId) {
                    this.previewQuestionImage(questionCardId, data.image_url);
                }
                showToast('Image uploaded successfully!', 'success');
            } else {
                showToast(data.message || 'Upload failed', 'error');
            }
        } catch (err) {
            showToast('Error uploading file: ' + err.message, 'error');
        }
    }

    loadPresetPack(packName) {
        const pack = this.templatePacks[packName];
        if (!pack) return;
        pack.forEach(q => this.addQuestionCard(q));
        showToast(`Added ${pack.length} preset questions!`, 'success');
    }

    exportJSON() {
        const data = this.collectFormData();
        if (!data) return;
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.title.toLowerCase().replace(/[^a-z0-0]+/g, '_') || 'quiz'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importJSONModal() {
        openModal('jsonImportModal');
    }

    processImportedJSON() {
        const jsonInput = document.getElementById('jsonTextarea');
        if (!jsonInput || !jsonInput.value.trim()) {
            showToast('Please paste valid JSON data.', 'warning');
            return;
        }

        try {
            const parsed = JSON.parse(jsonInput.value);
            if (parsed.title) document.getElementById('quizTitle').value = parsed.title;
            if (parsed.description) document.getElementById('quizDescription').value = parsed.description;
            if (parsed.category) document.getElementById('quizCategory').value = parsed.category;
            if (parsed.difficulty) document.getElementById('quizDifficulty').value = parsed.difficulty;
            if (parsed.time_per_question) document.getElementById('quizTimePerQ').value = parsed.time_per_question;
            if (parsed.banner_url) document.getElementById('quizBannerUrl').value = parsed.banner_url;

            const questions = parsed.questions || (Array.isArray(parsed) ? parsed : []);
            if (questions.length > 0) {
                this.questionsContainer.innerHTML = '';
                this.questionCount = 0;
                questions.forEach(q => this.addQuestionCard(q));
                showToast(`Successfully imported ${questions.length} questions!`, 'success');
                closeModal('jsonImportModal');
            } else {
                showToast('No valid questions array found in JSON.', 'error');
            }
        } catch (err) {
            showToast('Invalid JSON syntax: ' + err.message, 'error');
        }
    }

    collectFormData() {
        const title = document.getElementById('quizTitle').value.trim();
        const description = document.getElementById('quizDescription').value.trim();
        let category = document.getElementById('quizCategory').value;

        if (category === '__custom__') {
            const customVal = document.getElementById('customCategoryInput')?.value.trim();
            if (!customVal) {
                showToast('Please enter your custom Category name.', 'warning');
                return null;
            }
            category = customVal;
        }

        const difficulty = document.getElementById('quizDifficulty').value;
        const time_per_question = parseInt(document.getElementById('quizTimePerQ').value) || 15;
        const banner_url = document.getElementById('quizBannerUrl').value.trim();

        if (!title) {
            showToast('Please enter a Quiz Title.', 'warning');
            return null;
        }

        const cards = this.questionsContainer.querySelectorAll('.creator-question-card');
        const questions = [];

        cards.forEach(card => {
            const qText = card.querySelector('.q-text').value.trim();
            const qImg = card.querySelector('.q-image').value.trim();
            const optA = card.querySelector('.q-opt-a').value.trim();
            const optB = card.querySelector('.q-opt-b').value.trim();
            const optC = card.querySelector('.q-opt-c').value.trim();
            const optD = card.querySelector('.q-opt-d').value.trim();
            const correctRadio = card.querySelector('input[type="radio"]:checked');
            const points = parseInt(card.querySelector('.q-points').value) || 100;
            const expl = card.querySelector('.q-expl').value.trim();

            if (qText && optA && optB) {
                questions.push({
                    question_text: qText,
                    image_url: qImg || null,
                    option_a: optA,
                    option_b: optB,
                    option_c: optC || 'None of the above',
                    option_d: optD || 'All of the above',
                    correct_option: correctRadio ? parseInt(correctRadio.value) : 0,
                    points: points,
                    explanation: expl || null
                });
            }
        });

        if (questions.length === 0) {
            showToast('Please complete at least one question.', 'warning');
            return null;
        }

        const payload = {
            title,
            description,
            category,
            difficulty,
            time_per_question,
            banner_url,
            questions
        };

        if (this.editingQuizId) {
            payload.quiz_id = this.editingQuizId;
        }

        return payload;
    }

    async submitQuiz() {
        if (!window.authManager || !window.authManager.currentUser) {
            showToast('Please sign in or create an account to publish your custom quizzes!', 'warning');
            switchTab('settings');
            return;
        }

        const data = this.collectFormData();
        if (!data) return;

        try {
            const res = await fetch('api/create_quiz.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();

            if (result.status === 'success') {
                showToast(result.message, 'success');
                window.quizAudio.playVictory();

                if (this.editingQuizId) {
                    this.cancelEdit();
                } else {
                    this.init();
                }

                // Navigate to quizzes tab and reload list
                switchTab('explore');
                if (window.app) window.app.loadQuizzes();
                if (window.authManager && typeof window.authManager.loadSettingsAccount === 'function') {
                    window.authManager.loadSettingsAccount();
                }
            } else {
                showToast(result.message, 'error');
            }
        } catch (err) {
            showToast('Failed to save quiz: ' + err.message, 'error');
        }
    }

    async editQuiz(quizId) {
        showToast('Loading quiz data for editing...', 'info');

        try {
            const res = await fetch(`api/quizzes.php?id=${quizId}`);
            const data = await res.json();

            if (data.status === 'success' && data.quiz) {
                const quiz = data.quiz;
                const currentUser = window.authManager?.currentUser;

                // Strict ownership check: block only if quiz belongs to a different registered user
                if (quiz.user_id && parseInt(quiz.user_id) > 0 && currentUser && parseInt(currentUser.id) > 0) {
                    if (parseInt(quiz.user_id) !== parseInt(currentUser.id)) {
                        showToast('You can only edit quizzes that you published.', 'error');
                        return;
                    }
                }

                this.editingQuizId = quizId;

                document.getElementById('quizTitle').value = quiz.title || '';
                document.getElementById('quizDescription').value = quiz.description || '';

                // Sync category choice buttons
                const targetCat = quiz.category || 'CCS';
                const catButtons = document.querySelectorAll('#categoryButtonHolder .cat-choice-btn');
                let matchedBtn = null;
                catButtons.forEach(btn => {
                    if (btn.dataset.cat === targetCat) {
                        matchedBtn = btn;
                    }
                });

                if (matchedBtn) {
                    selectCreatorCategory(matchedBtn, targetCat);
                } else {
                    const customBtn = document.querySelector('#categoryButtonHolder .cat-choice-custom');
                    selectCreatorCategory(customBtn, '__custom__');
                    const customInput = document.getElementById('customCategoryInput');
                    if (customInput) customInput.value = targetCat;
                }

                document.getElementById('quizDifficulty').value = quiz.difficulty || 'Medium';
                document.getElementById('quizTimePerQ').value = quiz.time_per_question || 15;
                document.getElementById('quizBannerUrl').value = quiz.banner_url || '';

                // Populate question cards
                this.questionsContainer.innerHTML = '';
                this.questionCount = 0;

                const questions = quiz.questions || [];
                if (questions.length > 0) {
                    questions.forEach(q => {
                        this.addQuestionCard({
                            question_text: q.question_text || '',
                            image_url: q.image_url || '',
                            option_a: q.option_a || '',
                            option_b: q.option_b || '',
                            option_c: q.option_c || '',
                            option_d: q.option_d || '',
                            correct_option: parseInt(q.correct_option || 0),
                            points: parseInt(q.points || 100),
                            explanation: q.explanation || ''
                        });
                    });
                } else {
                    this.addQuestionCard();
                    this.addQuestionCard();
                }

                // Update UI title and button text
                const headerTitle = document.getElementById('creatorHeaderTitle');
                if (headerTitle) {
                    headerTitle.innerHTML = `<i class="fas fa-edit text-amber"></i> Edit Quiz: ${escapeHTML(quiz.title)}`;
                }

                const submitBtn = document.getElementById('creatorSubmitBtn');
                if (submitBtn) {
                    submitBtn.innerHTML = `<i class="fas fa-save"></i> Update Quiz`;
                }

                const cancelBtn = document.getElementById('creatorCancelBtn');
                if (cancelBtn) {
                    cancelBtn.style.display = 'inline-block';
                }

                switchTab('creator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                showToast(`Loaded quiz: "${quiz.title}" for editing.`, 'success');
            } else {
                showToast(data.message || 'Failed to load quiz details.', 'error');
            }
        } catch (err) {
            showToast('Error loading quiz for edit: ' + err.message, 'error');
        }
    }

    cancelEdit() {
        this.editingQuizId = null;

        document.getElementById('quizTitle').value = '';
        document.getElementById('quizDescription').value = '';
        const firstCatBtn = document.querySelector('#categoryButtonHolder .cat-choice-btn');
        if (firstCatBtn) {
            selectCreatorCategory(firstCatBtn, 'CCS');
        }
        document.getElementById('quizDifficulty').value = 'Medium';
        document.getElementById('quizTimePerQ').value = '15';
        document.getElementById('quizBannerUrl').value = '';

        this.questionsContainer.innerHTML = '';
        this.questionCount = 0;
        this.addQuestionCard();
        this.addQuestionCard();

        const headerTitle = document.getElementById('creatorHeaderTitle');
        if (headerTitle) {
            headerTitle.innerHTML = `<i class="fas fa-tools text-cyan"></i> Custom Quiz Builder`;
        }

        const submitBtn = document.getElementById('creatorSubmitBtn');
        if (submitBtn) {
            submitBtn.innerHTML = `<i class="fas fa-save"></i> Publish Custom Quiz`;
        }

        const cancelBtn = document.getElementById('creatorCancelBtn');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }
    }
}

window.quizCreator = new QuizCreator();

function selectCreatorCategory(btnEl, catValue) {
    const holder = document.getElementById('categoryButtonHolder');
    if (holder) {
        holder.querySelectorAll('.cat-choice-btn').forEach(b => b.classList.remove('active'));
    }
    if (btnEl) btnEl.classList.add('active');

    const hiddenInput = document.getElementById('quizCategory');
    const customInput = document.getElementById('customCategoryInput');
    const badge = document.getElementById('selectedCategoryTagBadge');

    if (catValue === '__custom__') {
        if (hiddenInput) hiddenInput.value = '__custom__';
        if (customInput) {
            customInput.style.display = 'block';
            customInput.focus();
        }
        if (badge) badge.innerText = 'Custom Category';
    } else {
        if (hiddenInput) hiddenInput.value = catValue;
        if (customInput) {
            customInput.style.display = 'none';
            customInput.value = '';
        }
        if (badge) badge.innerText = catValue;
    }
}
