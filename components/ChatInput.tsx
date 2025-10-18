import { ThemedView } from '@/components/themed-view';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'image' | 'voice') => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need photo library access to send images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onSendMessage(result.assets[0].uri, 'image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleVoiceRecord = () => {
    // TODO: Implement voice recording
    Alert.alert('Coming Soon', 'Voice messages will be available soon!');
  };

  const icebreakerPrompts = [
    "If we cooked together, what's the first dish we'd make?",
    "What's one food you'll never share?",
    "What's your favorite comfort food?",
    "If you could have dinner with anyone, who would it be?",
    "What's the weirdest food combination you actually like?",
  ];

  const sendIcebreaker = (prompt: string) => {
    onSendMessage(prompt, 'text');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Icebreaker Prompts */}
      <View style={styles.icebreakerContainer}>
        <Text style={styles.icebreakerTitle}>💬 Icebreakers</Text>
        <View style={styles.promptsContainer}>
          {icebreakerPrompts.slice(0, 2).map((prompt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.promptButton}
              onPress={() => sendIcebreaker(prompt)}
              disabled={disabled}
            >
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, disabled && styles.disabledInput]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
          editable={!disabled}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.imageButton]}
            onPress={handleImagePicker}
            disabled={disabled}
          >
            <Text style={styles.actionButtonText}>📷</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.voiceButton]}
            onPress={handleVoiceRecord}
            disabled={disabled}
          >
            <Text style={styles.actionButtonText}>🎤</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sendButton, disabled && styles.disabledButton]}
            onPress={handleSend}
            disabled={!message.trim() || disabled}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  icebreakerContainer: {
    marginBottom: 16,
  },
  icebreakerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FF6B6B',
  },
  promptsContainer: {
    gap: 8,
  },
  promptButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  promptText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f9f9f9',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    backgroundColor: '#4ECDC4',
  },
  voiceButton: {
    backgroundColor: '#FFB74D',
  },
  actionButtonText: {
    fontSize: 18,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
