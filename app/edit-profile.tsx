import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePhoto } from '@/lib/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const FOOD_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Anything-goes',
];

const MATCH_GOALS = [
  'Looking to share leftovers',
  'Cooking collab',
  'Sustainable food buddy',
  'Date night material',
];

const LEFTOVER_VIBES = [
  'Always have pizza',
  'Meal prep enthusiast',
  'Serial bruncher',
  'Leftover wizard',
  'Fridge forager',
  'Creative cook',
];

export default function EditProfileScreen() {
  const { userProfile, updateProfile, user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(userProfile?.name || '');
  const [nickname, setNickname] = useState(userProfile?.nickname || '');
  const [age, setAge] = useState(userProfile?.age?.toString() || '');
  const [gender, setGender] = useState(userProfile?.gender || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [selectedFoodPrefs, setSelectedFoodPrefs] = useState<string[]>(userProfile?.foodPreferences || []);
  const [selectedLeftoverVibe, setSelectedLeftoverVibe] = useState(userProfile?.leftoverVibe || '');
  const [selectedMatchGoal, setSelectedMatchGoal] = useState(userProfile?.matchGoal || '');
  const [address, setAddress] = useState(userProfile?.location?.address || '');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleFoodPreference = (pref: string) => {
    setSelectedFoodPrefs(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const handleSave = async () => {
    if (!name || !bio || selectedFoodPrefs.length === 0 || !selectedMatchGoal) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const profileData: any = {
        name,
        bio,
        foodPreferences: selectedFoodPrefs,
        matchGoal: selectedMatchGoal,
      };

      if (nickname && nickname.trim()) {
        profileData.nickname = nickname.trim();
      }
      
      if (age && age.trim()) {
        profileData.age = parseInt(age);
      }
      
      if (gender && gender.trim()) {
        profileData.gender = gender.trim();
      }
      
      if (selectedLeftoverVibe && selectedLeftoverVibe.trim()) {
        profileData.leftoverVibe = selectedLeftoverVibe.trim();
      }

      // Geocode the address if changed
      if (address && address.trim()) {
        try {
          const geocoded = await Location.geocodeAsync(address);
          if (geocoded && geocoded.length > 0) {
            profileData.location = {
              latitude: geocoded[0].latitude,
              longitude: geocoded[0].longitude,
              address: address.trim(),
            };
          } else {
            profileData.location = { address: address.trim() };
          }
        } catch (err) {
          console.warn('Geocoding failed:', err);
          profileData.location = { address: address.trim() };
        }
      }

      await updateProfile(profileData);

      // Upload profile photo if changed
      if (profilePhotoUri && user?.uid) {
        try {
          const url = await uploadProfilePhoto(user.uid, profilePhotoUri);
          await updateProfile({ profilePhotoUrl: url });
        } catch (err: any) {
          console.error('Failed to upload profile photo:', err);
          Alert.alert('Upload failed', `Profile photo upload failed: ${err?.message || String(err)}`);
        }
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      router.back();
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelected = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable photo library access to choose a profile photo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setProfilePhotoUri(result.assets[0].uri);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Profile', headerBackTitle: 'Home' }} />
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedView style={styles.content}>
            <View style={styles.header}>
              <ThemedText type="title" style={styles.title}>Edit Your Profile</ThemedText>
              <ThemedText style={styles.subtitle}>Update your information</ThemedText>
            </View>

            <View style={styles.section}>
              {/* Profile photo */}
              <View style={{ marginBottom: 12, alignItems: 'center' }}>
                <View style={styles.avatarRow}>
                  <Image 
                    source={
                      profilePhotoUri 
                        ? { uri: profilePhotoUri } 
                        : userProfile?.profilePhotoUrl 
                          ? { uri: userProfile.profilePhotoUrl }
                          : require('../assets/images/icon.png')
                    } 
                    style={styles.profileAvatar} 
                  />

                  <TouchableOpacity
                    style={[styles.galleryButtonSmall, { marginTop: 8 }]}
                    onPress={handlePhotoSelected}
                  >
                    <Text style={styles.buttonTextSmall}>Change Photo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Name / Nickname *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., ChefJess or PastaKing"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Fridge Address *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Street, City, Country"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Age</ThemedText>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="Your age (optional)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Gender</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: '#f9f9f9' }]}
                  value={gender}
                  onChangeText={setGender}
                  autoComplete="off"
                  textContentType="none"
                  importantForAutofill="no"
                  underlineColorAndroid="transparent"
                  autoCorrect={false}
                  autoCapitalize="none"
                  placeholder="Your gender (optional)"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Bio *</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself! e.g., 'Always cooking too much spaghetti 🍝'"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Food Preferences *</ThemedText>
              <View style={styles.chipContainer}>
                {FOOD_PREFERENCES.map((pref) => (
                  <TouchableOpacity
                    key={pref}
                    style={[
                      styles.chip,
                      selectedFoodPrefs.includes(pref) && styles.chipSelected
                    ]}
                    onPress={() => toggleFoodPreference(pref)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedFoodPrefs.includes(pref) && styles.chipTextSelected
                    ]}>
                      {pref}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>Leftover Vibe</ThemedText>
              <View style={styles.chipContainer}>
                {LEFTOVER_VIBES.map((vibe) => (
                  <TouchableOpacity
                    key={vibe}
                    style={[
                      styles.chip,
                      selectedLeftoverVibe === vibe && styles.chipSelected
                    ]}
                    onPress={() => setSelectedLeftoverVibe(vibe)}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedLeftoverVibe === vibe && styles.chipTextSelected
                    ]}>
                      {vibe}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>What are you looking for? *</ThemedText>
              <View style={styles.optionContainer}>
                {MATCH_GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.option,
                      selectedMatchGoal === goal && styles.optionSelected
                    ]}
                    onPress={() => setSelectedMatchGoal(goal)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedMatchGoal === goal && styles.optionTextSelected
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 32,
    width: '100%',
  },
  avatarRow: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 6,
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#eee',
    marginBottom: 6,
  },
  galleryButtonSmall: {
    backgroundColor: '#2f34ac',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 84,
  },
  buttonTextSmall: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'left',
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 12,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  chipSelected: {
    backgroundColor: '#2f34ac',
    borderColor: '#2f34ac',
  },
  chipText: {
    fontSize: 12,
    color: '#333',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  optionContainer: {
    gap: 12,
  },
  option: {
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionSelected: {
    backgroundColor: '#2f34ac',
    borderColor: '#2f34ac',
  },
  optionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#cfb49aff',
    borderRadius: 30,
    padding: 12,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 30,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 15,
    fontWeight: '600',
  },
});
