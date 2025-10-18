import PhotoUpload from '@/components/PhotoUpload';
import SwipeCard from '@/components/SwipeCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { calculateFoodCompatibility, generateMatchMessage, recognizeFood } from '@/lib/foodRecognition';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
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
  },
];

export default function DiscoverScreen() {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [userFood, setUserFood] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [hasUploadedPhoto, setHasUploadedPhoto] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const { userProfile } = useAuth();

  const currentUser = mockUsers[currentUserIndex];
  const hasMoreUsers = currentUserIndex < mockUsers.length - 1;

  const handlePhotoSelected = async (uri: string) => {
    setIsRecognizing(true);
    try {
      const result = await recognizeFood(uri);
      setUserFood(result.foods.map(f => f.name));
      setHasUploadedPhoto(true);
      
      // Calculate compatibility with current user
      if (currentUser) {
        const compatibility = calculateFoodCompatibility(
          result.primaryFood,
          currentUser.foodItems[0]
        );
        
        Alert.alert(
          'Food Recognized! 🎉',
          `We found: ${result.foods.map(f => f.name).join(', ')}\n\n${generateMatchMessage(result.primaryFood, currentUser.foodItems[0], compatibility)}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Recognition Failed', 'Could not identify the food. Please try again or enter manually.');
    } finally {
      setIsRecognizing(false);
    }
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
        'It\'s a Match! 💕',
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

  if (!hasUploadedPhoto) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🔍 Discover Matches
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Upload a photo of your leftovers to find your perfect food match!
          </ThemedText>
        </View>

        <PhotoUpload
          onPhotoSelected={handlePhotoSelected}
          onRecognitionComplete={() => {}}
          loading={isRecognizing}
        />

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
      </ThemedView>
    );
  }

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

      {currentUser ? (
        <View style={styles.swipeContainer}>
          <SwipeCard
            user={currentUser}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPass={handlePass}
            onLike={handleLike}
          />
        </View>
      ) : (
        <View style={styles.noMoreContainer}>
          <ThemedText type="title" style={styles.noMoreTitle}>
            🎉 All Done!
          </ThemedText>
          <ThemedText style={styles.noMoreText}>
            You've seen all available matches. Check back later for new people!
          </ThemedText>
          <TouchableOpacity style={styles.resetButton} onPress={resetDiscovery}>
            <Text style={styles.resetButtonText}>🔄 Start Over</Text>
          </TouchableOpacity>
        </View>
      )}

      {matches.length > 0 && (
        <View style={styles.matchesContainer}>
          <ThemedText type="subtitle" style={styles.matchesTitle}>
            💕 Your Matches ({matches.length})
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {matches.map((match) => (
              <TouchableOpacity key={match.id} style={styles.matchCard}>
                <Image source={{ uri: match.foodPhoto }} style={styles.matchPhoto} />
                <ThemedText style={styles.matchName}>{match.name}</ThemedText>
                <ThemedText style={styles.matchFood}>{match.foodItems[0]}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
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
