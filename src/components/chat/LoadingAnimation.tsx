"use client";

import React from 'react';

export const LoadingAnimation: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 p-2">
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
      <span className="text-sm text-muted-foreground ml-2">BankerAI is thinking...</span>
    </div>
  );
};
