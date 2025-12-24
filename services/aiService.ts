import OpenAI from 'openai';

const FALLBACK_WORDS: Record<string, Array<{ word: string; associationWord: string }>> = {
  'Animals': [
    { word: 'Dog', associationWord: 'Bark' },
    { word: 'Cat', associationWord: 'Purr' },
    { word: 'Lion', associationWord: 'King' },
    { word: 'Elephant', associationWord: 'Trunk' },
    { word: 'Tiger', associationWord: 'Stripes' }
  ],
  'Foods': [
    { word: 'Pizza', associationWord: 'Friday' },
    { word: 'Burger', associationWord: 'Patty' },
    { word: 'Pasta', associationWord: 'Italy' },
    { word: 'Sushi', associationWord: 'Roll' },
    { word: 'Chocolate', associationWord: 'Bar' }
  ],
  'Brands': [
    { word: 'Apple', associationWord: 'Bite' },
    { word: 'Nike', associationWord: 'Swoosh' },
    { word: 'McDonald\'s', associationWord: 'Golden' },
    { word: 'Coca-Cola', associationWord: 'Red' },
    { word: 'Starbucks', associationWord: 'Siren' }
  ],
  'Objects': [
    { word: 'Phone', associationWord: 'Ring' },
    { word: 'Car', associationWord: 'Drive' },
    { word: 'Laptop', associationWord: 'Keyboard' },
    { word: 'Watch', associationWord: 'Time' },
    { word: 'Book', associationWord: 'Page' }
  ],
  'Anime': [
    { word: 'Naruto', associationWord: 'Ramen' },
    { word: 'One Piece', associationWord: 'Treasure' },
    { word: 'Dragon Ball', associationWord: 'Sphere' },
    { word: 'Pokemon', associationWord: 'Catch' },
    { word: 'Attack on Titan', associationWord: 'Wall' }
  ],
  'Video Games': [
    { word: 'Fortnite', associationWord: 'Storm' },
    { word: 'Minecraft', associationWord: 'Block' },
    { word: 'GTA', associationWord: 'City' },
    { word: 'FIFA', associationWord: 'Goal' },
    { word: 'Roblox', associationWord: 'Build' }
  ],
  'TV Shows': [
    { word: 'Friends', associationWord: 'Central' },
    { word: 'Stranger Things', associationWord: 'Eleven' },
    { word: 'Breaking Bad', associationWord: 'Chemistry' },
    { word: 'The Office', associationWord: 'Paper' },
    { word: 'Game of Thrones', associationWord: 'Winter' }
  ],
  'Celebrities': [
    { word: 'Messi', associationWord: 'Barcelona' },
    { word: 'Ronaldo', associationWord: 'Seven' },
    { word: 'Taylor Swift', associationWord: 'Thirteen' },
    { word: 'The Rock', associationWord: 'Eyebrow' },
    { word: 'Beyonce', associationWord: 'Queen' }
  ],
  'Locations': [
    { word: 'Paris', associationWord: 'Eiffel' },
    { word: 'New York', associationWord: 'Apple' },
    { word: 'Tokyo', associationWord: 'Rising' },
    { word: 'London', associationWord: 'Big' },
    { word: 'Dubai', associationWord: 'Gold' }
  ],
  'Movies': [
    { word: 'Titanic', associationWord: 'Iceberg' },
    { word: 'Avatar', associationWord: 'Blue' },
    { word: 'Spider-Man', associationWord: 'Web' },
    { word: 'Frozen', associationWord: 'Ice' },
    { word: 'Avengers', associationWord: 'Assemble' }
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

  private getFallbackContent(category: string): { word: string; associationWord: string } {
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

  async generateGameContent(category: string): Promise<{ word: string, associationWord: string }> {
    const prompt = `You are generating content for a social deception party game called "Imposter Hunt".

CRITICAL RULES:
1. Secret word MUST be EXTREMELY POPULAR and EVERYONE knows it
2. Association word MUST be a SINGLE WORD (or max 2 words) that is AMBIGUOUS
3. Association word should NOT reveal the secret word or category
4. Association word should be conceptually related but require context to understand

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

ASSOCIATION WORD (single ambiguous word):
- Pizza → "Friday" (could be day of week OR TGI Friday's)
- Lion → "King" (could be royalty OR animal)
- Fortnite → "Storm" (could be weather OR game mechanic)
- Messi → "Barcelona" (could be city OR team)
- Paris → "Tower" (could be any tower)

Return ONLY valid JSON:
{
  "secretWord": "ONE popular word from ${category}",
  "associationWord": "SINGLE ambiguous word (1-2 words max)"
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

        if (!json.secretWord || !json.associationWord) {
          throw new Error("Invalid response format");
        }

        return {
          word: json.secretWord,
          associationWord: json.associationWord
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