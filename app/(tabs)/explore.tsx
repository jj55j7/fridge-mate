import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import MapViewComponent from '@/components/MapView';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useChat } from '@/contexts/ChatContext'; // ✅ Import useChat
import { auth, db } from '@/lib/firebase';
import { calculateDistance, formatDistance } from '@/lib/location';
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
  const [displayMatches, setDisplayMatches] = useState<any[]>(mockMatches);
  const [userLocation, setUserLocation] = useState<any>(null);
  const router = useRouter();
  const { createChat } = useChat(); // ✅ Get createChat

  // animation refs for cards - use displayMatches length
  const cardAnims = useRef<Animated.Value[]>([]);
  const scaleAnims = useRef<Animated.Value[]>([]);

  // Initialize animations when displayMatches changes
  useEffect(() => {
    cardAnims.current = displayMatches.map(() => new Animated.Value(0));
    scaleAnims.current = displayMatches.map(() => new Animated.Value(1));
    
    // staggered entrance for cards
    const timings = cardAnims.current.map((av, i) =>
      Animated.timing(av, { toValue: 1, duration: 350, delay: i * 100, useNativeDriver: true })
    );
    Animated.stagger(100, timings).start();
  }, [displayMatches]);

  useEffect(() => {
    loadNearbyUsers();
  }, []);

  const loadNearbyUsers = async () => {
    const mockUsers = mockMatches.map((match) => ({
      ...match,
      location: undefined as any,
      distance: 0,
      lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      foodItems: match.foodItems || ['Unknown food'],
      foodPhoto: match.foodPhoto || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    }));

    setNearbyUsers(mockUsers);
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
          if (data.location && data.location.latitude && data.location.longitude) {
            myLocation = { latitude: data.location.latitude, longitude: data.location.longitude };
          }
          return;
        }

        if (data.location && data.location.latitude && data.location.longitude) {
          usersFromDb.push({
            id: snap.id,
            name: data.name || data.username || 'Anonymous',
            bio: data.bio || '',
            location: data.location,
            foodItems: data.foodItems || [],
            foodPhoto: data.foodPhoto || data.profilePhotoUrl || null,
            lastActive: data.lastActive ? (data.lastActive.toDate ? data.lastActive.toDate() : new Date(data.lastActive)) : new Date(),
            leftoverVibe: data.leftoverVibe || '',
            matchGoal: data.matchGoal || '',
            foodPreferences: data.foodPreferences || [],
          });
        }
      });

      if (myLocation) {
        setUserLocation(myLocation);
        const { latitude: lat, longitude: lon } = myLocation as { latitude: number; longitude: number };
        const withDistance = usersFromDb.map(u => ({
          ...u,
          distance: calculateDistance(lat, lon, u.location.latitude, u.location.longitude),
          compatibility: Math.floor(Math.random() * 30) + 70,
        }));
        
        if (withDistance.length > 0) {
          const combined = [...withDistance, ...mockMatches];
          const sorted = combined.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
          setDisplayMatches(sorted);
        } else {
          const sorted = [...mockMatches].sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
          setDisplayMatches(sorted);
        }
        
        setNearbyUsers(withDistance);
      } else {
        const usersWithDistance = usersFromDb.map(u => ({ ...u, distance: 0, compatibility: Math.floor(Math.random() * 30) + 70 }));
        
        if (usersWithDistance.length > 0) {
          const combined = [...usersWithDistance, ...mockMatches];
          const sorted = combined.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
          setDisplayMatches(sorted);
        } else {
          const sorted = [...mockMatches].sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
          setDisplayMatches(sorted);
        }
        
        setNearbyUsers(usersWithDistance);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ NEW: Function to create chat and navigate
  const handleStartChat = async (userId: string, userName: string) => {
    try {
      console.log('Creating chat with user:', userId);
      
      // Create the chat in Firestore
      const chatId = await createChat(userId);
      
      console.log('Chat created successfully:', chatId);
      
      // Navigate to chat tab
      router.push('/(tabs)/chat');
      
      // Show success message
      Alert.alert('Success!', `Chat with ${userName} started!`);
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Could not start chat. Please try again.');
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
          onPress: () => handleStartChat(user.id, user.name) // ✅ Use handleStartChat
        },
        { 
          text: 'View Profile', 
          onPress: () => showUserProfile(user)
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
          onPress: () => handleStartChat(user.id, user.name) // ✅ Use handleStartChat
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
        <ThemedText type="title" style={styles.titleText}>🍽️ Find Your Match</ThemedText>
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
          4. Match and meet up! 🎉
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle" style={styles.sectionHeading}>Potential Matches</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.matchesContainer}>
          {displayMatches.map((match, i) => (
            <Animated.View
              key={match.id}
              style={[
                styles.matchCard,
                {
                  opacity: cardAnims.current[i] || new Animated.Value(1),
                  transform: [
                    {
                      translateY: cardAnims.current[i]?.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) || 0,
                    },
                    { scale: scaleAnims.current[i] || new Animated.Value(1) },
                  ],
                },
              ]}
            >
              <Pressable
                  onPressIn={() => {
                    if (scaleAnims.current[i]) {
                      Animated.spring(scaleAnims.current[i], { toValue: 0.98, useNativeDriver: true }).start();
                    }
                  }}
                  onPressOut={() => {
                    if (scaleAnims.current[i]) {
                      Animated.spring(scaleAnims.current[i], { toValue: 1, useNativeDriver: true }).start();
                    }
                  }}
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
                    <ThemedText style={styles.matchBio}>&quot;{match.bio}&quot;</ThemedText>
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
          See who is nearby and what they have in their fridge. Perfect for quick meetups and food sharing.
        </ThemedText>
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => setShowMap(true)}
        >
          <ThemedText style={styles.mapButtonText}>🗺️ View Map</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
    backgroundColor: '#efe4d9ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(47,52,172,0.12)',
    minHeight: 360,
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
  container: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop: 25,
    position: 'relative',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(47, 52, 172, 0.08)',
    position: 'absolute',
    left: 16,
    zIndex: 10,
    marginTop: 30,
    marginBottom: 7,
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
    marginTop: 30,
    textAlign: 'center',
    color: '#2f34ac',
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
    borderRadius: 30,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#2f34ac',
    fontSize: 16,
    fontWeight: '600',
  },
});