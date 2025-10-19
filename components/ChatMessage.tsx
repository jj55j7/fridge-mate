import { ThemedText } from '@/components/themed-text';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: Date;
  read: boolean;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onPress?: () => void;
}

export default function ChatMessage({ message, isOwn, onPress }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image': return '📷';
      case 'voice': return '🎤';
      default: return '';
    }
  };

  return (
    <View style={[styles.container, isOwn ? styles.ownMessage : styles.otherMessage]}>
      <TouchableOpacity
        style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}
        onPress={onPress}
        disabled={!onPress}
      >
        <View style={styles.messageContent}>
          {message.type !== 'text' && (
            <Text style={styles.messageIcon}>
              {getMessageIcon(message.type)}
            </Text>
          )}
          <ThemedText style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {message.content}
          </ThemedText>
        </View>
        
        <View style={styles.messageFooter}>
          <ThemedText style={[
            styles.timestamp,
            isOwn ? styles.ownTimestamp : styles.otherTimestamp
          ]}>
            {formatTime(message.timestamp)}
          </ThemedText>
          {isOwn && (
            <Text style={styles.readStatus}>
              {message.read ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownBubble: {
    backgroundColor: '#6a4fbf',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  ownTimestamp: {
    color: 'rgba(255,255,255,0.9)',
  },
  otherTimestamp: {
    color: '#666',
  },
  readStatus: {
    fontSize: 12,
    marginLeft: 4,
    color: 'rgba(255,255,255,0.9)',
  },
});
