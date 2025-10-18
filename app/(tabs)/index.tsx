import { Image } from 'expo-image';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, userProfile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#FFE5E5', dark: '#2D1B1B' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">🍽️ Fridge-Mate</ThemedText>
        <ThemedText style={styles.tagline}>
          Match with people based on what's in your fridge
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.welcomeContainer}>
        <ThemedText type="subtitle">Welcome back!</ThemedText>
        <ThemedText>
          Hello {userProfile?.name || userProfile?.username || 'Chef'}! 👋
        </ThemedText>
        {userProfile?.bio && (
          <ThemedText style={styles.bio}>
            "{userProfile.bio}"
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🍳 Ready to find your match?</ThemedText>
        <ThemedText>
          Take a photo of your leftovers and let's find someone whose fridge completes your meal!
        </ThemedText>
        <TouchableOpacity style={styles.primaryButton}>
          <ThemedText style={styles.buttonText}>📸 Take Photo</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">🎯 Your Preferences</ThemedText>
        {userProfile?.foodPreferences && userProfile.foodPreferences.length > 0 && (
          <ThemedText>
            <ThemedText type="defaultSemiBold">Dietary:</ThemedText> {userProfile.foodPreferences.join(', ')}
          </ThemedText>
        )}
        {userProfile?.matchGoal && (
          <ThemedText>
            <ThemedText type="defaultSemiBold">Looking for:</ThemedText> {userProfile.matchGoal}
          </ThemedText>
        )}
        {userProfile?.leftoverVibe && (
          <ThemedText>
            <ThemedText type="defaultSemiBold">Your vibe:</ThemedText> {userProfile.leftoverVibe}
          </ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
  welcomeContainer: {
    gap: 8,
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  bio: {
    fontStyle: 'italic',
    opacity: 0.8,
    marginTop: 8,
  },
  stepContainer: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#FF6B6B',
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
  logoutButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  logoutText: {
    color: '#6c757d',
    fontSize: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
