// Food Recognition - Fallback implementation
// Note: For production, you would need a valid Google Gemini API key
// This implementation provides a fallback for demo purposes

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
    // For demo purposes, we'll simulate food recognition
    // In production, you would integrate with a real food recognition API
    console.log('Processing food image:', imageUri);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return a mock result for demo purposes
    // In production, this would be replaced with actual AI recognition
    const mockResults = [
      {
        foods: [
          {
            name: "Pasta",
            confidence: 0.85,
            category: "main",
            ingredients: ["pasta", "tomato sauce", "cheese"]
          },
          {
            name: "Garlic Bread",
            confidence: 0.75,
            category: "side",
            ingredients: ["bread", "garlic", "butter"]
          }
        ],
        primaryFood: "Pasta",
        cuisine: "Italian",
        mealType: "dinner" as const,
        temperature: "hot" as const,
        freshness: "leftover" as const
      },
      {
        foods: [
          {
            name: "Fried Rice",
            confidence: 0.90,
            category: "main",
            ingredients: ["rice", "eggs", "vegetables", "soy sauce"]
          }
        ],
        primaryFood: "Fried Rice",
        cuisine: "Asian",
        mealType: "lunch" as const,
        temperature: "hot" as const,
        freshness: "leftover" as const
      },
      {
        foods: [
          {
            name: "Pizza",
            confidence: 0.88,
            category: "main",
            ingredients: ["dough", "cheese", "tomato sauce", "toppings"]
          }
        ],
        primaryFood: "Pizza",
        cuisine: "Italian",
        mealType: "dinner" as const,
        temperature: "room-temperature" as const,
        freshness: "leftover" as const
      }
    ];
    
    // Select a random mock result
    const mockResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    return mockResult;
    
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
