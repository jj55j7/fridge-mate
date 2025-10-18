import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

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
      {/* Header Section with better spacing */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.appTitle}> FridgeMate</ThemedText>
        <ThemedText style={styles.tagline}>
          Match with people based on what's in your fridge
        </ThemedText>
      </ThemedView>

      {/* Enhanced Profile Card with gradient-like background */}
      <View style={styles.profileCardWrapper}>
        <ThemedView style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={userProfile?.profilePhotoUrl ? { uri: userProfile.profilePhotoUrl } : require('@/assets/images/icon.png')}
              style={styles.profileAvatar}
              contentFit="cover"
            />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{userProfile?.name || userProfile?.username || 'Chef'}</ThemedText>
            {userProfile?.bio ? <ThemedText style={styles.profileBio}>{userProfile.bio}</ThemedText> : null}
          </View>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => router.push('/edit-profile' as any)}
          >
            <ThemedText style={styles.editButtonText}>Edit</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </View>

      {/* Preferences Card with icons and better typography */}
      <View style={styles.preferencesWrapper}>
        <ThemedView style={styles.preferencesCard}>
          <ThemedText type="subtitle" style={styles.preferencesTitle}>Your Food Profile</ThemedText>
          
          {userProfile?.foodPreferences && userProfile.foodPreferences.length > 0 && (
            <View style={styles.preferenceRow}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.emoji}>🥗</ThemedText>
              </View>
              <View style={styles.preferenceContent}>
                <ThemedText type="defaultSemiBold" style={styles.preferenceLabel}>Dietary</ThemedText>
                <ThemedText style={styles.preferenceValue}>{userProfile.foodPreferences.join(' • ')}</ThemedText>
              </View>
            </View>
          )}
          
          {userProfile?.matchGoal && (
            <View style={styles.preferenceRow}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.emoji}>🎯</ThemedText>
              </View>
              <View style={styles.preferenceContent}>
                <ThemedText type="defaultSemiBold" style={styles.preferenceLabel}>Looking for</ThemedText>
                <ThemedText style={styles.preferenceValue}>{userProfile.matchGoal}</ThemedText>
              </View>
            </View>
          )}
          
          {userProfile?.leftoverVibe && (
            <View style={styles.preferenceRow}>
              <View style={styles.iconCircle}>
                <ThemedText style={styles.emoji}>✨</ThemedText>
              </View>
              <View style={styles.preferenceContent}>
                <ThemedText type="defaultSemiBold" style={styles.preferenceLabel}>Your vibe</ThemedText>
                <ThemedText style={styles.preferenceValue}>{userProfile.leftoverVibe}</ThemedText>
              </View>
            </View>
          )}
        </ThemedView>
      </View>

      {/* Logout Button with better spacing */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </View>
      </ParallaxScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header Styles
  titleContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    textAlign: 'left',
  },
  appTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#2f34ac',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'left',
    opacity: 0.7,
    color: '#666',
  },

  // Profile Card Styles
  profileCardWrapper: {
    marginBottom: 10,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#2f34ac',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(47, 52, 172, 0.08)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#2f34ac',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f34ac',
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 13,
    opacity: 0.7,
    color: '#666',
  },
  editButton: {
    backgroundColor: '#2f34ac',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Preferences Card Styles
  preferencesWrapper: {
    marginBottom: 20,
  },
  preferencesCard: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(47, 52, 172, 0.05)',
  },
  preferencesTitle: {
    color: '#2f34ac',
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#efe4d9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 20,
  },
  preferenceContent: {
    flex: 1,
    paddingTop: 2,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#2f34ac',
    marginBottom: 2,
  },
  preferenceValue: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    color: '#444',
  },

  // Logout Button Styles
  logoutWrapper: {
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(47, 52, 172, 0.2)',
  },
  logoutText: {
    color: '#2f34ac',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.7,
  },

  // Legacy/Unused Styles (keeping for compatibility)
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
  profileAvatarSmall: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});
