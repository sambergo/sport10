/**
 * Array utility functions for game operations
 */

/**
 * Fisher-Yates shuffle algorithm to randomize array order
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Create mapping from original indices to shuffled indices
 * Used to track where original items ended up after shuffling
 * @param originalLength - Length of the original array
 * @param shuffledArray - The shuffled array
 * @param originalArray - The original array before shuffling
 * @returns Array mapping original indices to shuffled positions
 */
export function createIndexMapping(originalLength: number, shuffledArray: any[], originalArray: any[]): number[] {
    const mapping: number[] = [];
    for (let i = 0; i < shuffledArray.length; i++) {
        const originalIndex = originalArray.findIndex(item => item === shuffledArray[i]);
        mapping[originalIndex] = i;
    }
    return mapping;
}