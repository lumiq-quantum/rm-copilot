
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
  activeConversationId: string | null; // Exposed for direct comparison
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
  const [activeConversationIdState, setActiveConversationIdState] = useState<string | null>(null);
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
          const parsedConversations = JSON.parse(storedConversations);
          setConversations(parsedConversations);
          // If no active conversation is set, and there are conversations, set the first one as active.
          // Or, if an active ID was stored but isn't in the list, clear it.
          if (!activeConversationIdState && parsedConversations.length > 0) {
            // setActiveConversationIdState(parsedConversations[0].id); // Potentially set first one, or let user choose
          } else if (activeConversationIdState && !parsedConversations.find(c => c.id === activeConversationIdState)) {
            setActiveConversationIdState(null);
          }
        } catch (error) {
          console.error("Failed to parse stored conversations:", error);
          setConversations([]);
        }
      } else {
        // No stored conversations, don't initialize with a sample here
        // Let the ChatWindow handle the "no active conversation" state to show welcome screen
        setConversations([]);
        setActiveConversationIdState(null);
      }
    }
  }, []); // Removed activeConversationIdState from deps to avoid loops on init

  useEffect(() => {
    if (currentUser && conversations.length >= 0) { // Save even if conversations is empty (to clear old data)
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
      name: 'New Conversation', // Default name, user might rename
      messages: [
        { // Initial bot message for the welcome screen logic in ChatWindow
          id: `msg-init-${Date.now()}`,
          sender: 'bot',
          content: { text: 'Welcome to your new conversation! How can I assist you?' }, // This content won't be directly shown if welcome screen is active
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
      prev.map(conv => {
        if (conv.id === conversationId) {
          // If it's the first user message in a "new" conversation (which only had the initial bot message),
          // replace the initial bot message with the user's message. Otherwise, append.
          const isEffectivelyNew = conv.messages.length === 1 && conv.messages[0].sender === 'bot' && conv.messages[0].id.startsWith('msg-init-');
          return { 
            ...conv, 
            messages: isEffectivelyNew ? [userMessage] : [...conv.messages, userMessage] 
          };
        }
        return conv;
      })
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
  
  const activeConversation = conversations.find(conv => conv.id === activeConversationIdState) || null;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        activeConversationId: activeConversationIdState,
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
