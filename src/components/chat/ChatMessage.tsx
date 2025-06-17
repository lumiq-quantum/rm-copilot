
"use client";

import React from 'react';
import type { Message, AIMessageContent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, UserCircle2, Database, AlignLeft } from 'lucide-react'; // Replaced BarChart2, TableIcon with AlignLeft
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const content = message.content as AIMessageContent | string;

  if (message.id.startsWith('msg-init-')) {
    return null;
  }

  const renderContent = () => {
    if (typeof content === 'string') {
      const formattedContent = content.split('\n').map((line, index, arr) => (
        <React.Fragment key={index}>
          {line}
          {index < arr.length - 1 && <br />}
        </React.Fragment>
      ));
      return <div className="whitespace-normal break-words">{formattedContent}</div>;
    }

    return (
      <div className="space-y-4">
        {content.text && (
            <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br />') }} />
        )}

        {content.graphicalRepresentation && (
          <Card className="overflow-hidden shadow-sm border-border">
            <CardHeader className="p-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center text-foreground">
                <AlignLeft className="w-4 h-4 mr-2 text-primary" />
                Graphical Representation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-background">
              <ScrollArea className="max-h-80 w-full">
                <pre className="text-xs font-mono whitespace-pre p-3.5 leading-relaxed">
                  {content.graphicalRepresentation}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {content.sqlInfo && content.sqlInfo.query && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sql-info" className="border bg-card rounded-lg shadow-sm">
              <AccordionTrigger className="px-4 py-2.5 text-sm font-medium hover:no-underline text-foreground">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-2 text-primary" />
                  SQL Query
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 space-y-2 bg-background rounded-b-lg">
                <ScrollArea className="max-h-40 w-full rounded-md border bg-muted/30 p-2.5">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground">
                    <code>{content.sqlInfo.query.trim()}</code>
                  </pre>
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 my-5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="h-10 w-10 self-start shadow-sm shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground rounded-full">
            <Sparkles size={20} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] p-3.5 rounded-xl shadow
          ${isUser
            ? 'bg-primary text-primary-foreground rounded-br-none'
            : 'bg-card text-card-foreground border border-border rounded-bl-none'
          }`}
      >
        {renderContent()}
        <p className={`text-xs mt-2.5 opacity-80 ${isUser ? 'text-primary-foreground/80 text-right' : 'text-muted-foreground text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
         <Avatar className="h-10 w-10 self-start shadow-sm shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground rounded-full">
            <UserCircle2 size={20} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
