
// @ts-nocheck
"use client";

import type { Conversation, Message, User, AIMessageContent } from '@/types';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { processUserMessage } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const CHAT_STORAGE_KEY = 'banker_ai_chat_conversations';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  createNewConversation: () => Promise<Conversation | null>;
  addMessageToConversation: (conversationId: string, messageContent: string) => Promise<void>;
  renameConversation: (conversationId: string, newName: string) => void;
  deleteConversation: (conversationId: string) => void;
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
          if (!activeConversationIdState && parsedConversations.length > 0) {
            // setActiveConversationIdState(parsedConversations[0].id);
          } else if (activeConversationIdState && !parsedConversations.find(c => c.id === activeConversationIdState)) {
            setActiveConversationIdState(null);
          }
        } catch (error) {
          console.error("Failed to parse stored conversations:", error);
          setConversations([]);
        }
      } else {
        setConversations([]);
        setActiveConversationIdState(null);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser && conversations.length >= 0) {
      localStorage.setItem(`${CHAT_STORAGE_KEY}_${currentUser.id}`, JSON.stringify(conversations));
    }
  }, [conversations, currentUser]);

  const setActiveConversationId = useCallback((id: string | null) => {
    setActiveConversationIdState(id);
  }, []);

  const createNewConversation = useCallback(async (): Promise<Conversation | null> => {
    if (!currentUser) return null;
    const now = new Date().toISOString();
    const newConversation: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: 'New Conversation',
      messages: [
        {
          id: `msg-init-${Date.now()}`,
          sender: 'bot',
          content: { text: 'Welcome! How can I assist you today?' } as AIMessageContent,
          timestamp: now,
        }
      ],
      createdAt: now,
      lastActivity: now,
      userId: currentUser.id,
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, [currentUser, setActiveConversationId]);

  const addMessageToConversation = useCallback(async (conversationId: string, userInput: string) => {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      content: userInput,
      timestamp: now,
    };

    const conversationForApiHistory = conversations.find(c => c.id === conversationId);
    let apiHistoryMessages: Message[] = [];

    if (conversationForApiHistory) {
        // If it's a new chat (only initial bot message exists), API history should be that initial bot message.
        // Otherwise, send the actual message history.
        if (conversationForApiHistory.messages.length === 1 &&
            conversationForApiHistory.messages[0].sender === 'bot' &&
            conversationForApiHistory.messages[0].id.startsWith('msg-init-')) {
             apiHistoryMessages = conversationForApiHistory.messages;
        } else {
            apiHistoryMessages = conversationForApiHistory.messages;
        }
    }

    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const isEffectivelyNew = conv.messages.length === 1 && conv.messages[0].sender === 'bot' && conv.messages[0].id.startsWith('msg-init-');
          return {
            ...conv,
            messages: isEffectivelyNew ? [userMessage] : [...conv.messages, userMessage],
            lastActivity: now,
          };
        }
        return conv;
      })
    );
    setIsLoadingMessage(true);

    try {
      const botMessage = await processUserMessage(conversationId, currentUser.id, userInput, apiHistoryMessages);

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, messages: [...conv.messages, botMessage], lastActivity: new Date().toISOString() } : conv
        )
      );
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessageText = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.';
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        content: { text: errorMessageText } as AIMessageContent,
        timestamp: new Date().toISOString(),
      };
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, messages: [...conv.messages, errorMessage], lastActivity: new Date().toISOString() } : conv
        )
      );
      toast({
        title: "API Error",
        description: `Could not get response from BankerAI: ${errorMessageText}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingMessage(false);
    }
  }, [currentUser, conversations, toast, setActiveConversationId]);

  const renameConversation = useCallback((conversationId: string, newName: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, name: newName, lastActivity: new Date().toISOString() } : conv
      )
    );
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const updatedConversations = prev.filter(conv => conv.id !== conversationId);
      if (activeConversationIdState === conversationId) {
        setActiveConversationIdState(updatedConversations.length > 0 ? updatedConversations[0].id : null);
      }
      return updatedConversations;
    });
  }, [activeConversationIdState, setActiveConversationIdState]); // Corrected: use setActiveConversationIdState directly

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
        deleteConversation,
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
