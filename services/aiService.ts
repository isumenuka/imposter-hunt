import OpenAI from 'openai';

const FALLBACK_WORDS: Record<string, Array<{ word: string; clue: string }>> = {
  'Animals': [
    { word: 'Dog', clue: 'Two legs or four legs?' },
    { word: 'Cat', clue: 'Whiskers and nine lives' },
    { word: 'Lion', clue: 'Golden hue in savanna' },
    { word: 'Elephant', clue: 'Memory and water' },
    { word: 'Tiger', clue: 'Stripes in the jungle' }
  ],
  'Foods': [
    { word: 'Pizza', clue: 'Circular and molten' },
    { word: 'Burger', clue: 'Stack of layers' },
    { word: 'Pasta', clue: 'Twists and turns' },
    { word: 'Sushi', clue: 'Rolled in wrapper' },
    { word: 'Chocolate', clue: 'Sweet darkness' }
  ],
  'Brands': [
    { word: 'Apple', clue: 'Fruit from tree' },
    { word: 'Nike', clue: 'Just swoosh' },
    { word: 'McDonald\'s', clue: 'Golden arches shape' },
    { word: 'Coca-Cola', clue: 'Red fizzy liquid' },
    { word: 'Starbucks', clue: 'Siren in coffee' }
  ],
  'Objects': [
    { word: 'Phone', clue: 'Screen and buttons' },
    { word: 'Car', clue: 'Wheels and engine' },
    { word: 'Laptop', clue: 'Hinges and keyboard' },
    { word: 'Watch', clue: 'Ticking on wrist' },
    { word: 'Book', clue: 'Paper and binding' }
  ],
  'Anime': [
    { word: 'Naruto', clue: 'Spiral and seal' },
    { word: 'One Piece', clue: 'Sea and treasure map' },
    { word: 'Dragon Ball', clue: 'Spheres and power' },
    { word: 'Pokemon', clue: 'Pocket monsters catch' },
    { word: 'Attack on Titan', clue: 'Height and walls' }
  ],
  'Video Games': [
    { word: 'Fortnite', clue: 'Build or fight' },
    { word: 'Minecraft', clue: 'Cubes everywhere' },
    { word: 'GTA', clue: 'Grand and theft' },
    { word: 'FIFA', clue: 'Kick ball goal' },
    { word: 'Roblox', clue: 'Mini games platform' }
  ],
  'TV Shows': [
    { word: 'Friends', clue: 'Couch and coffee' },
    { word: 'Stranger Things', clue: 'Upside and down' },
    { word: 'Breaking Bad', clue: 'Chemistry and transformation' },
    { word: 'The Office', clue: 'Desk and mundane' },
    { word: 'Game of Thrones', clue: 'Iron throne battle' }
  ],
  'Celebrities': [
    { word: 'Messi', clue: 'Left foot magic' },
    { word: 'Ronaldo', clue: 'Jump and speed' },
    { word: 'Taylor Swift', clue: 'Red era music' },
    { word: 'The Rock', clue: 'Muscles and comedy' },
    { word: 'Beyonce', clue: 'Queen formation' }
  ],
  'Locations': [
    { word: 'Paris', clue: 'Tower and light' },
    { word: 'New York', clue: 'Big and bright' },
    { word: 'Tokyo', clue: 'Neon and crowds' },
    { word: 'London', clue: 'Clock and bridge' },
    { word: 'Dubai', clue: 'Desert and gold' }
  ],
  'Movies': [
    { word: 'Titanic', clue: 'Water and sinking' },
    { word: 'Avatar', clue: 'Blue and alien' },
    { word: 'Spider-Man', clue: 'Web and climb' },
    { word: 'Frozen', clue: 'Ice and sisters' },
    { word: 'Avengers', clue: 'Assemble together' }
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
2. Imposter clue MUST be SHORT (maximum 5-7 words)
3. Use simple, famous, mainstream things only

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

IMPOSTER CLUE (keep it SHORT and SIMPLE):
- "Battle royale shooter" (for Fortnite/PUBG)
- "Round food with cheese" (for Pizza)
- "Big ship that sank" (for Titanic)
- "Popular social media app" (for Instagram)
- "Big cat with mane" (for Lion)

Return ONLY valid JSON:
{
  "secretWord": "ONE popular word from ${category}",
  "imposterClue": "SHORT hint (5-7 words max)"
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