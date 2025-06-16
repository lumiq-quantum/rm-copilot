// @ts-nocheck
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

export function ChatInput() {
  const [inputValue, setInputValue] = useState('');
  const { activeConversation, addMessageToConversation, isLoadingMessage } = useChat();

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !activeConversation || isLoadingMessage) return;

    const messageToSend = inputValue;
    setInputValue(''); // Clear input immediately for better UX
    await addMessageToConversation(activeConversation.id, messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t">
      <div className="relative flex items-center">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a customer..."
          className="pr-16 resize-none rounded-full py-3 px-4 shadow-sm focus-visible:ring-accent"
          rows={1}
          disabled={isLoadingMessage || !activeConversation}
          aria-label="Chat input"
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground w-10 h-10"
          disabled={isLoadingMessage || !inputValue.trim() || !activeConversation}
          aria-label="Send message"
        >
          <SendHorizonal size={20} />
        </Button>
      </div>
    </form>
  );
}
