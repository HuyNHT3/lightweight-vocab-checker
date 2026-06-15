document.addEventListener('DOMContentLoaded', () => {
    const scoreSummary = document.getElementById('score-summary');
    const correctCountSpan = document.getElementById('correct-count');
    const totalCountSpan = document.getElementById('total-count');
    const resultsList = document.getElementById('results-list');

    // Get the latest quiz result from StorageService
    const quizHistory = StorageService.getQuizHistory();
    if (quizHistory.length === 0) {
        // No history found, redirect to index or show a message
        scoreSummary.innerHTML = "Không tìm thấy kết quả quiz nào. Vui lòng bắt đầu một bài quiz mới.";
        resultsList.innerHTML = "";
        return;
    }

    const latestResult = quizHistory[0]; // Get the most recent result

    // Display summary
    correctCountSpan.textContent = latestResult.correctAnswers;
    totalCountSpan.textContent = latestResult.totalQuestions;

    // Create Table structure
    const table = document.createElement('table');
    table.classList.add('results-table');
    
    table.innerHTML = `
        <thead>
            <tr>
                <th>Từ vựng</th>
                <th>IPA / Nghĩa</th>
                <th>Ví dụ</th>
                <th>Trạng thái</th>
                <th>Nghe</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    latestResult.details.forEach(item => {
        const row = document.createElement('tr');

        let statusClass = '';
        let statusText = '';
        if (item.isCorrect) {
            statusClass = 'correct';
            statusText = 'Đúng';
        } else if (item.skipped) {
            statusClass = 'skipped';
            statusText = 'Bỏ qua';
        } else {
            statusClass = 'incorrect';
            statusText = 'Sai';
        }

        row.classList.add(statusClass);

        let audioButtonHtml = '';
        const audioPath = item.audio || '';
        audioButtonHtml = `
            <button class="audio-btn" data-audio-src="${audioPath}" data-word="${item.word}" title="Nghe phát âm">🔊</button>
        `;

        row.innerHTML = `
            <td>
                <div class="result-word">${item.word}</div>
                <small>(${item.type})</small>
            </td>
            <td>
                <div><strong>${item.ipa}</strong></div>
                <div>${item.meaning}</div>
            </td>
            <td><small>${item.example}</small></td>
            <td><span class="result-status ${statusClass}">${statusText}</span></td>
            <td>${audioButtonHtml}</td>
        `;
        tbody.appendChild(row);
    });

    resultsList.appendChild(table);

    // Add event listener for audio buttons
    resultsList.addEventListener('click', (event) => {
        if (event.target.closest('.audio-btn')) {
            const btn = event.target.closest('.audio-btn');
            const audioSrc = btn.dataset.audioSrc;
            const word = btn.dataset.word;

            if (audioSrc) {
                // Thử phát file local trước, nếu lỗi thì dùng TTS làm fallback
                vocabAudioService.playLocalFile(audioSrc, () => {
                    vocabAudioService.speak(word);
                });
            } else {
                // Nếu không có file local, dùng TTS ngay lập tức
                vocabAudioService.speak(word);
            }
        }
    });
});