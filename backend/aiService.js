import OpenAI from 'openai';

// Fallback words in case AI fails
const FALLBACK_WORDS = {
  Animals: [
    { word: 'Elephant', association: 'Jungle' },
    { word: 'Penguin', association: 'Cold' },
    { word: 'Dolphin', association: 'Ocean' },
    { word: 'Eagle', association: 'Sky' }
  ],
  Food: [
    { word: 'Pizza', association: 'Italian' },
    { word: 'Sushi', association: 'Japanese' },
    { word: 'Burger', association: 'American' },
    { word: 'Pasta', association: 'Noodles' }
  ],
  Sports: [
    { word: 'Basketball', association: 'Court' },
    { word: 'Soccer', association: 'Field' },
    { word: 'Tennis', association: 'Racket' },
    { word: 'Swimming', association: 'Water' }
  ],
  Technology: [
    { word: 'Smartphone', association: 'Screen' },
    { word: 'Laptop', association: 'Computer' },
    { word: 'Camera', association: 'Photos' },
    { word: 'Headphones', association: 'Audio' }
  ],
  Everything: [
    { word: 'Rainbow', association: 'Colors' },
    { word: 'Mountain', association: 'Peak' },
    { word: 'Ocean', association: 'Waves' },
    { word: 'Forest', association: 'Trees' },
    { word: 'Library', association: 'Books' },
    { word: 'Museum', association: 'Art' }
  ]
};

class AIService {
  constructor() {
    this.openai = null;
    
    // Initialize OpenAI only if API key is provided
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      console.log('✅ OpenAI API initialized');
    } else {
      console.warn('⚠️  No OpenAI API key found, using fallback words only');
    }
  }

  /**
   * Generate a word and association word for the given category
   * @param {string} category - Game category (Animals, Food, Sports, etc.)
   * @returns {Promise<{word: string, associationWord: string}>}
   */
  async generateGameContent(category) {
    // Try OpenAI first if available
    if (this.openai) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates words for a social deduction game. Generate a specific word from the given category and an ambiguous association word that relates to it but could apply to multiple things in that category.'
            },
            {
              role: 'user',
              content: `Generate a word for category: "${category}". Also generate an ambiguous association word that gives a subtle hint but doesn't directly reveal the word. Return ONLY in this exact JSON format: {"word": "YourWord", "associationWord": "YourAssociation"}`
            }
          ],
          temperature: 0.9,
          max_tokens: 100
        });

        const content = response.choices[0].message.content.trim();
        const parsed = JSON.parse(content);
        
        if (parsed.word && parsed.associationWord) {
          console.log(`✅ AI generated: ${parsed.word} (${parsed.associationWord})`);
          return parsed;
        }
      } catch (error) {
        console.error('❌ OpenAI API error:', error.message);
        // Fall through to fallback
      }
    }

    // Use fallback words
    return this.getFallbackWord(category);
  }

  /**
   * Get a random fallback word from the category
   * @param {string} category 
   * @returns {{word: string, associationWord: string}}
   */
  getFallbackWord(category) {
    const categoryWords = FALLBACK_WORDS[category] || FALLBACK_WORDS.Everything;
    const randomIndex = Math.floor(Math.random() * categoryWords.length);
    const selected = categoryWords[randomIndex];
    
    console.log(`📋 Using fallback: ${selected.word} (${selected.association})`);
    
    return {
      word: selected.word,
      associationWord: selected.association
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
