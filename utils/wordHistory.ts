/**
 * Word History Module
 * Tracks recently used words per category to prevent repetition
 * Uses localStorage for persistence across sessions
 */

const STORAGE_KEY = 'imposter_word_history';

// History sizes based on category size
const SMALL_CATEGORY_THRESHOLD = 20;
const MEDIUM_CATEGORY_THRESHOLD = 50;
const SMALL_HISTORY_SIZE = 5;
const MEDIUM_HISTORY_SIZE = 10;
const LARGE_HISTORY_SIZE = 15;

interface WordHistory {
    [category: string]: string[];
}

/**
 * Get history size based on total words available in category
 */
const getHistorySize = (totalWords: number): number => {
    if (totalWords < SMALL_CATEGORY_THRESHOLD) {
        return Math.min(SMALL_HISTORY_SIZE, Math.floor(totalWords * 0.4)); // Max 40% of available words
    } else if (totalWords < MEDIUM_CATEGORY_THRESHOLD) {
        return MEDIUM_HISTORY_SIZE;
    } else {
        return LARGE_HISTORY_SIZE;
    }
};

/**
 * Load word history from localStorage
 */
const loadHistory = (): WordHistory => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load word history:', error);
    }
    return {};
};

/**
 * Save word history to localStorage
 */
const saveHistory = (history: WordHistory): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error('Failed to save word history:', error);
    }
};

/**
 * Get word history for a specific category
 */
export const getWordHistory = (category: string): string[] => {
    const history = loadHistory();
    return history[category] || [];
};

/**
 * Save a word to history for a category (sliding window)
 */
export const saveWordToHistory = (category: string, word: string, totalWordsInCategory: number): void => {
    const history = loadHistory();
    const categoryHistory = history[category] || [];

    // Remove the word if it already exists (to avoid duplicates)
    const filtered = categoryHistory.filter(w => w !== word);

    // Add the new word to the end
    filtered.push(word);

    // Trim to history size (sliding window)
    const historySize = getHistorySize(totalWordsInCategory);
    if (filtered.length > historySize) {
        filtered.splice(0, filtered.length - historySize);
    }

    history[category] = filtered;
    saveHistory(history);
};

/**
 * Filter out recently used words from available words
 * Returns filtered list or original list if filtering would leave no words
 */
export const filterAvailableWords = <T extends { word: string }>(
    category: string,
    allWords: T[]
): T[] => {
    if (allWords.length === 0) {
        return allWords;
    }

    const history = getWordHistory(category);

    if (history.length === 0) {
        // No history yet, return all words
        return allWords;
    }

    // Filter out words in history
    const filtered = allWords.filter(item => !history.includes(item.word));

    if (filtered.length === 0) {
        // All words have been used recently
        // Return word that was used least recently (first in history array)
        const leastRecentWord = history[0];
        const leastRecentItem = allWords.find(item => item.word === leastRecentWord);

        if (leastRecentItem) {
            return [leastRecentItem];
        }

        // Fallback: return all words if something went wrong
        return allWords;
    }

    return filtered;
};

/**
 * Clear all word history (useful for testing or manual reset)
 */
export const clearWordHistory = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Word history cleared');
    } catch (error) {
        console.error('Failed to clear word history:', error);
    }
};

/**
 * Get statistics about word history (for debugging)
 */
export const getHistoryStats = (): { category: string; wordsInHistory: number }[] => {
    const history = loadHistory();
    return Object.entries(history).map(([category, words]) => ({
        category,
        wordsInHistory: words.length
    }));
};
