// d:/PROJECT/lightweight-vocab-checker/js/storage-service.js

/**
 * StorageService handles saving and retrieving data from localStorage.
 * This includes quiz configuration and quiz history.
 */
class StorageService {
    static QUIZ_CONFIG_KEY = 'vocabQuizConfig';
    static QUIZ_HISTORY_KEY = 'vocabQuizHistory';
    static MAX_HISTORY_RECORDS = 10;

    /**
     * Saves the current quiz configuration to localStorage.
     * Supports both single vocabulary set and multiple merged sets.
     * 
     * @param {object} config - The quiz configuration object.
     * @param {string} [config.vocabSet] - The filename of the selected vocabulary set (or primary set).
     * @param {Array<string>} [config.vocabSets] - Array of filenames for merged topics.
     * @param {Array<string>} [config.topicTitles] - Array of titles corresponding to the topics.
     * @param {boolean} [config.isMerged] - Whether this quiz is in merge mode.
     * @param {number} config.wordCount - The number of words for the quiz.
     * @param {string} config.quizMode - The selected quiz mode ('normal' or 'trick').
     * @param {string} [config.timestamp] - ISO timestamp when the quiz was configured.
     */
    static saveQuizConfig(config) {
        try {
            if (!config || typeof config !== 'object') {
                throw new Error("Invalid configuration object provided.");
            }

            // Chuẩn hóa dữ liệu để đảm bảo tương thích 2 chiều
            const normalizedConfig = { ...config };

            // Đảm bảo có cả vocabSets (mảng) và vocabSet (string fallback)
            if (Array.isArray(normalizedConfig.vocabSets) && normalizedConfig.vocabSets.length > 0) {
                if (!normalizedConfig.vocabSet) {
                    normalizedConfig.vocabSet = normalizedConfig.vocabSets[0];
                }
            } else if (normalizedConfig.vocabSet) {
                normalizedConfig.vocabSets = [normalizedConfig.vocabSet];
            } else {
                normalizedConfig.vocabSets = [];
            }

            normalizedConfig.isMerged = Boolean(
                normalizedConfig.isMerged || (normalizedConfig.vocabSets && normalizedConfig.vocabSets.length > 1)
            );

            if (!Array.isArray(normalizedConfig.topicTitles)) {
                normalizedConfig.topicTitles = normalizedConfig.vocabSet ? [normalizedConfig.vocabSet] : [];
            }

            if (!normalizedConfig.timestamp) {
                normalizedConfig.timestamp = new Date().toISOString();
            }

            localStorage.setItem(StorageService.QUIZ_CONFIG_KEY, JSON.stringify(normalizedConfig));
        } catch (e) {
            console.error("Error saving quiz configuration to localStorage:", e);
        }
    }

    /**
     * Retrieves the quiz configuration from localStorage and normalizes it.
     * @returns {object|null} The normalized quiz configuration object, or null if not found.
     */
    static getQuizConfig() {
        try {
            const rawConfig = localStorage.getItem(StorageService.QUIZ_CONFIG_KEY);
            if (!rawConfig) return null;

            const config = JSON.parse(rawConfig);
            if (!config || typeof config !== 'object') return null;

            // Đảm bảo các thuộc tính mảng luôn tồn tại cho caller sử dụng an toàn
            if (!Array.isArray(config.vocabSets)) {
                config.vocabSets = config.vocabSet ? [config.vocabSet] : [];
            }
            if (!config.vocabSet && config.vocabSets.length > 0) {
                config.vocabSet = config.vocabSets[0];
            }
            if (!Array.isArray(config.topicTitles)) {
                config.topicTitles = config.vocabSet ? [config.vocabSet] : [];
            }
            config.isMerged = Boolean(config.isMerged || config.vocabSets.length > 1);

            return config;
        } catch (e) {
            console.error("Error retrieving quiz configuration from localStorage:", e);
            return null;
        }
    }

    /**
     * Saves a quiz result to the history, keeping only the latest MAX_HISTORY_RECORDS.
     * @param {object} result - The quiz result object to save.
     * @param {string} result.timestamp - Timestamp of the quiz.
     * @param {string|Array<string>} result.vocabSet - The vocabulary set(s) used.
     * @param {number} result.totalQuestions - Total questions in the quiz.
     * @param {number} result.correctAnswers - Number of correct answers.
     * @param {Array<object>} result.details - Detailed results for each question.
     */
    static saveQuizResult(result) {
        try {
            const history = StorageService.getQuizHistory();
            history.unshift(result); // Add new result to the beginning

            // Keep only the latest MAX_HISTORY_RECORDS
            if (history.length > StorageService.MAX_HISTORY_RECORDS) {
                history.splice(StorageService.MAX_HISTORY_RECORDS);
            }

            localStorage.setItem(StorageService.QUIZ_HISTORY_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("Error saving quiz result to localStorage:", e);
        }
    }

    /**
     * Retrieves the quiz history from localStorage.
     * @returns {Array<object>} An array of quiz result objects.
     */
    static getQuizHistory() {
        try {
            const history = localStorage.getItem(StorageService.QUIZ_HISTORY_KEY);
            return history ? JSON.parse(history) : [];
        } catch (e) {
            console.error("Error retrieving quiz history from localStorage:", e);
            return [];
        }
    }
}