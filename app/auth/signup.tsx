import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Link, router } from 'expo-router';
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

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, '', phoneNumber);
      router.replace('/auth/profile-setup');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message);
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
            <ThemedText type="title" style={styles.title}>Join FridgeMate!</ThemedText>
            <ThemedText style={styles.subtitle}>
              Ready to whip up something delicious with your match?
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email *</ThemedText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Phone Number</ThemedText>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number (optional)"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password *</ThemedText>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password *</ThemedText>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Already have an account?{' '}
            </ThemedText>
            <Link href="/auth/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
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
    marginTop: 40,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 20,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'left',
    opacity: 0.7,
  },
  form: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 11,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 16,
    fontSize: 13,
    backgroundColor: '#efe4d9ff',
  },
  button: {
    backgroundColor: '#2f34ac',
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 13,
    color: '#2f34ac',
    fontWeight: '600',
  },
});
