import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    router.replace('/auth/login');
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* App Title */}
          <Text style={styles.title}>FridgeMate</Text>
          
          {/* Tagline */}
          <Text style={styles.tagline}>
            Match with people based on what's in your fridge.
          </Text>

          {/* Pizza Illustration */}
          <Text style={styles.pizzaEmoji}>🍕</Text>

          {/* Tap to continue hint */}
          <Animated.Text 
            style={[
              styles.tapHint,
              { opacity: fadeAnim }
            ]}
          >
            Tap anywhere to continue
          </Animated.Text>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: '#2f34ac',
    textAlign: 'center',
    marginBottom: 80,
    lineHeight: 24,
  },
  pizzaEmoji: {
    fontSize: 200,
    marginBottom: 80,
  },
  tapHint: {
    fontSize: 14,
    color: '#bbbbc0ff',
    marginTop: 40,
  },
});
