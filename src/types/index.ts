
export interface User {
  id: string;
  username: string; // RM ID
}

export interface AIMessageContent {
  text?: string; // Mapped from API's "direct_answer"
  sqlInfo?: {
    query: string; // Mapped from API's "redshift_sql"
  };
  graphicalRepresentation?: string; // Mapped from API's "graphical_representation"
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
