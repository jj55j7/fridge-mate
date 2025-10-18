import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MapViewComponent from '@/components/MapView';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { calculateDistance, formatDistance, getCurrentLocation } from '@/lib/location';
import { collection, onSnapshot } from 'firebase/firestore';

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

  // animation refs for cards
  const cardAnims = useRef(mockMatches.map(() => new Animated.Value(0))).current;
  const scaleAnims = useRef(mockMatches.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // staggered entrance for cards
    const timings = cardAnims.map((av, i) =>
      Animated.timing(av, { toValue: 1, duration: 350, delay: i * 100, useNativeDriver: true })
    );
    Animated.stagger(100, timings).start();
  }, [cardAnims]);

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

  // Listen to users collection for saved static locations (profiles)
  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const usersFromDb: any[] = [];
      let myLocation: { latitude: number; longitude: number } | null = null;

      snapshot.forEach(snap => {
        const data = snap.data();
        if (snap.id === auth.currentUser?.uid) {
          // capture current user's saved fridge location
          if (data.location && data.location.latitude && data.location.longitude) {
            myLocation = { latitude: data.location.latitude, longitude: data.location.longitude };
          }
        }

        if (data.location && data.location.latitude && data.location.longitude) {
          usersFromDb.push({
            id: snap.id,
            name: data.name || data.username || 'Anonymous',
            location: data.location,
            foodItems: data.foodItems || [],
            foodPhoto: data.foodPhoto || null,
            lastActive: data.lastActive ? (data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive)) : new Date(),
          });
        }
      });

      // If we found my saved location, compute distances from it and set userLocation
      if (myLocation) {
        setUserLocation(myLocation);
        const { latitude: lat, longitude: lon } = myLocation as { latitude: number; longitude: number };
        const withDistance = usersFromDb.map(u => ({
          ...u,
          distance: calculateDistance(lat, lon, u.location.latitude, u.location.longitude),
        }));
        setNearbyUsers(withDistance);
      } else {
        // no saved location yet — still list users but with undefined distances
        setNearbyUsers(usersFromDb.map(u => ({ ...u, distance: 0 })));
      }
    });

    return () => unsubscribe();
  }, []);

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
          userLocation={userLocation}
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
          {mockMatches.map((match, i) => (
            <Animated.View
              key={match.id}
              style={[
                styles.matchCard,
                {
                  opacity: cardAnims[i],
                  transform: [
                    {
                      translateY: cardAnims[i].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
                    },
                    { scale: scaleAnims[i] },
                  ],
                },
              ]}
            >
              <Pressable
                  onPressIn={() => Animated.spring(scaleAnims[i], { toValue: 0.98, useNativeDriver: true }).start()}
                  onPressOut={() => Animated.spring(scaleAnims[i], { toValue: 1, useNativeDriver: true }).start()}
                  style={{ flex: 1 }}
                >
                  <View style={styles.matchContent}>
                    <Image
                      source={
                        match.foodPhoto
                          ? { uri: match.foodPhoto }
                          : require('../../assets/images/icon.png')
                      }
                      style={styles.matchThumb}
                      resizeMode="cover"
                    />

                    <ThemedText type="subtitle" style={styles.matchName}>{match.name}</ThemedText>
                    <ThemedText style={styles.matchBio}>"{match.bio}"</ThemedText>
                    <ThemedText style={styles.matchVibe}>{match.leftoverVibe}</ThemedText>
                    <ThemedText style={styles.matchGoal}>{match.matchGoal}</ThemedText>
                    <ThemedText style={styles.compatibility}>
                      Compatibility: {match.compatibility}%
                    </ThemedText>
                  </View>

                  <View style={styles.matchFooter}>
                    <TouchableOpacity 
                      style={styles.matchButton}
                      onPress={() => showUserProfile(match)}
                    >
                      <ThemedText style={styles.matchButtonText}>Match</ThemedText>
                    </TouchableOpacity>
                  </View>
                </Pressable>
            </Animated.View>
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
    fontSize: 14,
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
    padding: 12,
    marginRight: 16,
    backgroundColor: '#eddccb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(47,52,172,0.12)',
    minHeight: 360,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  matchThumb: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
  },
  matchThumbPlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchThumbPlaceholderText: {
    color: '#666',
    fontSize: 14,
  },
  matchContent: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  matchFooter: {
    marginTop: 8,
    alignItems: 'center',
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
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2f34ac',
  },
  matchButtonText: {
    color: '#2f34ac',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#ffffffff',
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
    backgroundColor: '#efe4d9ff',
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