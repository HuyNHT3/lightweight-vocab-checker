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
     * @param {object} config - The quiz configuration object.
     * @param {string} config.vocabSet - The filename of the selected vocabulary set.
     * @param {number} config.wordCount - The number of words for the quiz.
     * @param {string} config.quizMode - The selected quiz mode ('normal' or 'trick').
     */
    static saveQuizConfig(config) {
        try {
            localStorage.setItem(StorageService.QUIZ_CONFIG_KEY, JSON.stringify(config));
        } catch (e) {
            console.error("Error saving quiz configuration to localStorage:", e);
        }
    }

    /**
     * Retrieves the quiz configuration from localStorage.
     * @returns {object|null} The quiz configuration object, or null if not found.
     */
    static getQuizConfig() {
        try {
            const config = localStorage.getItem(StorageService.QUIZ_CONFIG_KEY);
            return config ? JSON.parse(config) : null;
        } catch (e) {
            console.error("Error retrieving quiz configuration from localStorage:", e);
            return null;
        }
    }

    /**
     * Saves a quiz result to the history, keeping only the latest MAX_HISTORY_RECORDS.
     * @param {object} result - The quiz result object to save.
     * @param {string} result.timestamp - Timestamp of the quiz.
     * @param {string} result.vocabSet - The vocabulary set used.
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