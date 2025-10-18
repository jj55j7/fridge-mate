import { Image } from 'expo-image';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    <View style={{ flex: 1 }}>
      <ParallaxScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title"> FridgeMate</ThemedText>
        <ThemedText style={styles.tagline}>
          Match with people based on what's in your fridge
        </ThemedText>
      </ThemedView>

      {/* welcome card removed as requested */}

      {/* Profile card: ensure avatar and name are visible in the Home content */}
      <ThemedView style={styles.profileCard}>
        <Image
          source={userProfile?.profilePhotoUrl ? { uri: userProfile.profilePhotoUrl } : require('@/assets/images/icon.png')}
          style={styles.profileAvatarSmall}
          contentFit="cover"
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <ThemedText style={styles.profileName}>{userProfile?.name || userProfile?.username || 'Chef'}</ThemedText>
          {userProfile?.bio ? <ThemedText style={{ opacity: 0.8 }}>{userProfile.bio}</ThemedText> : null}
        </View>
      </ThemedView>

      {/* 'Ready to find your match?' section removed per request */}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Your Preferences</ThemedText>
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
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    gap: 8,
    marginBottom: 5,
    marginTop: 45,
    textAlign: 'left'
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  welcomeContainer: {
    gap: 8,
    marginBottom: 10,
    padding: 16,
    backgroundColor: '#2f34ac',
    borderRadius: 12,
  },
  bio: {
    color: '#ffffff',
  },
  welcomeText: {
    color: '#ffffff',
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
  headerAvatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  headerImageFull: {
    width: '100%',
    height: 250,
  },
  headerFallback: {
    width: '100%',
    height: 250,
    backgroundColor: '#FFE5E5',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatarSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
});
