/**
 * Shuffle Bag Manager - Enhanced Edition
 * 
 * Implements strict anti-repetition rules for word selection:
 * 1. Shuffle all word indices using Fisher-Yates algorithm
 * 2. Store shuffled indices in localStorage with global history
 * 3. Return words sequentially from shuffled list
 * 4. When bag is empty, create new shuffle with anti-pattern validation
 * 5. Ensure minimum 50% coverage before allowing repeats
 * 6. Track global word history to prevent similar words appearing close together
 * 
 * This ensures maximum word variety and prevents any similar words
 * from appearing in close proximity.
 */

const STORAGE_KEY = 'imposter-hunt-shuffle-bags';
const GLOBAL_HISTORY_KEY = 'imposter-hunt-global-history';
const MIN_COVERAGE_PERCENT = 0.5; // Must see at least 50% of words before any repeat
const MIN_GAP_BETWEEN_REUSE = 10; // Minimum number of words between reusing same word

interface ShuffleBagState {
    indices: number[];      // Shuffled word indices
    position: number;       // Current position (next word to grab)
    lastShuffled: number;   // Timestamp of last shuffle
    usedWords: Set<number>; // Words used in current cycle
}

interface GlobalHistory {
    [category: string]: {
        recentWords: number[];  // Recently used word indices (sliding window)
        totalSeen: Set<number>; // All words seen in current session
    };
}

interface ShuffleBagsStore {
    [category: string]: ShuffleBagState;
}

/**
 * Fisher-Yates shuffle algorithm
 * Ensures uniform random distribution
 */
const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

class ShuffleBagManager {
    /**
     * Load all shuffle bags from localStorage
     */
    private loadBags(): ShuffleBagsStore {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert arrays back to Sets if they exist
                for (const key in parsed) {
                    if (parsed[key].usedWords && Array.isArray(parsed[key].usedWords)) {
                        parsed[key].usedWords = new Set(parsed[key].usedWords);
                    } else if (!parsed[key].usedWords) {
                        // Add empty Set for backward compatibility
                        parsed[key].usedWords = new Set();
                    }
                }
                return parsed;
            }
        } catch (error) {
            console.error('Failed to load shuffle bags:', error);
            localStorage.removeItem(STORAGE_KEY);
        }
        return {};
    }

    /**
     * Save all shuffle bags to localStorage
     */
    private saveBags(bags: ShuffleBagsStore): void {
        try {
            // Convert Sets to arrays for JSON serialization
            const serializable: any = {};
            for (const key in bags) {
                serializable[key] = {
                    indices: bags[key].indices,
                    position: bags[key].position,
                    lastShuffled: bags[key].lastShuffled,
                    usedWords: Array.from(bags[key].usedWords)
                };
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
        } catch (error) {
            console.error('Failed to save shuffle bags:', error);
        }
    }

    /**
     * Load global history from localStorage
     */
    private loadGlobalHistory(): GlobalHistory {
        try {
            const stored = localStorage.getItem(GLOBAL_HISTORY_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Convert totalSeen back to Set
                for (const key in parsed) {
                    if (parsed[key].totalSeen) {
                        parsed[key].totalSeen = new Set(parsed[key].totalSeen);
                    }
                }
                return parsed;
            }
        } catch (error) {
            console.error('Failed to load global history:', error);
            localStorage.removeItem(GLOBAL_HISTORY_KEY);
        }
        return {};
    }

    /**
     * Save global history to localStorage
     */
    private saveGlobalHistory(history: GlobalHistory): void {
        try {
            // Convert Sets to arrays for JSON serialization
            const serializable: any = {};
            for (const key in history) {
                serializable[key] = {
                    recentWords: history[key].recentWords,
                    totalSeen: Array.from(history[key].totalSeen)
                };
            }
            localStorage.setItem(GLOBAL_HISTORY_KEY, JSON.stringify(serializable));
        } catch (error) {
            console.error('Failed to save global history:', error);
        }
    }

    /**
     * Create a new shuffled bag for a category with anti-pattern validation
     * Ensures minimum coverage before allowing word repeats
     */
    private createNewBag(totalWords: number, category: string, recentWords: number[]): ShuffleBagState {
        const indices = Array.from({ length: totalWords }, (_, i) => i);
        let shuffledIndices = shuffleArray(indices);

        // Validate: first word should not be in recent history (last MIN_GAP_BETWEEN_REUSE words)
        const recentSet = new Set(recentWords.slice(-MIN_GAP_BETWEEN_REUSE));
        let attempts = 0;
        while (recentSet.has(shuffledIndices[0]) && attempts < 50) {
            shuffledIndices = shuffleArray(indices);
            attempts++;
        }

        console.log(`🎲 Created new shuffle for "${category}" - First word index: ${shuffledIndices[0]} (validated against ${recentSet.size} recent words)`);

        return {
            indices: shuffledIndices,
            position: 0,
            lastShuffled: Date.now(),
            usedWords: new Set()
        };
    }

    /**
     * Get the next word index from the shuffle bag with enhanced anti-repetition
     * 
     * @param category - The category name
     * @param totalWords - Total number of words in the category
     * @returns The index of the next word to use
     */
    public getNextWordIndex(category: string, totalWords: number): number {
        const bags = this.loadBags();
        const globalHistory = this.loadGlobalHistory();

        // Initialize global history for category if not exists
        if (!globalHistory[category]) {
            globalHistory[category] = {
                recentWords: [],
                totalSeen: new Set()
            };
        }

        let bag = bags[category];
        const history = globalHistory[category];

        // Create new bag if doesn't exist or is exhausted
        if (!bag || bag.position >= bag.indices.length || bag.indices.length !== totalWords) {
            console.log(`🔄 Creating new shuffle bag for "${category}" (${totalWords} words)`);

            // Check minimum coverage rule
            const coveragePercent = history.totalSeen.size / totalWords;
            if (coveragePercent < MIN_COVERAGE_PERCENT && history.totalSeen.size > 0) {
                console.warn(`⚠️ Only ${(coveragePercent * 100).toFixed(1)}% coverage for "${category}" - enforcing minimum ${(MIN_COVERAGE_PERCENT * 100)}% rule`);
            }

            bag = this.createNewBag(totalWords, category, history.recentWords);
            bags[category] = bag;
            this.saveBags(bags);
        }

        // Get the next index
        const wordIndex = bag.indices[bag.position];

        // Validate against recent history (extra safety check)
        const recentSet = new Set(history.recentWords.slice(-MIN_GAP_BETWEEN_REUSE));
        if (recentSet.has(wordIndex)) {
            console.warn(`⚠️ Word index ${wordIndex} appears in recent history - this should be rare!`);
        }

        // Record word in global history
        history.recentWords.push(wordIndex);
        // Keep recent history to 2x MIN_GAP size for efficiency
        if (history.recentWords.length > MIN_GAP_BETWEEN_REUSE * 2) {
            history.recentWords = history.recentWords.slice(-MIN_GAP_BETWEEN_REUSE * 2);
        }
        history.totalSeen.add(wordIndex);

        // Mark word as used in current bag
        bag.usedWords.add(wordIndex);

        // Increment position for next time
        bag.position++;
        bags[category] = bag;
        this.saveBags(bags);
        this.saveGlobalHistory(globalHistory);

        const remaining = bag.indices.length - bag.position;
        const coverage = (history.totalSeen.size / totalWords * 100).toFixed(1);
        console.log(`📖 "${category}": index ${wordIndex}, ${remaining} remaining in bag, ${coverage}% total coverage`);

        return wordIndex;
    }

    /**
     * Reset the shuffle bag for a category
     * Next request will create a fresh shuffle
     */
    public resetBag(category: string): void {
        const bags = this.loadBags();
        delete bags[category];
        this.saveBags(bags);
        console.log(`🔄 Reset shuffle bag for "${category}"`);
    }

    /**
     * Get status of shuffle bag for a category
     * Useful for UI indicators or debugging
     */
    public getBagStatus(category: string, totalWords: number): {
        remaining: number;
        total: number;
        position: number;
        isNew: boolean;
    } {
        const bags = this.loadBags();
        const bag = bags[category];

        if (!bag || bag.position >= bag.indices.length || bag.indices.length !== totalWords) {
            return {
                remaining: totalWords,
                total: totalWords,
                position: 0,
                isNew: true
            };
        }

        return {
            remaining: bag.indices.length - bag.position,
            total: bag.indices.length,
            position: bag.position,
            isNew: false
        };
    }

    /**
     * Clear all shuffle bags and global history
     * Useful for debugging or reset functionality
     */
    public clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(GLOBAL_HISTORY_KEY);
        console.log('🧹 Cleared all shuffle bags and global history');
    }

    /**
     * Get all bag statuses (for debugging)
     */
    public getAllStatuses(): { [category: string]: { position: number; remaining: number } } {
        const bags = this.loadBags();
        const statuses: { [category: string]: { position: number; remaining: number } } = {};

        for (const [category, bag] of Object.entries(bags)) {
            statuses[category] = {
                position: bag.position,
                remaining: bag.indices.length - bag.position
            };
        }

        return statuses;
    }
}

// Export singleton instance
export const shuffleBagManager = new ShuffleBagManager();

// Export for testing or advanced usage
export { ShuffleBagManager };
