import { ThemedView } from '@/components/themed-view';
import React, { useState } from 'react';
import {
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
        <Text style={styles.icebreakerTitle}>Icebreakers</Text>
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
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || disabled) && styles.disabledButton]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 8,
  },
  icebreakerContainer: {
    marginBottom: 16,
  },
  icebreakerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2f34ac',
  },
  promptsContainer: {
    gap: 8,
  },
  promptButton: {
    backgroundColor: '#efe4d9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(47,52,172,0.12)',
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
  sendButton: {
    backgroundColor: '#2f34ac',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
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
