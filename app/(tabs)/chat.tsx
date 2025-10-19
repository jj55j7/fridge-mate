import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UserProfile {
  name: string;
  photoURL?: string;
  foodItems?: string[];
}

export default function ChatScreen() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { chats, sendMessage, markAsRead, getChatMessages, loading } = useChat();
  const { user } = useAuth();

  const currentMessages = selectedChat ? getChatMessages(selectedChat) : [];

  // Fetch other user's profile when chat is selected
  useEffect(() => {
    if (!selectedChat || !user?.uid) return;

    const chat = chats.find(c => c.id === selectedChat);
    if (!chat) return;

    const otherUserId = chat.participants.find(id => id !== user.uid);
    if (!otherUserId) return;

    // Fetch other user's profile
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOtherUserProfile({
            name: userData.displayName || userData.name || 'Unknown User',
            photoURL: userData.photoURL,
            foodItems: userData.foodItems || [],
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [selectedChat, chats, user]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (selectedChat) {
      markAsRead(selectedChat);
    }
  }, [selectedChat, markAsRead]);

  const handleSendMessage = async (content: string, type: 'text' | 'image' | 'voice') => {
    if (!selectedChat || type !== 'text') return;

    try {
      await sendMessage(selectedChat, content);
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      console.error('Send message error:', error);
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

  const getUnreadCount = (chat: any) => {
    if (!user?.uid) return 0;
    return chat.unreadCount?.[user.uid] || 0;
  };

  // Store user profiles for all chats
  const [chatUserProfiles, setChatUserProfiles] = useState<{ [chatId: string]: UserProfile }>({});

  // Fetch user profiles for all chats
  useEffect(() => {
    if (!user?.uid || chats.length === 0) return;

    const fetchAllProfiles = async () => {
      const profiles: { [chatId: string]: UserProfile } = {};

      for (const chat of chats) {
        const otherUserId = chat.participants.find((id: string) => id !== user.uid);
        if (!otherUserId) continue;

        try {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            profiles[chat.id] = {
              name: userData.displayName || userData.name || 'Unknown User',
              photoURL: userData.photoURL,
              foodItems: userData.foodItems || [],
            };
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }

      setChatUserProfiles(profiles);
    };

    fetchAllProfiles();
  }, [chats, user]);

  const renderChatItem = ({ item }: { item: any }) => {
    const userProfile = chatUserProfiles[item.id];
    const unreadCount = getUnreadCount(item);

    return (
      <TouchableOpacity
        style={[styles.chatItem, selectedChat === item.id && styles.selectedChatItem]}
        onPress={() => setSelectedChat(item.id)}
      >
        <View style={styles.chatContent}>
          <View style={styles.userInfo}>
            {userProfile?.photoURL ? (
              <Image 
                source={{ uri: userProfile.photoURL }} 
                style={styles.userPhoto}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {userProfile?.name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            <View style={styles.chatDetails}>
              <ThemedText style={styles.userName}>
                {userProfile?.name || 'Loading...'}
              </ThemedText>
              <ThemedText style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage?.content || 'Start chatting!'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.chatMeta}>
            <ThemedText style={styles.timestamp}>
              {item.lastMessage ? formatTime(item.lastMessageTime) : ''}
            </ThemedText>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
        
        {userProfile?.foodItems && userProfile.foodItems.length > 0 && (
          <View style={styles.foodMatch}>
            <Text style={styles.foodEmoji}></Text>
            <ThemedText style={styles.foodName}>
              {userProfile.foodItems[0]}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: any }) => (
    <ChatMessage
      message={item}
      isOwn={item.senderId === user?.uid}
    />
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <ThemedText style={styles.loadingText}>Loading chats...</ThemedText>
      </ThemedView>
    );
  }

  if (selectedChat) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedChat(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonIcon}>‹</Text>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <ThemedText style={styles.chatTitle}>
              {otherUserProfile?.name || 'Chat'}
            </ThemedText>
            {otherUserProfile?.foodItems && otherUserProfile.foodItems.length > 0 && (
              <ThemedText style={styles.chatSubtitle}>
                Food Match: {otherUserProfile.foodItems[0]}
              </ThemedText>
            )}
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={currentMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
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
          Your Matches
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Chat with your food matches and plan your next meal together!
        </ThemedText>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}></Text>
          <ThemedText style={styles.emptyText}>No chats yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Match with someone to start chatting!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    marginTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2f34ac',
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
    backgroundColor: '#efe4d9ff',
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
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2f34ac',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
    backgroundColor: '#2f34ac',
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
  foodEmoji: {
    fontSize: 16,
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
    marginTop: 25,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(47, 52, 172, 0.08)',
    marginRight: 16,
    position: 'absolute',
    left: 12,
    zIndex: 10,
    marginTop: 18,
  },
  backButtonIcon: {
    fontSize: 24,
    color: '#2f34ac',
    fontWeight: 'bold',
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2f34ac',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
});
