// @ts-nocheck
"use client";

import type { Conversation, Message, User } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { processUserMessage } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const CHAT_STORAGE_KEY = 'banker_ai_chat_conversations';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  setActiveConversationId: (id: string | null) => void;
  createNewConversation: () => Promise<Conversation | null>;
  addMessageToConversation: (conversationId: string, messageContent: string) => Promise<void>;
  renameConversation: (conversationId: string, newName: string) => void;
  isLoadingMessage: boolean;
  currentUser: User | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationIdState] = useState<string | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const storedConversations = localStorage.getItem(`${CHAT_STORAGE_KEY}_${user.id}`);
      if (storedConversations) {
        try {
          setConversations(JSON.parse(storedConversations));
        } catch (error) {
          console.error("Failed to parse stored conversations:", error);
          setConversations([]);
        }
      } else {
        // Initialize with a sample conversation if none exist
        const initialConversation: Conversation = {
          id: `conv-${Date.now()}`,
          name: 'Welcome to BankerAI!',
          messages: [
            {
              id: `msg-${Date.now()}`,
              sender: 'bot',
              content: { text: 'Hello! I am BankerAI. How can I assist you today? Try asking "Tell me about customer Alpha" or "Show chart for customer Beta transactions".' },
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          userId: user.id,
        };
        setConversations([initialConversation]);
        setActiveConversationIdState(initialConversation.id);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && conversations.length > 0) {
      localStorage.setItem(`${CHAT_STORAGE_KEY}_${currentUser.id}`, JSON.stringify(conversations));
    }
  }, [conversations, currentUser]);
  
  const setActiveConversationId = useCallback((id: string | null) => {
    setActiveConversationIdState(id);
  }, []);

  const createNewConversation = useCallback(async (): Promise<Conversation | null> => {
    if (!currentUser) return null;
    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: 'New Conversation',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'bot',
          content: { text: 'New conversation started. What can I help you with?' },
          timestamp: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, [currentUser, setActiveConversationId]);

  const addMessageToConversation = useCallback(async (conversationId: string, messageContent: string) => {
    if (!currentUser) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, messages: [...conv.messages, userMessage] } : conv
      )
    );
    setIsLoadingMessage(true);

    try {
      const botMessage = await processUserMessage(conversationId, currentUser.id, messageContent);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, messages: [...conv.messages, botMessage] } : conv
        )
      );
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        content: { text: 'Sorry, I encountered an error. Please try again.' },
        timestamp: new Date().toISOString(),
      };
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, messages: [...conv.messages, errorMessage] } : conv
        )
      );
      toast({
        title: "Error",
        description: "Could not get response from AI. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessage(false);
    }
  }, [currentUser, toast]);

  const renameConversation = useCallback((conversationId: string, newName: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, name: newName } : conv
      )
    );
  }, []);
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationId) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        setActiveConversationId,
        createNewConversation,
        addMessageToConversation,
        renameConversation,
        isLoadingMessage,
        currentUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
