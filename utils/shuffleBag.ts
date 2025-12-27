/**
 * Shuffle Bag Manager
 * 
 * Implements the "shuffle bag" pattern for word selection:
 * 1. Shuffle all word indices using Fisher-Yates algorithm
 * 2. Store shuffled indices in localStorage
 * 3. Return words sequentially from shuffled list
 * 4. When bag is empty, create new shuffle
 * 
 * This ensures every word is seen exactly once before any repeats,
 * providing fair distribution and preventing immediate duplicates.
 */

const STORAGE_KEY = 'imposter-hunt-shuffle-bags';

interface ShuffleBagState {
    indices: number[];      // Shuffled word indices
    position: number;       // Current position (next word to grab)
    lastShuffled: number;   // Timestamp of last shuffle
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
                return JSON.parse(stored);
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
            localStorage.setItem(STORAGE_KEY, JSON.stringify(bags));
        } catch (error) {
            console.error('Failed to save shuffle bags:', error);
        }
    }

    /**
     * Create a new shuffled bag for a category
     */
    private createNewBag(totalWords: number): ShuffleBagState {
        const indices = Array.from({ length: totalWords }, (_, i) => i);
        const shuffledIndices = shuffleArray(indices);

        return {
            indices: shuffledIndices,
            position: 0,
            lastShuffled: Date.now()
        };
    }

    /**
     * Get the next word index from the shuffle bag
     * 
     * @param category - The category name
     * @param totalWords - Total number of words in the category
     * @returns The index of the next word to use
     */
    public getNextWordIndex(category: string, totalWords: number): number {
        const bags = this.loadBags();
        let bag = bags[category];

        // Create new bag if doesn't exist or is exhausted
        if (!bag || bag.position >= bag.indices.length || bag.indices.length !== totalWords) {
            console.log(`🔄 Creating new shuffle bag for "${category}" (${totalWords} words)`);
            bag = this.createNewBag(totalWords);
            bags[category] = bag;
            this.saveBags(bags);
        }

        // Get the next index
        const wordIndex = bag.indices[bag.position];

        // Increment position for next time
        bag.position++;
        bags[category] = bag;
        this.saveBags(bags);

        const remaining = bag.indices.length - bag.position;
        console.log(`📖 Shuffle bag "${category}": picked index ${wordIndex}, ${remaining} remaining`);

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
     * Clear all shuffle bags
     * Useful for debugging or reset functionality
     */
    public clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🧹 Cleared all shuffle bags');
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
