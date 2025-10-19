import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { 
  addDoc, 
  collection, 
  doc, 
  onSnapshot, 
  orderBy, 
  query, 
  serverTimestamp, 
  updateDoc, 
  where,
  getDocs,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: Date;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  lastMessageTime: Date;
  unreadCount: { [userId: string]: number };
}

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  createChat: (participantId: string) => Promise<string>;
  markAsRead: (chatId: string) => Promise<void>;
  getChatMessages: (chatId: string) => Message[];
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<{ [chatId: string]: Message[] }>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Listen to user's chats
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      chatsQuery, 
      (snapshot) => {
        const chatsData: Chat[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          chatsData.push({
            id: docSnap.id,
            participants: data.participants || [],
            lastMessage: data.lastMessage ? {
              content: data.lastMessage.content,
              timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
              senderId: data.lastMessage.senderId,
            } : undefined,
            lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
            unreadCount: data.unreadCount || {},
          });
        });
        
        // Sort by last message time (most recent first)
        chatsData.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
        
        setChats(chatsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to chats:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to messages for each chat
  useEffect(() => {
    if (!user?.uid || chats.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    chats.forEach((chat) => {
      const messagesQuery = query(
        collection(db, `chats/${chat.id}/messages`),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messagesData: Message[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            messagesData.push({
              id: docSnap.id,
              senderId: data.senderId,
              receiverId: data.receiverId,
              content: data.content,
              type: data.type || 'text',
              timestamp: data.timestamp?.toDate() || new Date(),
              read: data.read || false,
            });
          });
          
          setMessages(prev => ({
            ...prev,
            [chat.id]: messagesData,
          }));
        },
        (error) => {
          console.error(`Error listening to messages for chat ${chat.id}:`, error);
        }
      );

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [chats, user]);

  const createChat = async (participantId: string): Promise<string> => {
    if (!user?.uid) throw new Error('No user logged in');

    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participants.includes(user.uid) && 
        chat.participants.includes(participantId)
      );

      if (existingChat) {
        return existingChat.id;
      }

      // Create new chat
      const chatData = {
        participants: [user.uid, participantId],
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          [user.uid]: 0,
          [participantId]: 0,
        },
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;

    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const sendMessage = async (chatId: string, content: string) => {
    if (!user?.uid) throw new Error('No user logged in');
    if (!content.trim()) return;

    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) throw new Error('Chat not found');

      const receiverId = chat.participants.find(id => id !== user.uid);
      if (!receiverId) throw new Error('Receiver not found');

      const messageData = {
        senderId: user.uid,
        receiverId,
        content: content.trim(),
        type: 'text',
        timestamp: serverTimestamp(),
        read: false,
      };

      // Add message to subcollection
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);

      // Update chat's last message and unread count
      const currentUnreadCount = chat.unreadCount || {};
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          content: content.trim(),
          timestamp: serverTimestamp(),
          senderId: user.uid,
        },
        lastMessageTime: serverTimestamp(),
        unreadCount: {
          ...currentUnreadCount,
          [receiverId]: (currentUnreadCount[receiverId] || 0) + 1,
        },
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!user?.uid) return;

    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) return;

      const chatMessages = messages[chatId] || [];
      const unreadMessages = chatMessages.filter(msg => 
        msg.receiverId === user.uid && !msg.read
      );

      // Mark messages as read in batch
      const updatePromises = unreadMessages.map(message =>
        updateDoc(doc(db, `chats/${chatId}/messages`, message.id), {
          read: true,
        })
      );

      await Promise.all(updatePromises);

      // Reset unread count for current user
      const currentUnreadCount = chat.unreadCount || {};
      await updateDoc(doc(db, 'chats', chatId), {
        unreadCount: {
          ...currentUnreadCount,
          [user.uid]: 0,
        },
      });

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const getChatMessages = (chatId: string): Message[] => {
    return messages[chatId] || [];
  };

  const value = {
    chats,
    loading,
    sendMessage,
    createChat,
    markAsRead,
    getChatMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
