
// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Paperclip, CornerDownLeft, Command } from 'lucide-react'; // Added Paperclip, Command
import { useChat } from '@/contexts/ChatContext';

export function ChatInput() {
  const [inputValue, setInputValue] = useState('');
  const { activeConversation, addMessageToConversation, isLoadingMessage } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !activeConversation || isLoadingMessage) return;

    const messageToSend = inputValue;
    setInputValue(''); 
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }
    await addMessageToConversation(activeConversation.id, messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { // Cmd/Ctrl + Enter to send
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) { // Enter alone for newline
      // Default behavior (newline) is fine if not Cmd/Ctrl+Enter
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`; // Max height 200px
    }
  };

  // Effect to reset textarea height when activeConversation changes (e.g., new chat)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [activeConversation]);


  return (
    <div className="sticky bottom-0 left-0 right-0 p-4 bg-background border-t border-border shadow-sm">
      <div className="max-w-3xl mx-auto"> {/* Centered and max-width container */}
        <div className="relative flex items-end p-1 bg-muted/50 rounded-xl border border-border focus-within:ring-1 focus-within:ring-primary">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about customer data..."
            className="flex-grow p-2.5 pr-20 bg-transparent border-none resize-none shadow-none focus-visible:ring-0 text-sm min-h-[44px]"
            rows={1}
            disabled={isLoadingMessage || !activeConversation}
            aria-label="Chat input"
          />
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground w-8 h-8"
              disabled={isLoadingMessage || !activeConversation}
              aria-label="Attach file"
            >
              <Paperclip size={18} />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg w-8 h-8"
              disabled={isLoadingMessage || !inputValue.trim() || !activeConversation}
              onClick={handleSubmit}
              aria-label="Send message"
            >
              <SendHorizonal size={18} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
            <p className="text-xs text-muted-foreground">
              Try: "Show customer portfolio" or "Generate risk analysis"
            </p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Command size={12} />
                <span>+</span>
                <CornerDownLeft size={12} />
                <span>to send</span>
            </div>
        </div>
      </div>
    </div>
  );
}
