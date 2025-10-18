import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MapViewComponent from '@/components/MapView';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatDistance, getCurrentLocation } from '@/lib/location';

// Mock data for potential matches
const mockMatches = [
  {
    id: '1',
    name: 'PizzaLover23',
    bio: 'Always have half a pizza in the fridge',
    leftoverVibe: 'Always have pizza',
    matchGoal: 'Looking to share leftovers',
    foodPreferences: ['Vegetarian', 'Anything-goes'],
    foodItems: ['Pizza Margherita', 'Garlic Bread'],
    foodPhoto: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    compatibility: 85,
  },
  {
    id: '2',
    name: 'ChefSarah',
    bio: 'Meal prep enthusiast who always cooks too much pasta',
    leftoverVibe: 'Meal prep enthusiast',
    matchGoal: 'Cooking collab',
    foodPreferences: ['Vegan', 'Gluten-Free'],
    foodItems: ['Spaghetti Carbonara', 'Caesar Salad'],
    foodPhoto: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
    compatibility: 92,
  },
  {
    id: '3',
    name: 'BrunchKing',
    bio: 'Serial bruncher with leftover avocado toast',
    leftoverVibe: 'Serial bruncher',
    matchGoal: 'Date night material',
    foodPreferences: ['Vegetarian', 'Halal'],
    foodItems: ['Avocado Toast', 'Fresh Fruit'],
    foodPhoto: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400',
    compatibility: 78,
  },
];

export default function ExploreScreen() {
  const [showMap, setShowMap] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadNearbyUsers();
  }, []);

  const loadNearbyUsers = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Mock nearby users with locations
      const mockUsersWithLocation = mockMatches.map((match, index) => ({
        ...match,
        location: {
          latitude: location.latitude + (Math.random() - 0.5) * 0.01,
          longitude: location.longitude + (Math.random() - 0.5) * 0.01,
        },
        distance: Math.random() * 5, // 0-5km
        lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        // Ensure all required properties are present
        foodItems: match.foodItems || ['Unknown food'],
        foodPhoto: match.foodPhoto || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
      }));
      
      setNearbyUsers(mockUsersWithLocation);
    } catch (error) {
      Alert.alert('Location Error', 'Could not load nearby users');
    }
  };

  const handleUserSelect = (user: any) => {
    const foodItems = user.foodItems || ['Unknown food'];
    
    Alert.alert(
      `Match with ${user.name}!`,
      `You and ${user.name} are a perfect food match!\n\n` +
      `Distance: ${formatDistance(user.distance)}\n` +
      `Their food: ${foodItems.join(', ')}\n\n` +
      `Perfect for sharing leftovers together!`,
      [
        { 
          text: 'Start Chatting', 
          onPress: () => {
            console.log('Start Chatting pressed');
            try {
              // Navigate to chat tab
              router.navigate('/(tabs)/chat' as any);
              console.log('Navigation attempted to chat');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', 'Could not navigate to chat. Please try again.');
            }
          }
        },
        { 
          text: 'View Profile', 
          onPress: () => {
            console.log('View Profile pressed');
            // Show user profile modal
            showUserProfile(user);
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showUserProfile = (user: any) => {
    console.log('showUserProfile called with user:', user.name);
    const foodItems = user.foodItems || ['Unknown food'];
    
    const lastActiveStr = user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Unknown';

    Alert.alert(
      `${user.name}'s Profile`,
      `Bio: "${user.bio}"\n\n` +
      `Food Vibe: ${user.leftoverVibe}\n` +
      `Looking for: ${user.matchGoal}\n` +
      `Dietary: ${user.foodPreferences?.join(', ') || 'Not specified'}\n` +
      `Has: ${foodItems.join(', ')}\n` +
      `Distance: ${formatDistance(user.distance)}\n` +
      `Last active: ${lastActiveStr}\n\n` +
      `Great match for sharing food together!`,
      [
        { 
          text: 'Start Chat', 
          onPress: () => {
            console.log('Start Chat from profile pressed');
            try {
              router.navigate('/(tabs)/chat' as any);
              console.log('Navigation attempted to chat from profile');
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', 'Could not navigate to chat. Please try again.');
            }
          }
        },
        { text: 'Close', style: 'cancel' }
      ]
    );
  };

  if (showMap) {
    return (
      <View style={styles.container}>
        <View style={styles.mapHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setShowMap(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonIcon}>‹</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.mapTitle}>
            Nearby Matches
          </ThemedText>
        </View>
        
        <MapViewComponent
          onUserSelect={handleUserSelect}
          users={nearbyUsers}
        />
      </View>
    );
  }

  return (
    <ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}> Find Your Match</ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover people whose leftovers complement yours
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.sectionHeading}>How it works</ThemedText>
        <ThemedText>
          1. Take a photo of your leftovers{'\n'}
          2. Our AI identifies the food{'\n'}
          3. We find someone whose fridge completes your meal{'\n'}
          4. Match and meet up! 
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.sectionHeading}>Potential Matches</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchesContainer}>
          {mockMatches.map((match) => (
            <ThemedView key={match.id} style={styles.matchCard}>
              <ThemedText type="subtitle" style={styles.matchName}>{match.name}</ThemedText>
              <ThemedText style={styles.matchBio}>"{match.bio}"</ThemedText>
              <ThemedText style={styles.matchVibe}>{match.leftoverVibe}</ThemedText>
              <ThemedText style={styles.matchGoal}>{match.matchGoal}</ThemedText>
              <ThemedText style={styles.compatibility}>
                Compatibility: {match.compatibility}%
              </ThemedText>
              <TouchableOpacity 
                style={styles.matchButton}
                onPress={() => showUserProfile(match)}
              >
                <ThemedText style={styles.matchButtonText}>Match</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.sectionHeading}>Find Local Matches</ThemedText>
        <ThemedText style={styles.mapDescription}>
          See who's nearby and what they have in their fridge. Perfect for quick meetups and food sharing.
        </ThemedText>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
        >
          <ThemedText style={styles.mapButtonText}>View Map</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Removed photo call-to-action per design request */}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
    marginTop: 50,
  },
  titleText: {
    color: '#2f34ac',
  },
  sectionHeading: {
    color: '#2f34ac',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  stepContainer: {
    gap: 12,
    marginBottom: 24,
  },
  matchesContainer: {
    marginTop: 12,
  },
  matchCard: {
    width: 280,
    padding: 16,
    marginRight: 16,
    backgroundColor: 'rgba(247, 249, 251, 1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchBio: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
    opacity: 0.8,
  },
  matchVibe: {
    fontSize: 12,
    marginBottom: 4,
  },
  matchGoal: {
    fontSize: 12,
    marginBottom: 8,
  },
  compatibility: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 12,
  },
  matchButton: {
    backgroundColor: '#eddccb',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  matchButtonText: {
    color: '#2f34ac',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#eddccb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  container: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(47, 52, 172, 0.08)',
    marginRight: 16,
  },
  backButtonIcon: {
    fontSize: 24,
    color: '#2f34ac',
    fontWeight: 'bold',
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2f34ac',
    fontWeight: '600',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  mapDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: '#eddccb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#2f34ac',
    fontSize: 16,
    fontWeight: '600',
  },
});