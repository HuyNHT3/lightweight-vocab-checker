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
    
    let allTopics = [];
    let filteredTopics = [];
    let selectedTopicId = null;
    let currentPage = 1;
    const cardsPerPage = 6;

    // Danh sách các màu nền nhẹ (Pastel)
    const pastelColors = [
        '#fdf2f2', // Hồng nhạt
        '#fdfaf2', // Cam nhạt
        '#f2fdf2', // Xanh lá nhạt
        '#f2f8fd', // Xanh dương nhạt
        '#f5f2fd', // Tím nhạt
        '#fdf2f8'  // Magenta nhạt
    ];

    // Hàm cập nhật số lượng câu hỏi tối đa dựa trên bộ từ được chọn
    async function updateMaxWordCount(filename) {
        if (!filename) return;

        try {
            const data = await VocabService.fetchVocabSet(filename);
            const totalWords = data.words.length;
            wordCountInput.value = totalWords;
            wordCountInput.max = totalWords;
            selectedTopicId = filename;
        } catch (error) {
            console.error("Lỗi khi cập nhật số lượng từ:", error);
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
            const bgColor = pastelColors[originalIndex % pastelColors.length];

            const card = document.createElement('div');
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

    // Chỉ đăng ký các sự kiện này một lần
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

        startBtn.addEventListener('click', () => {
            if (!selectedTopicId) {
                alert("Vui lòng chọn một chủ đề!");
                return;
            }

            const config = {
                vocabSet: selectedTopicId,
                wordCount: parseInt(document.getElementById('word-count').value),
                quizMode: document.getElementById('quiz-mode').value,
                timestamp: new Date().toISOString()
            };

            StorageService.saveQuizConfig(config);
            window.location.href = 'quiz.html';
        });

        isAppInitialized = true;
    }

    // Tải danh sách các bộ từ từ default.json
    try {
        allTopics = await VocabService.fetchTopicList();
        // console.log("Fetched topics:", allTopics); // Log này đã có từ lần trước, giữ nguyên nếu cần
        filteredTopics = [...allTopics];

        // Luôn render để hiển thị trạng thái (kể cả khi rỗng)
        renderCards();

        if (allTopics.length > 0 && !selectedTopicId) {
            selectedTopicId = allTopics[0].id;
            renderCards(); // Re-render để hiện thị trạng thái selected
            await updateMaxWordCount(selectedTopicId);
        }
    } catch (error) {
        console.error("Không thể tải danh sách chủ đề:", error);
        renderCards(); // Render để hiển thị thông báo lỗi/trống
    }
    }
});