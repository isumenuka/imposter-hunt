/**
 * AI Service - Client-side stub
 * 
 * NOTE: This service no longer calls OpenAI directly.
 * All AI functionality has been moved to the server for security.
 * 
 * This file is kept for backward compatibility but doesn't do anything
 * except provide fallback words in case they're needed offline.
 */

import { GAME_CATEGORIES } from '../constants';

// Fallback words for offline mode (if needed)
const FALLBACK_DATA: Record<string, Array<{ word: string; hint: string }>> = {
  Animals: [
    { word: 'Elephant', hint: 'Jungle' },
    { word: 'Penguin', hint: 'Cold' },
    { word: 'Dolphin', hint: 'Ocean' }
  ],
  Foods: [
    { word: 'Pizza', hint: 'Italian' },
    { word: 'Sushi', hint: 'Japanese' },
    { word: 'Burger', hint: 'American' }
  ],
  Objects: [
    { word: 'Laptop', hint: 'Computer' },
    { word: 'Camera', hint: 'Photos' },
    { word: 'Book', hint: 'Reading' }
  ]
};

class AIService {
  /**
   * Generate game content (word + association word)
   * @deprecated This now happens on the server
   * @param category - Game category
   * @returns Fallback word for offline mode only
   */
  async generateGameContent(category: string): Promise<{ word: string; associationWord: string }> {
    console.warn('⚠️  Client-side AI generation is deprecated. Server handles this now.');

    // Return fallback for offline mode
    const categoryData = FALLBACK_DATA[category] || FALLBACK_DATA.Objects;
    const random = categoryData[Math.floor(Math.random() * categoryData.length)];

    return {
      word: random.word,
      associationWord: random.hint
    };
  }
}

export const aiService = new AIService();