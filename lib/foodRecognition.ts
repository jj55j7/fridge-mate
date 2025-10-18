// Food Recognition using Google Gemini API
const GEMINI_API_KEY = 'AIzaSyAUM6zS7kDwqhxOix6_G_4aYvERa0RGLys';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);
    
    const requestBody = {
      contents: [{
        parts: [{
          text: `Analyze this food image and identify:
1. All visible food items with confidence scores
2. The primary/main food item
3. Cuisine type (Italian, Asian, Mexican, etc.)
4. Meal type (breakfast, lunch, dinner, snack, dessert)
5. Temperature (hot, cold, room-temperature)
6. Freshness (fresh, leftover, stale)
7. Key ingredients for each food item

Respond in JSON format with this structure:
{
  "foods": [
    {
      "name": "food name",
      "confidence": 0.95,
      "category": "main/side/dessert",
      "ingredients": ["ingredient1", "ingredient2"]
    }
  ],
  "primaryFood": "main food item",
  "cuisine": "cuisine type",
  "mealType": "breakfast/lunch/dinner/snack/dessert",
  "temperature": "hot/cold/room-temperature",
  "freshness": "fresh/leftover/stale"
}`
        }, {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        }]
      }]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      throw new Error('No content received from API');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return result as FoodRecognitionResult;
    
  } catch (error) {
    console.error('Food recognition error:', error);
    // Fallback to manual input
    throw new Error('Failed to recognize food. Please try again or enter manually.');
  }
}

async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error('Failed to process image');
  }
}

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
