import OpenAI from 'openai';

const FALLBACK_WORDS: Record<string, Array<{ word: string; clue: string }>> = {
  'Animals': [
    { word: 'Dog', clue: 'Bone' },
    { word: 'Cat', clue: 'Whiskers' },
    { word: 'Lion', clue: 'King' },
    { word: 'Elephant', clue: 'Memory' },
    { word: 'Tiger', clue: 'Stripes' }
  ],
  'Foods': [
    { word: 'Pizza', clue: 'Friday' },
    { word: 'Burger', clue: 'King' },
    { word: 'Pasta', clue: 'Italy' },
    { word: 'Sushi', clue: 'Roll' },
    { word: 'Chocolate', clue: 'Sweet' }
  ],
  'Brands': [
    { word: 'Apple', clue: 'Bite' },
    { word: 'Nike', clue: 'Wings' },
    { word: 'McDonald\'s', clue: 'Golden' },
    { word: 'Coca-Cola', clue: 'Red' },
    { word: 'Starbucks', clue: 'Green' }
  ],
  'Objects': [
    { word: 'Phone', clue: 'Ring' },
    { word: 'Car', clue: 'Drive' },
    { word: 'Laptop', clue: 'Portable' },
    { word: 'Watch', clue: 'Time' },
    { word: 'Book', clue: 'Pages' }
  ],
  'Anime': [
    { word: 'Naruto', clue: 'Ninja' },
    { word: 'One Piece', clue: 'Treasure' },
    { word: 'Dragon Ball', clue: 'Power' },
    { word: 'Pokemon', clue: 'Catch' },
    { word: 'Attack on Titan', clue: 'Giant' }
  ],
  'Video Games': [
    { word: 'Fortnite', clue: 'Battle' },
    { word: 'Minecraft', clue: 'Block' },
    { word: 'GTA', clue: 'City' },
    { word: 'FIFA', clue: 'Goal' },
    { word: 'Roblox', clue: 'Create' }
  ],
  'TV Shows': [
    { word: 'Friends', clue: 'Coffee' },
    { word: 'Stranger Things', clue: 'Eleven' },
    { word: 'Breaking Bad', clue: 'Blue' },
    { word: 'The Office', clue: 'Paper' },
    { word: 'Game of Thrones', clue: 'Winter' }
  ],
  'Celebrities': [
    { word: 'Messi', clue: 'Argentina' },
    { word: 'Ronaldo', clue: 'Number' },
    { word: 'Taylor Swift', clue: 'Red' },
    { word: 'The Rock', clue: 'Stone' },
    { word: 'Beyonce', clue: 'Queen' }
  ],
  'Locations': [
    { word: 'Paris', clue: 'Tower' },
    { word: 'New York', clue: 'Apple' },
    { word: 'Tokyo', clue: 'Neon' },
    { word: 'London', clue: 'Bridge' },
    { word: 'Dubai', clue: 'Gold' }
  ],
  'Movies': [
    { word: 'Titanic', clue: 'Ship' },
    { word: 'Avatar', clue: 'Blue' },
    { word: 'Spider-Man', clue: 'Web' },
    { word: 'Frozen', clue: 'Ice' },
    { word: 'Avengers', clue: 'Assemble' }
  ]
};

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: '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',
      baseURL: 'https://openrouter.ai/api/v1',
      dangerouslyAllowBrowser: true
    });
  }

  private getFallbackContent(category: string): { word: string; clue: string } {
    const categoryWords = FALLBACK_WORDS[category];
    if (!categoryWords || categoryWords.length === 0) {
      const allWords = Object.values(FALLBACK_WORDS).flat();
      return allWords[Math.floor(Math.random() * allWords.length)];
    }
    return categoryWords[Math.floor(Math.random() * categoryWords.length)];
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateGameContent(category: string): Promise<{ word: string, clue: string }> {
    const prompt = `You are generating content for a social deduction party game called "Imposter Hunt".

CRITICAL RULES:
1. Secret word MUST be EXTREMELY POPULAR and EVERYONE knows it
2. Association word MUST be a SINGLE WORD that is deliberately AMBIGUOUS without knowing the category
3. The association word should relate to the secret word but could also fit OTHER categories
4. Use simple, famous, mainstream things only

SECRET WORD for category "${category}":

- Video Games: PUBG, Fortnite, Minecraft, GTA, FIFA, COD, Roblox, Pokemon GO
- Movies: Titanic, Avatar, Harry Potter, Spider-Man, Avengers, Frozen, Joker
- TV Shows: Friends, Game of Thrones, Stranger Things, Breaking Bad, The Office
- Foods: Pizza, Burger, Pasta, Rice, Chicken, Sushi, Chocolate, Ice Cream
- Brands: Apple, Nike, Coca-Cola, McDonald's, Samsung, Adidas, Starbucks
- Objects: Phone, Car, Chair, Book, Laptop, Watch, Shoes, Bag
- Anime: Naruto, One Piece, Dragon Ball, Attack on Titan, Pokemon, Demon Slayer
- Celebrities: Messi, Ronaldo, Taylor Swift, Elon Musk, Beyonce, The Rock
- Locations: Paris, New York, Tokyo, London, Dubai, Egypt, Australia
- Animals: Dog, Cat, Lion, Elephant, Tiger, Dolphin, Eagle, Snake

ASSOCIATION WORD EXAMPLES (deliberately ambiguous single words):
- "Friday" for Pizza (could be day of week OR pizza night)
- "King" for Lion (could be royalty OR Lion King)
- "Ring" for Phone (could be jewelry OR phone ringing)
- "Battle" for Fortnite (could be war/combat OR battle royale)
- "Tower" for Paris (could be tall structure OR Eiffel Tower)
- "Blue" for Avatar (could be color OR blue aliens)
- "Bite" for Apple (could be eating OR Apple logo)
- "Ice" for Frozen (could be cold water OR Disney movie)

Return ONLY valid JSON:
{
  "secretWord": "ONE popular word from ${category}",
  "imposterClue": "ONE ambiguous word"
}`;

    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          console.log(`Retry attempt ${attempt} after ${delayMs}ms delay...`);
          await this.delay(delayMs);
        }

        const response = await this.openai.chat.completions.create({
          model: 'meta-llama/llama-3.2-3b-instruct:free',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7
        });

        const text = response.choices[0]?.message?.content || '';
        console.log("OpenRouter Response:", text);

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const json = JSON.parse(jsonMatch[0]);

        if (!json.secretWord || !json.imposterClue) {
          throw new Error("Invalid response format");
        }

        return {
          word: json.secretWord,
          clue: json.imposterClue
        };
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt + 1} failed:`, error.message || error);

        if (error?.status === 429 && attempt < maxRetries) {
          continue;
        }

        if (attempt === maxRetries) {
          break;
        }
      }
    }

    console.log('AI generation failed, using fallback content');
    return this.getFallbackContent(category);
  }
}

export const aiService = new AIService();