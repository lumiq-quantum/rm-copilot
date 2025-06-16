"use client";

import type { Message, AIMessageContent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, UserCircle2, BarChart2, Database } from 'lucide-react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const content = message.content as AIMessageContent | string;
  
  const renderContent = () => {
    if (typeof content === 'string') {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    return (
      <div className="space-y-3">
        {content.text && <p className="whitespace-pre-wrap">{content.text}</p>}
        {content.chart && content.chart.url && (
          <Card className="overflow-hidden shadow-md">
            <CardHeader className="p-3 bg-muted/50">
              <CardTitle className="text-sm font-medium flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-primary" />
                Data Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Image 
                src={content.chart.url} 
                alt={content.chart.altText} 
                width={400} 
                height={300} 
                className="rounded-md object-contain w-full h-auto"
                data-ai-hint="financial chart"
              />
              <p className="text-xs text-muted-foreground mt-1 text-center">{content.chart.altText}</p>
            </CardContent>
          </Card>
        )}
        {content.sqlInfo && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sql-info" className="border bg-card rounded-md shadow-md">
              <AccordionTrigger className="px-4 py-3 text-sm font-medium hover:no-underline">
                <div className="flex items-center">
                  <Database className="w-4 h-4 mr-2 text-primary" />
                  SQL Query & Reasoning
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3 space-y-2">
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-primary">SQL Query:</h4>
                  <ScrollArea className="max-h-32 w-full rounded-md border bg-muted/30 p-2">
                    <pre className="text-xs font-code whitespace-pre-wrap break-all">
                      <code>{content.sqlInfo.query}</code>
                    </pre>
                  </ScrollArea>
                </div>
                <div>
                  <h4 className="font-semibold text-xs mb-1 text-primary">Reasoning:</h4>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{content.sqlInfo.reasoning}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-end gap-3 my-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="h-9 w-9 self-start shadow-sm">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles size={20} />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] p-3.5 rounded-xl shadow-md text-sm
          ${isUser 
            ? 'bg-primary text-primary-foreground rounded-br-none' 
            : 'bg-card text-card-foreground rounded-bl-none'
          }`}
      >
        {renderContent()}
        <p className={`text-xs mt-2 ${isUser ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isUser && (
         <Avatar className="h-9 w-9 self-start shadow-sm">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <UserCircle2 size={20} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
