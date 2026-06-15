// d:/PROJECT/lightweight-vocab-checker/js/vocab-service.js

/**
 * VocabService handles fetching vocabulary data from local JSON files.
 */
class VocabService {
    /**
     * Fetches the list of available topics from default.json.
     * @returns {Promise<Array>} A promise that resolves with the list of topic metadata.
     */
    static async fetchTopicList() {
        try {
            return await VocabService.fetchVocabSet('default.json');
        } catch (error) {
            console.error("Error fetching topic list:", error);
            return [];
        }
    }

    /**
     * Fetches a vocabulary set from the specified JSON file.
     * @param {string} filename The name of the JSON file (e.g., "default.json").
     * @returns {Promise<Object>} A promise that resolves with the vocabulary data.
     * @throws {Error} If the file cannot be fetched or parsed.
     */
    static async fetchVocabSet(filename) {
        try {
            const response = await fetch(`data/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filename}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Error fetching vocabulary set:", error);
            throw error; // Re-throw to allow calling code to handle it
        }
    }
}