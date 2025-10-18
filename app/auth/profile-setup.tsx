import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
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
  const [loading, setLoading] = useState(false);
  const { updateProfile } = useAuth();

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

    setLoading(true);
    try {
      await updateProfile({
        name,
        nickname: nickname || undefined,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        bio,
        foodPreferences: selectedFoodPrefs,
        leftoverVibe: selectedLeftoverVibe || undefined,
        matchGoal: selectedMatchGoal,
      });
      
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.emoji}>👨‍🍳</Text>
            <ThemedText type="title" style={styles.title}>Tell Us About You!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Help us find your perfect leftover match
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Info</ThemedText>
            
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
                style={styles.input}
                value={gender}
                onChangeText={setGender}
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
    alignItems: 'center',
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  chipSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  chipText: {
    fontSize: 14,
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
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
