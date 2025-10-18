import PhotoUpload from '@/components/PhotoUpload';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { calculateFoodCompatibility, recognizeFood } from '@/lib/foodRecognition';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Mock data for potential matches
const mockUsers = [
  {
    id: '1',
    name: 'PizzaLover23',
    bio: 'Always have half a pizza in the fridge 🍕',
    foodPhoto: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    foodItems: ['Pizza Margherita', 'Garlic Bread'],
    distance: 2.3,
    age: 28,
    foodPreferences: ['Vegetarian', 'Anything-goes'],
    leftoverVibe: 'Always have pizza',
    matchGoal: 'Looking to share leftovers',
    compatibility: 92,
    location: { latitude: 40.7128, longitude: -74.0060 }, // NYC
  },
  {
    id: '2',
    name: 'ChefSarah',
    bio: 'Meal prep enthusiast who always cooks too much pasta 🍝',
    foodPhoto: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    foodItems: ['Spaghetti Carbonara', 'Caesar Salad'],
    distance: 1.8,
    age: 31,
    foodPreferences: ['Vegan', 'Gluten-Free'],
    leftoverVibe: 'Meal prep enthusiast',
    matchGoal: 'Cooking collab',
    compatibility: 88,
    location: { latitude: 40.7138, longitude: -74.0050 }, // NYC nearby
  },
  {
    id: '3',
    name: 'BrunchKing',
    bio: 'Serial bruncher with leftover avocado toast 🥑',
    foodPhoto: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
    foodItems: ['Avocado Toast', 'Fresh Fruit'],
    distance: 3.1,
    age: 26,
    foodPreferences: ['Vegetarian', 'Halal'],
    leftoverVibe: 'Serial bruncher',
    matchGoal: 'Date night material',
    compatibility: 85,
    location: { latitude: 40.7306, longitude: -73.9352 }, // Brooklyn
  },
  {
    id: '4',
    name: 'CurryMaster',
    bio: 'Leftover curry that gets better with time 🍛',
    foodPhoto: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    foodItems: ['Chicken Curry', 'Basmati Rice'],
    distance: 4.2,
    age: 29,
    foodPreferences: ['Anything-goes'],
    leftoverVibe: 'Leftover wizard',
    matchGoal: 'Sustainable food buddy',
    compatibility: 78,
    location: { latitude: 40.7580, longitude: -73.9855 }, // Midtown
  },
  {
    id: '5',
    name: 'SushiQueen',
    bio: 'Always has sushi rolls and miso soup in the fridge 🍣',
    foodPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    foodItems: ['Sushi Rolls', 'Miso Soup'],
    distance: 7.5,
    age: 34,
    foodPreferences: ['Pescatarian', 'Gluten-Free'],
    leftoverVibe: 'Creative cook',
    matchGoal: 'Cooking collab',
    compatibility: 80,
    location: { latitude: 40.6782, longitude: -73.9442 }, // Brooklyn
  },
  {
    id: '6',
    name: 'TacoGuy',
    bio: 'Taco Tuesday every day 🌮',
    foodPhoto: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400',
    foodItems: ['Tacos', 'Guacamole'],
    distance: 12.0,
    age: 24,
    foodPreferences: ['Anything-goes'],
    leftoverVibe: 'Fridge forager',
    matchGoal: 'Looking to share leftovers',
    compatibility: 70,
    location: { latitude: 40.6500, longitude: -73.9496 }, // Brooklyn farther
  },
  {
    id: '7',
    name: 'SaladStar',
    bio: 'Always prepping fresh salads 🥗',
    foodPhoto: 'https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=400',
    foodItems: ['Caesar Salad', 'Quinoa Bowl'],
    distance: 0.8,
    age: 27,
    foodPreferences: ['Vegan', 'Gluten-Free'],
    leftoverVibe: 'Meal prep enthusiast',
    matchGoal: 'Sustainable food buddy',
    compatibility: 90,
    location: { latitude: 40.7150, longitude: -74.0020 }, // Very close
  },
];

export default function DiscoverScreen() {
  // Move newFood state to top level to avoid conditional hook calls
  const [newFood, setNewFood] = useState('');
  // Helper: Score profile alignment
  function scoreProfileAlignment(
    userProfile: {
      foodPreferences?: string[];
      matchGoal?: string;
      leftoverVibe?: string;
      age?: number;
    } | null,
    candidate: {
      foodPreferences?: string[];
      matchGoal?: string;
      leftoverVibe?: string;
      age?: number;
    }
  ): number {
    let score = 0;
    if (!userProfile) return score;
    // Food preferences overlap
    if (userProfile.foodPreferences && candidate.foodPreferences) {
      const overlap = candidate.foodPreferences
        ? userProfile.foodPreferences.filter((p: string) => candidate.foodPreferences!.includes(p))
        : [];
      score += overlap.length * 10;
    }
    // Match goal
    if (userProfile.matchGoal && candidate.matchGoal && userProfile.matchGoal === candidate.matchGoal) {
      score += 15;
    }
    // Leftover vibe
    if (userProfile.leftoverVibe && candidate.leftoverVibe && userProfile.leftoverVibe === candidate.leftoverVibe) {
      score += 10;
    }
    // Age proximity (within 5 years)
    if (userProfile.age && candidate.age && Math.abs(userProfile.age - candidate.age) <= 5) {
      score += 5;
    }
    return score;
  }

  // Helper: Score location proximity
  function scoreLocation(distance: number): number {
    if (distance < 1) return 20;
    if (distance < 3) return 15;
    if (distance < 10) return 10;
    return 0;
  }

  // ...existing code...
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [photoUris, setPhotoUris] = useState<string[]>([]); // up to 5
  const [userFood, setUserFood] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [allDetectedFoods, setAllDetectedFoods] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [sortedMatches, setSortedMatches] = useState<any[]>([]);
  const { userProfile } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  const currentUser = mockUsers[currentUserIndex];
  const hasMoreUsers = currentUserIndex < mockUsers.length - 1;

  // Listen for rankedFoods param from /rank-food
  useEffect(() => {
    if (params.rankedFoods) {
      try {
        const foods = JSON.parse(params.rankedFoods as string);
        if (Array.isArray(foods) && foods.length > 0) {
          setUserFood(foods);
          setHasUploadedPhoto(true);

          // Run matching algorithm
          const results = mockUsers.map(user => {
            // Food compatibility: compare each ranked food to user's foodItems
            let foodScore = 0;
            for (let i = 0; i < foods.length; i++) {
              for (let j = 0; j < user.foodItems.length; j++) {
                foodScore = Math.max(foodScore, calculateFoodCompatibility(foods[i], user.foodItems[j]));
              }
            }
            // Profile alignment
            const profileScore = scoreProfileAlignment(userProfile, user);
            // Location proximity
            const locationScore = scoreLocation(user.distance);
            // Total score
            const totalScore = foodScore + profileScore + locationScore;
            return { ...user, matchScore: totalScore };
          });
          // Sort by matchScore descending
          results.sort((a, b) => b.matchScore - a.matchScore);
          setSortedMatches(results);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [params.rankedFoods, userProfile]);

  const handlePhotoSelected = useCallback((uri: string) => {
    if (photoUris.length >= 5) {
      Alert.alert('Maximum Limit Reached', 'You can only add up to 5 photos. Please remove a photo to add a new one.');
      return;
    }
    setPhotoUris(prev => [...prev, uri]);
  }, [photoUris]);

  const handleRemovePhoto = (index: number) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextPhotos = async () => {
    setIsRecognizing(true);
    try {
      // Run recognition on all photos
      const allFoods: string[] = [];
      for (const uri of photoUris) {
        const result = await recognizeFood(uri);
        result.foods.forEach(f => {
          if (!allFoods.includes(f.name)) allFoods.push(f.name);
        });
      }
      setAllDetectedFoods(allFoods);
      setReviewMode(true);
    } catch (error) {
      Alert.alert('Recognition Failed', 'Could not identify the food. Please try again or enter manually.');
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleAddFood = (food: string) => {
    if (food && !allDetectedFoods.includes(food)) {
      setAllDetectedFoods(prev => [...prev, food]);
    }
  };

  const handleRemoveFood = (index: number) => {
    setAllDetectedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const handleReviewNext = () => {
    // Navigate to ranking screen with detected foods
    router.push({
      pathname: '/rank-food' as any,
      params: { foods: JSON.stringify(allDetectedFoods) }
    });
  };


  const handleSwipeLeft = () => {
    if (hasMoreUsers) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      Alert.alert('No More Matches', 'You\'ve seen all available matches! Check back later for new people.');
    }
  };

  const handleSwipeRight = () => {
    if (currentUser) {
      setMatches(prev => [...prev, currentUser]);
      Alert.alert(
        'It\'s a Match! \uD83D\uDC95',
        `You and ${currentUser.name} are a perfect food match! Your ${userFood[0] || 'leftovers'} and their ${currentUser.foodItems[0]} would make an amazing meal together!`,
        [
          { text: 'Start Chatting', onPress: () => {/* Navigate to chat */} },
          { text: 'Keep Swiping', onPress: handleSwipeLeft }
        ]
      );
    }
    handleSwipeLeft();
  };

  const handlePass = () => {
    handleSwipeLeft();
  };

  const handleLike = () => {
    handleSwipeRight();
  };

  const resetDiscovery = () => {
    setCurrentUserIndex(0);
    setUserFood([]);
    setHasUploadedPhoto(false);
    setMatches([]);
  };

  if (!hasUploadedPhoto && !reviewMode) {
    // Photo upload step (up to 5)
    return (
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
          style={{ paddingHorizontal: 0 }} // Remove horizontal padding
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              🔍 Discover Matches
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Add up to 5 photos of your leftovers. Tap Next when done.
            </ThemedText>
          </View>

          <PhotoUpload
            onPhotoSelected={handlePhotoSelected}
            onRecognitionComplete={() => {}}
            loading={isRecognizing}
          />

          {photoUris.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 16 }}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
            >
              {photoUris.map((uri, idx) => (
                <View key={uri} style={{ position: 'relative' }}>
                  <Image source={{ uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                  <TouchableOpacity
                    style={{ position: 'absolute', top: -8, right: -8, backgroundColor: '#FF6B6B', borderRadius: 12, padding: 4, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => handleRemovePhoto(idx)}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            style={[styles.resetButton, { marginBottom: 12, backgroundColor: '#4ECDC4' }]}
            onPress={handleNextPhotos}
            disabled={photoUris.length === 0 || isRecognizing}
          >
            <Text style={styles.resetButtonText}>Next</Text>
          </TouchableOpacity>

          <View style={styles.tipsContainer}>
            <ThemedText type="subtitle" style={styles.tipsTitle}>
              💡 Tips for Better Matches
            </ThemedText>
            <ThemedText style={styles.tip}>
              • Take clear, well-lit photos of your food
            </ThemedText>
            <ThemedText style={styles.tip}>
              • Include multiple food items in one photo
            </ThemedText>
            <ThemedText style={styles.tip}>
              • Make sure the food is clearly visible
            </ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Review detected foods step
  if (reviewMode) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🍽️ Review Detected Foods
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Add or remove food items before continuing.
          </ThemedText>
        </View>
        <View style={{ marginBottom: 16 }}>
          {allDetectedFoods.map((food, idx) => (
            <View key={food} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 16 }}>{food}</Text>
              <TouchableOpacity onPress={() => handleRemoveFood(idx)} style={{ marginLeft: 8 }}>
                <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, flex: 1, marginRight: 8 }}
            value={newFood}
            onChangeText={setNewFood}
            placeholder="Add food item"
          />
          <TouchableOpacity
            style={{ backgroundColor: '#4ECDC4', padding: 10, borderRadius: 8 }}
            onPress={() => { handleAddFood(newFood); setNewFood(''); }}
            disabled={!newFood.trim()}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Add</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: '#FF6B6B' }]}
          onPress={handleReviewNext}
          disabled={allDetectedFoods.length === 0}
        >
          <Text style={styles.resetButtonText}>Next</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Show sorted matches after ranking
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          🍽️ Your Food: {userFood.join(', ')}
        </ThemedText>
        <TouchableOpacity style={styles.resetButton} onPress={resetDiscovery}>
          <Text style={styles.resetButtonText}>🔄 Upload New Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.matchesContainer}>
        <ThemedText type="subtitle" style={styles.matchesTitle}>
          � Top Matches ({sortedMatches.length})
        </ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sortedMatches.map((match) => (
            <TouchableOpacity key={match.id} style={styles.matchCard}>
              <Image source={{ uri: match.foodPhoto }} style={styles.matchPhoto} />
              <ThemedText style={styles.matchName}>{match.name}</ThemedText>
              <ThemedText style={styles.matchFood}>{match.foodItems[0]}</ThemedText>
              <ThemedText style={{ fontSize: 12, color: '#FF6B6B', fontWeight: 'bold' }}>
                Score: {match.matchScore}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                {match.distance}km away
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40, // Add top margin to prevent header from being pushed out
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
  },
  tipsContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tip: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.8,
  },
  swipeContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  noMoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noMoreTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  noMoreText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 22,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  matchesContainer: {
    marginTop: 20,
  },
  matchesTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  matchCard: {
    width: 120,
    marginRight: 12,
    alignItems: 'center',
  },
  matchPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  matchName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  matchFood: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});
