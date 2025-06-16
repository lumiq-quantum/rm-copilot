// @ts-nocheck
"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChat } from '@/contexts/ChatContext';

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { setActiveConversationId, conversations, activeConversation } = useChat();
  const conversationId = params.conversationId as string;

  useEffect(() => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [conversationId, setActiveConversationId]);

  // If the conversationId from URL doesn't exist in our loaded conversations,
  // and we have conversations loaded, redirect to the base /chat page.
  // This avoids showing a blank page for an invalid conversation ID.
  useEffect(() => {
    if (conversationId && conversations.length > 0 && !conversations.find(c => c.id === conversationId)) {
      router.replace('/chat');
    }
  }, [conversationId, conversations, router]);
  
  // This check is to ensure that if activeConversation is being set, we wait for it.
  // Or if the ID is invalid and redirection is about to happen.
  if (conversationId && !activeConversation && conversations.length > 0) {
    // It's possible the active conversation is being set or the ID is invalid.
    // A loading state could be shown here, or rely on the redirection logic.
    // For now, ChatWindow will handle the "no active conversation" state if it's truly null.
  }


  return <ChatWindow />;
}
