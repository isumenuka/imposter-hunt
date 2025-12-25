/**
 * Randomization Utilities
 * Provides fair, unbiased random selection algorithms
 */

/**
 * Fisher-Yates Shuffle Algorithm
 * Provides mathematically proven uniform distribution
 * Time Complexity: O(n), Space Complexity: O(n)
 * 
 * @param array - Array to shuffle
 * @returns A new shuffled array (does not modify original)
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
    const result = [...array]; // Create a copy to avoid mutation

    // Iterate backwards through the array
    for (let i = result.length - 1; i > 0; i--) {
        // Pick a random index from 0 to i (inclusive)
        const randomIndex = Math.floor(Math.random() * (i + 1));

        // Swap elements at i and randomIndex
        [result[i], result[randomIndex]] = [result[randomIndex], result[i]];
    }

    return result;
}

/**
 * Select a random element from an array
 * Each element has equal probability of being selected
 * 
 * @param array - Array to select from
 * @returns A random element, or undefined if array is empty
 */
export function selectRandom<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}

/**
 * Select N random unique elements from an array
 * Uses Fisher-Yates for fair selection
 * 
 * @param array - Array to select from
 * @param count - Number of elements to select
 * @returns Array of randomly selected elements (up to count)
 */
export function selectRandomMultiple<T>(array: T[], count: number): T[] {
    if (count >= array.length) {
        return fisherYatesShuffle(array);
    }

    const shuffled = fisherYatesShuffle(array);
    return shuffled.slice(0, count);
}

/**
 * Generate a random integer between min and max (inclusive)
 * 
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in range [min, max]
 */
export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle an array in place (mutates the original array)
 * Use this when you want to modify the original array
 * 
 * @param array - Array to shuffle in place
 * @returns The same array, shuffled
 */
export function shuffleInPlace<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
}
