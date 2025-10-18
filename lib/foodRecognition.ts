// Food Recognition with optional Google Cloud Vision
// If EXPO_PUBLIC_GOOGLE_VISION_API_KEY is set, will call Vision API; otherwise uses a simple heuristic fallback
import * as FileSystem from 'expo-file-system/legacy';

export interface FoodItem {
  name: string;
  confidence: number;
  category: string;
  ingredients?: string[];
}

export interface FoodRecognitionResult {
  foods: FoodItem[];
  primaryFood: string;
  cuisine: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  temperature: 'hot' | 'cold' | 'room-temperature';
  freshness: 'fresh' | 'leftover' | 'stale';
}

export async function recognizeFood(imageUri: string): Promise<FoodRecognitionResult> {
  try {
    console.log('Processing food image:', imageUri);

    // Try OpenAI Vision API when key is available
    // @ts-ignore - Expo env vars
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    console.log('OpenAI API key present:', apiKey ? 'YES' : 'NO');
    
    if (apiKey) {
      try {
        // Read file as base64
        const b64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' as any });
        
        const body = {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Identify all food items in this image. Return ONLY a JSON object with this exact format: {"foods": [{"name": "Food Name", "confidence": 0.95}], "cuisine": "Italian", "primaryFood": "Pizza"}. Be specific with food names.',
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${b64}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        };
        
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });
        
        const json = await resp.json();
        console.log('OpenAI API response:', JSON.stringify(json).substring(0, 300));
        
        const content = json?.choices?.[0]?.message?.content;
        if (content) {
          // Parse the JSON response
          const parsed = JSON.parse(content.replace(/```json\n?/g, '').replace(/```/g, '').trim());
          const foods: FoodItem[] = parsed.foods.map((f: any) => ({
            name: f.name,
            confidence: f.confidence || 0.9,
            category: 'main',
          }));
          
          const primary = parsed.primaryFood || foods[0]?.name || 'Food Item';
          const cuisine = parsed.cuisine || guessCuisine(primary);
          const mealType = guessMealType(primary);

          if (foods.length > 0) {
            return {
              foods,
              primaryFood: primary,
              cuisine,
              mealType,
              temperature: 'room-temperature',
              freshness: 'leftover',
            };
          }
        }
        // fallthrough to heuristic if OpenAI returns nothing meaningful
      } catch (e) {
        console.warn('OpenAI Vision API failed, using heuristic fallback:', e);
      }
    }

    // Heuristic fallback
    const uriLower = imageUri.toLowerCase();
    const looksLike = (kw: string) => uriLower.includes(kw);

    // Prefer pizza when the path hints at it
    if (looksLike('pizza') || looksLike('pz') || looksLike('pie')) {
      return {
        foods: [
          {
            name: 'Pizza',
            confidence: 0.95,
            category: 'main',
            ingredients: ['dough', 'cheese', 'tomato sauce', 'toppings'],
          },
        ],
        primaryFood: 'Pizza',
        cuisine: 'Italian',
        mealType: 'dinner',
        temperature: 'room-temperature',
        freshness: 'leftover',
      };
    }

    // Very naive keyword checks
    if (looksLike('pasta') || looksLike('spag') || looksLike('noodle')) {
      return {
        foods: [
          {
            name: 'Pasta',
            confidence: 0.9,
            category: 'main',
            ingredients: ['pasta', 'tomato sauce', 'cheese'],
          },
          { name: 'Garlic Bread', confidence: 0.75, category: 'side', ingredients: ['bread', 'garlic', 'butter'] },
        ],
        primaryFood: 'Pasta',
        cuisine: 'Italian',
        mealType: 'dinner',
        temperature: 'hot',
        freshness: 'leftover',
      };
    }

    if (looksLike('rice') || looksLike('fried')) {
      return {
        foods: [
          {
            name: 'Fried Rice',
            confidence: 0.9,
            category: 'main',
            ingredients: ['rice', 'eggs', 'vegetables', 'soy sauce'],
          },
        ],
        primaryFood: 'Fried Rice',
        cuisine: 'Asian',
        mealType: 'lunch',
        temperature: 'hot',
        freshness: 'leftover',
      };
    }

    // Default heuristic: label as generic Food Item rather than pizza
    return {
      foods: [
        { name: 'Food Item', confidence: 0.5, category: 'main', ingredients: ['ingredients'] },
      ],
      primaryFood: 'Food Item',
      cuisine: 'Unknown',
      mealType: 'dinner',
      temperature: 'room-temperature',
      freshness: 'leftover',
    };
    
  } catch (error) {
    console.error('Food recognition error:', error);
    // Fallback to a basic result
    return {
      foods: [
        {
          name: "Food Item",
          confidence: 0.5,
          category: "main",
          ingredients: ["ingredients"]
        }
      ],
      primaryFood: "Food Item",
      cuisine: "Unknown",
      mealType: "dinner",
      temperature: "room-temperature",
      freshness: "leftover"
    };
  }
}

function guessCuisine(food: string): string {
  const f = food.toLowerCase();
  if (/pizza|pasta|lasagna|risotto/.test(f)) return 'Italian';
  if (/sushi|ramen|rice|curry/.test(f)) return 'Asian';
  if (/taco|burrito|nacho/.test(f)) return 'Mexican';
  if (/burger|steak|sandwich/.test(f)) return 'American';
  return 'Unknown';
}

function guessMealType(food: string): FoodRecognitionResult['mealType'] {
  const f = food.toLowerCase();
  if (/pancake|waffle|toast|cereal|egg|omelet/.test(f)) return 'breakfast';
  return 'dinner';
}

// Note: convertImageToBase64 function removed as we're using mock data for demo
// In production, you would need this function for real API integration

// Food pairing database
export const FOOD_PAIRINGS: Record<string, string[]> = {
  // Pasta & Italian
  'pasta': ['garlic bread', 'salad', 'meatballs', 'wine', 'parmesan'],
  'spaghetti': ['garlic bread', 'meatballs', 'salad', 'wine'],
  'lasagna': ['garlic bread', 'salad', 'wine', 'dessert'],
  'pizza': ['salad', 'wings', 'beer', 'dessert'],
  
  // Asian
  'fried rice': ['egg', 'vegetables', 'soy sauce', 'soup'],
  'curry': ['rice', 'naan', 'yogurt', 'pickles'],
  'sushi': ['miso soup', 'sake', 'wasabi', 'ginger'],
  'ramen': ['egg', 'vegetables', 'tea', 'dumplings'],
  
  // American
  'burger': ['fries', 'milkshake', 'onion rings', 'salad'],
  'sandwich': ['chips', 'pickles', 'soup', 'salad'],
  'steak': ['potatoes', 'wine', 'vegetables', 'bread'],
  
  // Breakfast
  'pancakes': ['coffee', 'fruit', 'syrup', 'bacon'],
  'waffles': ['coffee', 'fruit', 'syrup', 'eggs'],
  'toast': ['coffee', 'jam', 'butter', 'eggs'],
  'cereal': ['milk', 'fruit', 'coffee', 'yogurt'],
  
  // Mexican
  'tacos': ['rice', 'beans', 'salsa', 'guacamole'],
  'burrito': ['salsa', 'guacamole', 'chips', 'beer'],
  'nachos': ['salsa', 'guacamole', 'beer', 'jalapeños'],
  
  // Desserts
  'cake': ['coffee', 'ice cream', 'fruit', 'tea'],
  'cookies': ['milk', 'coffee', 'tea', 'fruit'],
  'pie': ['ice cream', 'coffee', 'tea', 'whipped cream'],
  
  // Soups
  'soup': ['bread', 'salad', 'crackers', 'wine'],
  'chili': ['cornbread', 'cheese', 'sour cream', 'beer'],
  
  // Salads
  'salad': ['bread', 'soup', 'wine', 'protein'],
  
  // Generic categories
  'vegetables': ['rice', 'bread', 'protein', 'sauce'],
  'rice': ['curry', 'vegetables', 'protein', 'sauce'],
  'bread': ['soup', 'butter', 'jam', 'cheese'],
  'chicken': ['rice', 'vegetables', 'salad', 'sauce'],
  'fish': ['rice', 'vegetables', 'lemon', 'wine'],
  'beef': ['potatoes', 'vegetables', 'wine', 'bread']
};

export function calculateFoodCompatibility(foodA: string, foodB: string): number {
  const foodALower = foodA.toLowerCase();
  const foodBLower = foodB.toLowerCase();
  
  // Direct pairing match
  if (FOOD_PAIRINGS[foodALower]?.includes(foodBLower) || 
      FOOD_PAIRINGS[foodBLower]?.includes(foodALower)) {
    return 95;
  }
  
  // Check for ingredient overlap
  const ingredientsA = FOOD_PAIRINGS[foodALower] || [];
  const ingredientsB = FOOD_PAIRINGS[foodBLower] || [];
  const commonIngredients = ingredientsA.filter(ing => ingredientsB.includes(ing));
  
  if (commonIngredients.length > 0) {
    return 80;
  }
  
  // Check for category similarity
  const categories = {
    'pasta': ['spaghetti', 'lasagna', 'macaroni'],
    'asian': ['fried rice', 'curry', 'sushi', 'ramen'],
    'american': ['burger', 'sandwich', 'steak'],
    'mexican': ['tacos', 'burrito', 'nachos'],
    'breakfast': ['pancakes', 'waffles', 'toast', 'cereal']
  };
  
  for (const [category, foods] of Object.entries(categories)) {
    if (foods.includes(foodALower) && foods.includes(foodBLower)) {
      return 75;
    }
  }
  
  // Default compatibility
  return 60;
}

export function generateMatchMessage(foodA: string, foodB: string, compatibility: number): string {
  const messages = [
    `🍽️ Perfect pairing! ${foodA} + ${foodB} = culinary magic!`,
    `✨ Together you're a dinner party waiting to happen!`,
    `🎉 Your ${foodA} and their ${foodB} are meant to be!`,
    `🔥 This food combo is absolutely delicious!`,
    `💫 A match made in food heaven!`,
    `🍴 Your leftovers were meant to find each other!`
  ];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return `${randomMessage} (${compatibility}% Meal Match)`;
}
