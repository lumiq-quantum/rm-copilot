
// @ts-nocheck
"use client";

import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { LoadingAnimation } from './LoadingAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, AlertTriangle, MessageSquareText } from 'lucide-react'; // Added Zap
import { Button } from '@/components/ui/button';


const WelcomeSuggestions = [
  { text: "Show customer portfolio analysis", "data-ai-hint": "portfolio analysis" },
  { text: "Generate risk assessment report", "data-ai-hint": "risk report" },
  { text: "What's the transaction history?", "data-ai-hint": "transaction history" },
  { text: "Analyze account balance trends", "data-ai-hint": "balance trends" },
];


export function ChatWindow() {
  const { activeConversation, isLoadingMessage, addMessageToConversation } = useChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [activeConversation?.messages, isLoadingMessage]);

  const handleSuggestionClick = (suggestionText: string) => {
    if (activeConversation) {
      addMessageToConversation(activeConversation.id, suggestionText);
    }
  };

  if (!activeConversation) {
    // This case should ideally be handled by redirecting or selecting a default conversation.
    // If it occurs, show a generic welcome or instructions.
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
        <MessageSquareText className="w-24 h-24 text-muted-foreground mb-6" strokeWidth={1} />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to BankerAI</h2>
        <p className="text-muted-foreground max-w-md">
          Please select a conversation from the sidebar or start a new one to begin.
        </p>
      </div>
    );
  }
  
  // Show welcome screen if it's a new conversation with only the initial bot message
  const isNewConversationWelcome = activeConversation.messages.length === 1 && activeConversation.messages[0].sender === 'bot';

  if (isNewConversationWelcome) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
          <Zap className="w-12 h-12 text-primary mb-5" strokeWidth={1.5} />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Welcome to BankChat AI</h2>
          <p className="text-muted-foreground max-w-lg mb-8 text-sm">
            I can help you analyze customer data, generate reports, and answer questions about your clients. Start by asking a question below.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
            {WelcomeSuggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto py-3 px-4 text-left justify-start font-normal text-sm text-foreground hover:bg-muted/80 border-border"
                onClick={() => handleSuggestionClick(suggestion.text)}
                data-ai-hint={suggestion['data-ai-hint']}
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
        </div>
        <ChatInput />
      </div>
    );
  }


  if (!activeConversation.messages && !isNewConversationWelcome) {
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
        <div ref={viewportRef} className="h-full max-w-4xl mx-auto w-full"> {/* Constrain width of messages */}
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
