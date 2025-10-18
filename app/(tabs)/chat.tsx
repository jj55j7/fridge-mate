import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data for chat list
const mockChats = [
  {
    id: '1',
    participants: ['user1', 'user2'],
    lastMessage: {
      content: 'Your pasta looks amazing! 🍝',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
    },
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2,
    otherUser: {
      name: 'PizzaLover23',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      foodPhoto: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100',
      foodItems: ['Pizza Margherita'],
    },
  },
  {
    id: '2',
    participants: ['user1', 'user3'],
    lastMessage: {
      content: 'When can we cook together? 👨‍🍳',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: true,
    },
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unreadCount: 0,
    otherUser: {
      name: 'ChefSarah',
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      foodPhoto: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=100',
      foodItems: ['Spaghetti Carbonara'],
    },
  },
  {
    id: '3',
    participants: ['user1', 'user4'],
    lastMessage: {
      content: 'Thanks for the great meal! 😊',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      read: true,
    },
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    otherUser: {
      name: 'BrunchKing',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      foodPhoto: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=100',
      foodItems: ['Avocado Toast'],
    },
  },
];

export default function ChatScreen() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const { chats, sendMessage, markAsRead } = useChat();
  const { userProfile } = useAuth();

  // Mock messages for demo
  const mockMessages = {
    '1': [
      {
        id: '1',
        senderId: 'user2',
        receiverId: 'user1',
        content: 'Hey! I saw your pasta photo - looks delicious! 🍝',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true,
      },
      {
        id: '2',
        senderId: 'user1',
        receiverId: 'user2',
        content: 'Thanks! It\'s my grandma\'s recipe. Your pizza looks amazing too! 🍕',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        read: true,
      },
      {
        id: '3',
        senderId: 'user2',
        receiverId: 'user1',
        content: 'Your pasta looks amazing! 🍝',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
      },
    ],
    '2': [
      {
        id: '4',
        senderId: 'user3',
        receiverId: 'user1',
        content: 'Hi! I love your carbonara - we should cook together sometime! 👨‍🍳',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: true,
      },
      {
        id: '5',
        senderId: 'user1',
        receiverId: 'user3',
        content: 'That sounds amazing! I\'d love to learn your techniques!',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
        read: true,
      },
      {
        id: '6',
        senderId: 'user3',
        receiverId: 'user1',
        content: 'When can we cook together? 👨‍🍳',
        type: 'text',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true,
      },
    ],
  };

  useEffect(() => {
    if (selectedChat) {
      setMessages(mockMessages[selectedChat as keyof typeof mockMessages] || []);
      markAsRead(selectedChat);
    }
  }, [selectedChat, markAsRead]);

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'voice') => {
    if (!selectedChat) return;

    try {
      await sendMessage(selectedChat, content, type);
      
      // Add to local messages for immediate UI update
      const newMessage = {
        id: Date.now().toString(),
        senderId: 'user1', // Current user
        receiverId: 'other',
        content,
        type,
        timestamp: new Date(),
        read: false,
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.chatItem, selectedChat === item.id && styles.selectedChatItem]}
      onPress={() => setSelectedChat(item.id)}
    >
      <View style={styles.chatContent}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.otherUser.photo }} style={styles.userPhoto} />
          <View style={styles.chatDetails}>
            <ThemedText style={styles.userName}>{item.otherUser.name}</ThemedText>
            <ThemedText style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage.content}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.chatMeta}>
          <ThemedText style={styles.timestamp}>
            {formatTime(item.lastMessageTime)}
          </ThemedText>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.foodMatch}>
        <Image source={{ uri: item.otherUser.foodPhoto }} style={styles.foodPhoto} />
        <ThemedText style={styles.foodName}>{item.otherUser.foodItems[0]}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }: { item: any }) => (
    <ChatMessage
      message={item}
      isOwn={item.senderId === 'user1'}
    />
  );

  if (selectedChat) {
    const currentChat = mockChats.find(chat => chat.id === selectedChat);
    
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedChat(null)}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <ThemedText style={styles.chatTitle}>
              {currentChat?.otherUser.name}
            </ThemedText>
            <ThemedText style={styles.chatSubtitle}>
              Food Match: {currentChat?.otherUser.foodItems[0]}
            </ThemedText>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          💬 Your Matches
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Chat with your food matches and plan your next meal together!
        </ThemedText>
      </View>

      <FlatList
        data={mockChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        style={styles.chatsList}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    lineHeight: 22,
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedChatItem: {
    backgroundColor: '#f8f9fa',
  },
  chatContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  chatDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    opacity: 0.7,
    maxWidth: 200,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  foodMatch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  foodPhoto: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  foodName: {
    fontSize: 12,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chatSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
  },
});
