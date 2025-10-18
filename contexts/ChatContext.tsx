import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where } from 'firebase/firestore';
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
  lastMessage?: Message;
  lastMessageTime: Date;
  unreadCount: number;
}

interface ChatContextType {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  loading: boolean;
  sendMessage: (chatId: string, content: string, type?: 'text' | 'image' | 'voice') => Promise<void>;
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

  useEffect(() => {
    if (!user) return;

    // Listen to user's chats
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTime', 'desc')
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const chatsData: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatsData.push({
          id: doc.id,
          participants: data.participants,
          lastMessage: data.lastMessage,
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unreadCount: data.unreadCount || 0,
        });
      });
      setChats(chatsData);
      setLoading(false);
    });

    return unsubscribeChats;
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Listen to messages for each chat
    const unsubscribeMessages: (() => void)[] = [];

    chats.forEach((chat) => {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', chat.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
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
      });

      unsubscribeMessages.push(unsubscribe);
    });

    return () => {
      unsubscribeMessages.forEach(unsubscribe => unsubscribe());
    };
  }, [chats, user]);

  const sendMessage = async (chatId: string, content: string, type: 'text' | 'image' | 'voice' = 'text') => {
    if (!user) throw new Error('No user logged in');

    try {
      const chat = chats.find(c => c.id === chatId);
      if (!chat) throw new Error('Chat not found');

      const receiverId = chat.participants.find(id => id !== user.uid);
      if (!receiverId) throw new Error('Receiver not found');

      const messageData = {
        chatId,
        senderId: user.uid,
        receiverId,
        content,
        type,
        timestamp: new Date(),
        read: false,
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat's last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: messageData,
        lastMessageTime: new Date(),
      });

    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const createChat = async (participantId: string): Promise<string> => {
    if (!user) throw new Error('No user logged in');

    try {
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participants.includes(user.uid) && 
        chat.participants.includes(participantId)
      );

      if (existingChat) {
        return existingChat.id;
      }

      const chatData = {
        participants: [user.uid, participantId],
        lastMessageTime: new Date(),
        unreadCount: 0,
      };

      const docRef = await addDoc(collection(db, 'chats'), chatData);
      return docRef.id;

    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  };

  const markAsRead = async (chatId: string) => {
    if (!user) return;

    try {
      const chatMessages = messages[chatId] || [];
      const unreadMessages = chatMessages.filter(msg => 
        msg.receiverId === user.uid && !msg.read
      );

      // Mark messages as read
      for (const message of unreadMessages) {
        await updateDoc(doc(db, 'messages', message.id), {
          read: true,
        });
      }

      // Update chat unread count
      await updateDoc(doc(db, 'chats', chatId), {
        unreadCount: 0,
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
    messages,
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
