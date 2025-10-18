import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

const { width: screenWidth } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;

interface SwipeCardProps {
  user: {
    id: string;
    name: string;
    bio: string;
    foodPhoto: string;
    foodItems: string[];
    distance: number;
    age?: number;
    foodPreferences: string[];
    leftoverVibe?: string;
    matchGoal: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPass: () => void;
  onLike: () => void;
}

export default function SwipeCard({ user, onSwipeLeft, onSwipeRight, onPass, onLike }: SwipeCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, translationY, velocityX } = event.nativeEvent;
    
    if (Math.abs(translationX) > SWIPE_THRESHOLD) {
      // Swipe threshold reached
      const toValue = translationX > 0 ? screenWidth : -screenWidth;
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: translationY,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: translationX > 0 ? 1 : -1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (translationX > 0) {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      });
    } else {
      // Return to center
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(rotate, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const likeOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX },
                { translateY },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          <ThemedView style={styles.cardContent}>
            {/* Food Photo */}
            <View style={styles.photoContainer}>
              <Image source={{ uri: user.foodPhoto }} style={styles.foodPhoto} />
              <View style={styles.photoOverlay}>
                <ThemedText style={styles.foodItems}>
                  {user.foodItems.join(', ')}
                </ThemedText>
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <ThemedText type="subtitle" style={styles.name}>
                  {user.name}
                </ThemedText>
                <ThemedText style={styles.distance}>
                  {user.distance}km away
                </ThemedText>
              </View>
              
              {user.age && (
                <ThemedText style={styles.age}>
                  {user.age} years old
                </ThemedText>
              )}

              <ThemedText style={styles.bio}>
                "{user.bio}"
              </ThemedText>

              {user.leftoverVibe && (
                <View style={styles.vibeContainer}>
                  <ThemedText style={styles.vibeLabel}>Vibe:</ThemedText>
                  <ThemedText style={styles.vibe}>{user.leftoverVibe}</ThemedText>
                </View>
              )}

              <View style={styles.preferencesContainer}>
                <ThemedText style={styles.preferencesLabel}>Looking for:</ThemedText>
                <ThemedText style={styles.matchGoal}>{user.matchGoal}</ThemedText>
              </View>

              <View style={styles.foodPrefsContainer}>
                <ThemedText style={styles.preferencesLabel}>Dietary:</ThemedText>
                <View style={styles.foodPrefs}>
                  {user.foodPreferences.slice(0, 3).map((pref, index) => (
                    <View key={index} style={styles.foodPrefChip}>
                      <ThemedText style={styles.foodPrefText}>{pref}</ThemedText>
                    </View>
                  ))}
                  {user.foodPreferences.length > 3 && (
                    <ThemedText style={styles.morePrefs}>
                      +{user.foodPreferences.length - 3} more
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          </ThemedView>

          {/* Swipe Indicators */}
          <Animated.View style={[styles.swipeIndicator, styles.likeIndicator, { opacity: likeOpacity }]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.swipeIndicator, styles.passIndicator, { opacity: passOpacity }]}>
            <Text style={styles.passText}>PASS</Text>
          </Animated.View>
        </Animated.View>
      </PanGestureHandler>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.passButton} onPress={onPass}>
          <Text style={styles.passButtonText}>👎 Pass</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.likeButton} onPress={onLike}>
          <Text style={styles.likeButtonText}>❤️ Like</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: screenWidth - 40,
    height: '80%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photoContainer: {
    height: '60%',
    position: 'relative',
  },
  foodPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  foodItems: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
    opacity: 0.7,
  },
  age: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 22,
  },
  vibeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vibeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  vibe: {
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  preferencesContainer: {
    marginBottom: 12,
  },
  preferencesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  matchGoal: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  foodPrefsContainer: {
    marginBottom: 12,
  },
  foodPrefs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodPrefChip: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodPrefText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  morePrefs: {
    fontSize: 12,
    opacity: 0.7,
    alignSelf: 'center',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  likeIndicator: {
    right: 20,
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  passIndicator: {
    left: 20,
    borderColor: '#F44336',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  likeText: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  passText: {
    color: '#F44336',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  passButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  likeButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  passButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  likeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
