document.addEventListener('DOMContentLoaded', async () => {
    // Flag để đảm bảo app chỉ khởi tạo các event listener một lần duy nhất
    let isAppInitialized = false;

    // Khởi tạo ứng dụng ngay lập tức vì tính năng login đã được gỡ bỏ
    initApp();

    async function initApp() {
        const topicGrid = document.getElementById('topic-grid');
        const topicSearch = document.getElementById('topic-search');
        const paginationContainer = document.getElementById('pagination');
        const wordCountInput = document.getElementById('word-count');
        const startBtn = document.getElementById('start-btn');

        // Các phần tử phục vụ Merge Mode (Phase 7)
        const mergeToggle = document.getElementById('merge-toggle');
        const mergeActionsBar = document.getElementById('merge-actions-bar');
        const selectedCountSpan = document.getElementById('selected-count');
        const totalWordsCountSpan = document.getElementById('total-words-count');
        const selectAllBtn = document.getElementById('select-all-btn');
        const deselectAllBtn = document.getElementById('deselect-all-btn');
        
        let allTopics = [];
        let filteredTopics = [];
        let selectedTopicId = null; // Dùng cho Single Mode
        let isMergeMode = false;
        let selectedTopicIds = new Set(); // Dùng cho Merge Mode
        const topicWordCountCache = new Map(); // Cache số lượng từ của các file JSON

        let currentPage = 1;
        const cardsPerPage = 6;

        // Danh sách các màu mờ huyền bí hợp với Dark Theme
        const darkTechColors = [
            'rgba(30, 34, 54, 0.95)',   // Tone tím xám mờ
            'rgba(26, 38, 57, 0.95)',   // Tone xanh xám mờ
            'rgba(35, 30, 52, 0.95)',   // Tone indigo mờ
            'rgba(38, 32, 48, 0.95)',   // Tone mận tối mờ
            'rgba(24, 38, 48, 0.95)',   // Tone teal tối mờ
            'rgba(32, 32, 54, 0.95)'    // Tone xanh tím mờ
        ];

        // Hàm lấy số lượng từ có caching
        async function getTopicWordCount(filename) {
            if (!filename) return 0;
            if (topicWordCountCache.has(filename)) {
                return topicWordCountCache.get(filename);
            }
            try {
                const data = await VocabService.fetchVocabSet(filename);
                const count = (data && Array.isArray(data.words)) ? data.words.length : 0;
                topicWordCountCache.set(filename, count);
                return count;
            } catch (error) {
                console.error(`Lỗi khi tải từ vựng cho ${filename}:`, error);
                return 0;
            }
        }

        // Cập nhật số lượng câu hỏi tối đa cho chế độ Đơn
        async function updateMaxWordCount(filename) {
            if (!filename) return;

            try {
                const totalWords = await getTopicWordCount(filename);
                wordCountInput.value = totalWords;
                wordCountInput.max = totalWords;
                selectedTopicId = filename;
            } catch (error) {
                console.error("Lỗi khi cập nhật số lượng từ:", error);
            }
        }

        // Cập nhật số lượng câu hỏi tối đa cho chế độ Gộp
        async function updateMergedWordCount() {
            if (selectedTopicIds.size === 0) {
                if (selectedCountSpan) selectedCountSpan.textContent = '0';
                if (totalWordsCountSpan) totalWordsCountSpan.textContent = '0';
                wordCountInput.value = 0;
                wordCountInput.max = 0;
                return;
            }

            const promises = Array.from(selectedTopicIds).map(id => getTopicWordCount(id));
            const counts = await Promise.all(promises);
            const totalAvailableWords = counts.reduce((acc, curr) => acc + curr, 0);

            if (selectedCountSpan) selectedCountSpan.textContent = selectedTopicIds.size;
            if (totalWordsCountSpan) totalWordsCountSpan.textContent = totalAvailableWords;

            wordCountInput.max = totalAvailableWords;
            const currentVal = parseInt(wordCountInput.value, 10);
            if (isNaN(currentVal) || currentVal <= 0 || currentVal > totalAvailableWords) {
                wordCountInput.value = totalAvailableWords;
            }
        }

        function renderCards() {
            topicGrid.innerHTML = '';
            const startIndex = (currentPage - 1) * cardsPerPage;
            const paginatedTopics = filteredTopics.slice(startIndex, startIndex + cardsPerPage);

            if (paginatedTopics.length === 0) {
                topicGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #95a5a6;">Không tìm thấy chủ đề phù hợp.</p>';
                return;
            }

            paginatedTopics.forEach(topic => {
                // Tìm index gốc để giữ màu cố định cho mỗi chủ đề
                const originalIndex = allTopics.findIndex(t => t.id === topic.id);
                const bgColor = darkTechColors[originalIndex % darkTechColors.length];

                const card = document.createElement('div');

                if (isMergeMode) {
                    const isChecked = selectedTopicIds.has(topic.id);
                    card.className = `topic-card merge-mode ${isChecked ? 'selected-merge' : ''}`;
                    card.style.backgroundColor = bgColor;
                    card.innerHTML = `
                        <div class="topic-checkbox-wrapper">
                            <input type="checkbox" class="topic-checkbox" data-id="${topic.id}" ${isChecked ? 'checked' : ''}>
                        </div>
                        <div>
                            <h3>${topic.title}</h3>
                            <p>${topic.description || 'Không có mô tả.'}</p>
                        </div>
                    `;

                    card.addEventListener('click', (e) => {
                        const checkbox = card.querySelector('.topic-checkbox');
                        if (e.target === checkbox) {
                            if (checkbox.checked) {
                                selectedTopicIds.add(topic.id);
                                card.classList.add('selected-merge');
                            } else {
                                selectedTopicIds.delete(topic.id);
                                card.classList.remove('selected-merge');
                            }
                        } else {
                            if (selectedTopicIds.has(topic.id)) {
                                selectedTopicIds.delete(topic.id);
                                checkbox.checked = false;
                                card.classList.remove('selected-merge');
                            } else {
                                selectedTopicIds.add(topic.id);
                                checkbox.checked = true;
                                card.classList.add('selected-merge');
                            }
                        }
                        updateMergedWordCount();
                    });
                } else {
                    card.className = `topic-card ${selectedTopicId === topic.id ? 'selected' : ''}`;
                    card.style.backgroundColor = bgColor;
                    card.innerHTML = `
                        <div>
                            <h3>${topic.title}</h3>
                            <p>${topic.description || 'Không có mô tả.'}</p>
                        </div>
                    `;

                    card.addEventListener('click', () => {
                        document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        updateMaxWordCount(topic.id);
                    });
                }

                topicGrid.appendChild(card);
            });

            renderPagination();
        }

        function renderPagination() {
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(filteredTopics.length / cardsPerPage);
            
            if (totalPages <= 1) return;

            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.innerText = i;
                btn.className = `btn-secondary ${i === currentPage ? 'active' : ''}`;
                btn.style.padding = '5px 12px';
                if (i === currentPage) btn.style.backgroundColor = '#3498db';
                
                btn.addEventListener('click', () => {
                    currentPage = i;
                    renderCards();
                });
                paginationContainer.appendChild(btn);
            }
        }

        // Chỉ đăng ký các sự kiện này một lần duy nhất
        if (!isAppInitialized) {
            topicSearch.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                filteredTopics = allTopics.filter(t => 
                    t.title.toLowerCase().includes(term) || 
                    (t.description && t.description.toLowerCase().includes(term))
                );
                currentPage = 1;
                renderCards();
            });

            if (mergeToggle) {
                mergeToggle.addEventListener('change', async (e) => {
                    isMergeMode = e.target.checked;
                    if (isMergeMode) {
                        if (mergeActionsBar) mergeActionsBar.classList.remove('hidden');
                        if (selectedTopicId) {
                            selectedTopicIds.add(selectedTopicId);
                        } else if (allTopics.length > 0) {
                            selectedTopicIds.add(allTopics[0].id);
                        }
                        renderCards();
                        await updateMergedWordCount();
                    } else {
                        if (mergeActionsBar) mergeActionsBar.classList.add('hidden');
                        if (selectedTopicIds.size > 0) {
                            selectedTopicId = Array.from(selectedTopicIds)[0];
                        } else if (allTopics.length > 0) {
                            selectedTopicId = allTopics[0].id;
                        }
                        selectedTopicIds.clear();
                        renderCards();
                        await updateMaxWordCount(selectedTopicId);
                    }
                });
            }

            if (selectAllBtn) {
                selectAllBtn.addEventListener('click', async () => {
                    const targets = topicSearch.value.trim() ? filteredTopics : allTopics;
                    targets.forEach(t => selectedTopicIds.add(t.id));
                    renderCards();
                    await updateMergedWordCount();
                });
            }

            if (deselectAllBtn) {
                deselectAllBtn.addEventListener('click', async () => {
                    selectedTopicIds.clear();
                    renderCards();
                    await updateMergedWordCount();
                });
            }

            startBtn.addEventListener('click', () => {
                const wordCount = parseInt(wordCountInput.value, 10);
                const quizMode = document.getElementById('quiz-mode').value;

                if (isMergeMode) {
                    if (selectedTopicIds.size === 0) {
                        alert("Vui lòng chọn ít nhất một chủ đề để kiểm tra!");
                        return;
                    }

                    const maxAvailable = parseInt(wordCountInput.max, 10) || 0;
                    if (isNaN(wordCount) || wordCount <= 0) {
                        alert("Vui lòng nhập số lượng câu hỏi hợp lệ (lớn hơn 0)!");
                        return;
                    }
                    if (maxAvailable > 0 && wordCount > maxAvailable) {
                        alert(`Số lượng câu hỏi không được vượt quá tổng số từ vựng khả dụng (${maxAvailable})!`);
                        return;
                    }

                    const selectedTopicsList = allTopics.filter(t => selectedTopicIds.has(t.id));
                    const config = {
                        vocabSets: Array.from(selectedTopicIds),
                        vocabSet: Array.from(selectedTopicIds)[0], // Fallback cho code cũ
                        topicTitles: selectedTopicsList.map(t => t.title),
                        isMerged: true,
                        wordCount: wordCount,
                        quizMode: quizMode,
                        timestamp: new Date().toISOString()
                    };

                    StorageService.saveQuizConfig(config);
                    window.location.href = 'quiz.html';
                } else {
                    if (!selectedTopicId) {
                        alert("Vui lòng chọn một chủ đề!");
                        return;
                    }

                    const maxAvailable = parseInt(wordCountInput.max, 10) || 0;
                    if (isNaN(wordCount) || wordCount <= 0) {
                        alert("Vui lòng nhập số lượng câu hỏi hợp lệ (lớn hơn 0)!");
                        return;
                    }
                    if (maxAvailable > 0 && wordCount > maxAvailable) {
                        alert(`Số lượng câu hỏi không được vượt quá số từ trong bộ từ (${maxAvailable})!`);
                        return;
                    }

                    const topicObj = allTopics.find(t => t.id === selectedTopicId);
                    const config = {
                        vocabSet: selectedTopicId,
                        vocabSets: [selectedTopicId],
                        topicTitles: [topicObj ? topicObj.title : selectedTopicId],
                        isMerged: false,
                        wordCount: wordCount,
                        quizMode: quizMode,
                        timestamp: new Date().toISOString()
                    };

                    StorageService.saveQuizConfig(config);
                    window.location.href = 'quiz.html';
                }
            });

            isAppInitialized = true;
        }

        // Tải danh sách các bộ từ từ default.json
        try {
            allTopics = await VocabService.fetchTopicList();
            filteredTopics = [...allTopics];

            // Luôn render để hiển thị trạng thái (kể cả khi rỗng)
            renderCards();

            if (allTopics.length > 0 && !selectedTopicId) {
                selectedTopicId = allTopics[0].id;
                renderCards(); // Re-render để hiển thị trạng thái selected
                await updateMaxWordCount(selectedTopicId);
            }
        } catch (error) {
            console.error("Không thể tải danh sách chủ đề:", error);
            renderCards(); // Render để hiển thị thông báo lỗi/trống
        }
    }
});