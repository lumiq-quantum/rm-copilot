
"use client";

import React from 'react';
import type { Message, AIMessageContent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, UserCircle2, BarChart2, Database, TableIcon } from 'lucide-react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

    const tableHeaders = content.tableData && content.tableData.length > 0 
      ? Object.keys(content.tableData[0]) 
      : [];

    return (
      <div className="space-y-4">
        {content.text && <p className="whitespace-pre-wrap break-words">{content.text}</p>}
        
        {content.chart && content.chart.url && (
          <Card className="overflow-hidden shadow-sm border-border">
            <CardHeader className="p-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center text-foreground">
                <BarChart2 className="w-4 h-4 mr-2 text-primary" />
                Data Visualization
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 bg-background">
              <Image 
                src={content.chart.url} 
                alt={content.chart.altText} 
                width={400} 
                height={300} 
                className="rounded-md object-contain w-full h-auto"
                data-ai-hint="financial chart"
              />
              <p className="text-xs text-muted-foreground mt-1.5 text-center">{content.chart.altText}</p>
            </CardContent>
          </Card>
        )}

        {content.tableData && content.tableData.length > 0 && (
          <Card className="overflow-hidden shadow-sm border-border">
            <CardHeader className="p-3 bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center text-foreground">
                <TableIcon className="w-4 h-4 mr-2 text-primary" />
                Data Table
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-background">
              <ScrollArea className="max-h-80 w-full [&_table]:min-w-full">
                <Table className="text-xs">
                  <TableHeader className="sticky top-0 bg-muted/50 z-10">
                    <TableRow>
                      {tableHeaders.map((header) => (
                        <TableHead key={header} className="whitespace-nowrap px-3 py-2 h-auto font-semibold">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.tableData.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {tableHeaders.map((header) => (
                          <TableCell key={`${rowIndex}-${header}`} className="whitespace-nowrap px-3 py-1.5">
                            {typeof row[header] === 'boolean' ? row[header].toString() : row[header]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                {/* Reasoning is not directly available from the new API to display here
                {content.sqlInfo.reasoning && (
                  <div>
                    <h4 className="font-semibold text-xs mb-1 text-primary">Reasoning:</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{content.sqlInfo.reasoning}</p>
                  </div>
                )}
                */}
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
