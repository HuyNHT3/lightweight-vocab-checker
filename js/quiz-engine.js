// d:/PROJECT/lightweight-vocab-checker/js/quiz-engine.js

document.addEventListener('DOMContentLoaded', async () => {
    const config = StorageService.getQuizConfig();
    if (!config) {
        // Redirect to index if no config found
        window.location.href = 'index.html';
        return;
    }

    let currentQuizData = []; // Array of words for the current quiz
    let currentQuestionIndex = 0;
    let quizResults = []; // To store results for each question
    let totalQuestions = config.wordCount;

    // DOM elements
    const progressText = document.getElementById('progress-text');
    const ipaDisplay = document.getElementById('ipa-display');
    const meaningDisplay = document.getElementById('meaning-text'); // Thêm element cho ý nghĩa
    const exampleDisplay = document.getElementById('example-display');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const skipBtn = document.getElementById('skip-btn');
    const speakerBtn = document.getElementById('speaker-btn'); // Nút loa trong màn hình quiz
    const exampleSpeakerBtn = document.getElementById('example-speaker-btn'); // Nút loa ví dụ
    const timerDisplay = document.getElementById('timer-display');
    const warningContainer = document.getElementById('warning-container');
    const warningCountDisplay = document.getElementById('warning-count');

    // Trick Mode variables
    let timerInterval;
    let timeLeft;
    let warningCount = 0;
    const MAX_WARNINGS = 3;

    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Helper function to mask the word in the example sentence
    function maskExample(example, word) {
        if (!example || !word) return example;
        // Use word boundaries to avoid masking parts of other words (e.g., "an" in "analyze")
        // Escape regex special characters in the word itself
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, "gi");
        return example.replace(regex, '<span class="masked">****</span>');
    }

    // Function to load and prepare quiz data
    async function loadQuizData() {
        try {
            const vocabSet = await VocabService.fetchVocabSet(config.vocabSet);
            let words = shuffleArray(vocabSet.words);
            // Select the number of words specified in the config
            currentQuizData = words.slice(0, totalQuestions);
            // Update totalQuestions in case the actual vocab set has fewer words than requested
            totalQuestions = currentQuizData.length;

            if (totalQuestions === 0) {
                alert("Không có từ vựng nào được tìm thấy cho bộ từ này hoặc số lượng câu hỏi không hợp lệ.");
                window.location.href = 'index.html';
                return;
            }
            if (config.quizMode === 'trick') {
                startTimer();
                setupAntiCheat();
            }
            displayQuestion();
        } catch (error) {
            console.error("Failed to load quiz data:", error);
            alert("Không thể tải dữ liệu từ vựng. Vui lòng thử lại sau.");
            window.location.href = 'index.html'; // Redirect back on error
        }
    }

    // Function to display the current question
    function displayQuestion() {
        if (currentQuestionIndex >= totalQuestions) {
            finishQuiz();
            return;
        }

        const currentWord = currentQuizData[currentQuestionIndex];
        progressText.textContent = `Câu hỏi: ${currentQuestionIndex + 1}/${totalQuestions}`;
        ipaDisplay.textContent = currentWord.ipa;
        meaningDisplay.textContent = currentWord.meaning; // Hiển thị ý nghĩa
        exampleDisplay.innerHTML = maskExample(currentWord.example, currentWord.word);
        answerInput.value = ''; // Clear previous answer
        answerInput.focus(); // Focus on the input field
    }

    // Function to check the answer and move to the next question
    function checkAnswer() {
        const currentWord = currentQuizData[currentQuestionIndex];
        // Normalize and trim to handle hidden characters or Unicode differences
        const userAnswer = answerInput.value.trim().toUpperCase().normalize('NFC');
        const correctAnswer = currentWord.word.trim().toUpperCase().normalize('NFC');
        console.log(userAnswer);
        console.log(correctAnswer);

        // Strict comparison
        const isCorrect = userAnswer === correctAnswer;

        quizResults.push({
            word: currentWord.word.toUpperCase(), // Ensure word is stored as uppercase for results
            type: currentWord.type,
            ipa: currentWord.ipa,
            meaning: currentWord.meaning,
            example: currentWord.example,
            audio: currentWord.audio,
            userAnswer: userAnswer,
            isCorrect: isCorrect,
            skipped: false
        });

        currentQuestionIndex++;
        displayQuestion();
    }

    // Function to handle skipping a question
    function skipQuestion() {
        const currentWord = currentQuizData[currentQuestionIndex];
        quizResults.push({
            word: currentWord.word.toUpperCase(),
            type: currentWord.type,
            ipa: currentWord.ipa,
            meaning: currentWord.meaning,
            example: currentWord.example,
            audio: currentWord.audio,
            userAnswer: '', // Empty for skipped
            isCorrect: false, // Skipped is considered incorrect
            skipped: true
        });

        currentQuestionIndex++;
        displayQuestion();
    }

    // Function to finish the quiz and redirect to the result page
    function finishQuiz() {
        const correctAnswers = quizResults.filter(r => r.isCorrect).length;
        const finalResult = {
            timestamp: config.timestamp,
            vocabSet: config.vocabSet,
            totalQuestions: quizResults.length, // Use actual count from results
            correctAnswers: correctAnswers,
            details: quizResults
        };
        StorageService.saveQuizResult(finalResult);
        window.location.href = 'result.html';
    }

    // Timer Functions for Trick Mode
    function startTimer() {
        // Calculate time based on wordCount * 30 seconds
        timeLeft = totalQuestions * 30;
        timerDisplay.classList.remove('hidden');
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("Hết giờ! Bài quiz sẽ tự động hoàn thành.");
                finishQuiz();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Anti-Cheat Functions for Trick Mode
    function setupAntiCheat() {
        let isTabActive = true;

        // Event listener for tab visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Tab is hidden (user switched away)
                isTabActive = false;
                handleCheatAttempt();
            } else {
                // Tab is visible again
                isTabActive = true;
            }
        });

        // Event listener for window blur (user switched to another app/window)
        window.addEventListener('blur', () => {
            if (isTabActive) { // Only trigger if not already handled by visibilitychange
                handleCheatAttempt();
            }
        });

        // Event listener for window focus (user returned to the tab/window)
        window.addEventListener('focus', () => {
            // Reset any temporary states if needed, but warnings persist
        });
    }

    function handleCheatAttempt() {
        warningCount++;
        warningCountDisplay.textContent = warningCount;
        warningContainer.classList.remove('hidden');

        if (warningCount >= MAX_WARNINGS) {
            alert("Bạn đã vi phạm quy tắc quá nhiều lần! Bài quiz sẽ tự động hoàn thành.");
            stopTimer();
            // Mark all remaining questions as skipped/incorrect
            for (let i = currentQuestionIndex; i < totalQuestions; i++) {
                const currentWord = currentQuizData[i];
                quizResults.push({
                    word: currentWord.word,
                    type: currentWord.type,
                    ipa: currentWord.ipa,
                    meaning: currentWord.meaning,
                    example: currentWord.example,
                    audio: currentWord.audio,
                    userAnswer: '',
                    isCorrect: false,
                    skipped: true,
                    cheatDetected: true // Add a flag for cheating
                });
            }
            finishQuiz();
        } else {
            // Briefly show warning, then hide after a few seconds
            setTimeout(() => {
                if (warningCount < MAX_WARNINGS) { // Only hide if not yet auto-submitted
                    warningContainer.classList.add('hidden');
                }
            }, 3000); // Hide warning after 3 seconds
        }
    }

    // Event Listeners
    submitBtn.addEventListener('click', () => {
        // Confirmation for the last question
        if (currentQuestionIndex === totalQuestions - 1) {
            if (confirm("Đây là câu hỏi cuối cùng. Bạn có chắc muốn gửi đáp án và hoàn thành bài quiz?")) {
                checkAnswer();
            }
        } else {
            checkAnswer();
        }
    });

    skipBtn.addEventListener('click', () => {
        // Confirmation for the last question if skipping
        if (currentQuestionIndex === totalQuestions - 1) {
            if (confirm("Đây là câu hỏi cuối cùng. Bạn có chắc muốn bỏ qua và hoàn thành bài quiz?")) {
                skipQuestion();
            }
        } else {
            skipQuestion();
        }
    });

    // Speaker Button Listener (TTS Integration)
    if (speakerBtn) {
        speakerBtn.addEventListener('click', () => {
            const currentWord = currentQuizData[currentQuestionIndex];
            if (currentWord) vocabAudioService.speak(currentWord.word);
        });
    }

    if (exampleSpeakerBtn) {
        exampleSpeakerBtn.addEventListener('click', () => {
            const currentWord = currentQuizData[currentQuestionIndex];
            if (currentWord) vocabAudioService.speak(currentWord.example);
        });
    }

    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission behavior
            submitBtn.click(); // Trigger the submit button click
        }
    });

    // Force input to uppercase as the user types
    answerInput.addEventListener('input', () => {
        answerInput.value = answerInput.value.toUpperCase();
    });

    // Stop timer if quiz is finished by user actions
    submitBtn.addEventListener('click', () => { if (currentQuestionIndex >= totalQuestions) stopTimer(); });
    skipBtn.addEventListener('click', () => { if (currentQuestionIndex >= totalQuestions) stopTimer(); });

    // Initialize the quiz when the page loads
    loadQuizData();
});
