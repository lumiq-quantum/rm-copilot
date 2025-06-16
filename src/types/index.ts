
export interface User {
  id: string;
  username: string; // RM ID
}

export interface AIMessageContent {
  text?: string; // Mapped from API's "answer"
  chart?: {
    url: string; // Can be a data URI (base64)
    altText: string;
  };
  sqlInfo?: {
    query: string;
    // Reasoning might not be directly available from the new API, or it's part of 'text'
    // reasoning?: string; 
  };
  tableData?: Record<string, any>[]; // Parsed from API's "dataframe"
}

export type MessageContent = AIMessageContent | string;

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: MessageContent; 
  timestamp: string; // Store as ISO string for easier serialization
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  createdAt: string; // Store as ISO string
  lastActivity: string; // Store as ISO string, updated on new message
  userId: string; 
}

