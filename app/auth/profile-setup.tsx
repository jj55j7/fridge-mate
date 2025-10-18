import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { uploadProfilePhoto } from '@/lib/firebase';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
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

export default function ProfileSetupScreen() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFoodPrefs, setSelectedFoodPrefs] = useState<string[]>([]);
  const [selectedLeftoverVibe, setSelectedLeftoverVibe] = useState('');
  const [selectedMatchGoal, setSelectedMatchGoal] = useState('');
  const [address, setAddress] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateProfile, user } = useAuth();

  const toggleFoodPreference = (pref: string) => {
    setSelectedFoodPrefs(prev => 
      prev.includes(pref) 
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const handleComplete = async () => {
    if (!name || !bio || selectedFoodPrefs.length === 0 || !selectedMatchGoal) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!address || !address.trim()) {
      Alert.alert('Error', 'Please enter your fridge address so others can find you');
      return;
    }

    setLoading(true);
    try {
      // Create profile data object, only including defined values
      const profileData: any = {
        name,
        bio,
        foodPreferences: selectedFoodPrefs,
        matchGoal: selectedMatchGoal,
        // address will be resolved to coordinates below
      };

      // Only add optional fields if they have values
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

      // (no-op here) we'll upload the profile photo after creating/updating the profile so we have a uid

      // Geocode the provided address to store coordinates
      try {
        const geocoded = await Location.geocodeAsync(address);
        if (geocoded && geocoded.length > 0) {
          profileData.location = {
            latitude: geocoded[0].latitude,
            longitude: geocoded[0].longitude,
            address: address.trim(),
          };
        } else {
          // If geocoding fails, still save address string (no coords)
          profileData.location = { address: address.trim() };
        }
      } catch (err) {
        console.warn('Geocoding failed:', err);
        profileData.location = { address: address.trim() };
      }

      console.log('Profile data being sent:', profileData);
      
      await updateProfile(profileData);

      // Upload profile photo after profile exists (need user uid from auth context)
      if (profilePhotoUri && user?.uid) {
        try {
          console.debug('Starting uploadProfilePhoto for uid:', user.uid, 'uri:', profilePhotoUri);
          const url = await uploadProfilePhoto(user.uid, profilePhotoUri);
          console.debug('uploadProfilePhoto succeeded, url:', url);
          // Save the photo URL to the user's profile
          await updateProfile({ profilePhotoUrl: url });
        } catch (err) {
          const uploadErr: any = err;
          console.error('Failed to upload profile photo:', uploadErr);
          Alert.alert('Upload failed', `Profile photo upload failed: ${uploadErr?.message || String(uploadErr)}`);
        }
      }
      
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', `Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelected = (uri: string) => {
    setProfilePhotoUri(uri);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>Profile Setup</ThemedText>
            <ThemedText style={styles.subtitle}>Help us find your perfect leftover match</ThemedText>
          </View>

          <View style={styles.section}>
            
            
            {/* Profile photo (optional) - moved above Name */}
            <View style={{ marginBottom: 12, alignItems: 'center' }}>
              <View style={styles.avatarRow}>
                {profilePhotoUri ? (
                  <Image source={{ uri: profilePhotoUri }} style={styles.profileAvatar} />
                ) : (
                  <Image source={require('../../assets/images/icon.png')} style={styles.profileAvatarPlaceholder} />
                )}

                <TouchableOpacity
                  style={[styles.galleryButtonSmall, { marginTop: 8 }]}
                  onPress={async () => {
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
                      handlePhotoSelected(result.assets[0].uri);
                    }
                  }}
                >
                  <Text style={styles.buttonTextSmall}>{profilePhotoUri ? 'Change' : 'Choose'}</Text>
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

          {/* Fridge address moved to Basic Info section */}

          {/* PhotoUpload moved to the header area for profile photo setup */}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleComplete}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Text>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
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
  avatarTextContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#eee',
    marginBottom: 6,
  },
  profileAvatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#f2f2f2',
    marginBottom: 6,
  },
  galleryButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
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
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 28,
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
    backgroundColor: '#efe4d9ff',
    borderColor: '#efe4d9ff',
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
    backgroundColor: '#efe4d9ff',
    borderColor: '#efe4d9ff',
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
  buttonTextSmall: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
