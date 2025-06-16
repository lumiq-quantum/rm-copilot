// @ts-nocheck
"use client";

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { LoadingAnimation } from './LoadingAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquareText, AlertTriangle } from 'lucide-react';

export function ChatWindow() {
  const { activeConversation, isLoadingMessage } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isLoadingMessage]);


  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <MessageSquareText className="w-24 h-24 text-muted-foreground mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-headline text-foreground mb-2">Welcome to BankerAI</h2>
        <p className="text-muted-foreground max-w-md">
          Please select a conversation from the sidebar or start a new one to begin.
        </p>
      </div>
    );
  }
  
  if (!activeConversation.messages) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Conversation Error</h2>
        <p className="text-muted-foreground">This conversation has no messages or is corrupted.</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full bg-background">
       <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div ref={viewportRef} className="h-full"> {/* This div is now the viewport */}
          {activeConversation.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoadingMessage && <LoadingAnimation />}
        </div>
      </ScrollArea>
      <ChatInput />
    </div>
  );
}
