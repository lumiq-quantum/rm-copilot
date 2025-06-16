import { ChatWindow } from '@/components/chat/ChatWindow';

export default function ChatPage() {
  // This page will effectively show the "Select a conversation" message
  // if no conversation is active, which is handled by ChatWindow.
  return <ChatWindow />;
}
