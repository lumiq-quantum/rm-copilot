
// @ts-nocheck
"use client"; 

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarInset,
  SidebarRail,
  SidebarTrigger, // Added import
  useSidebar // Added import
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent';
import { getCurrentUser } from '@/lib/auth';
// Icons for potential future use or if needed by sidebar component itself


function ProtectedChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, activeConversation } = useChat();
  const { isMobile } = useSidebar(); // Get isMobile state


  useEffect(() => {
    const user = currentUser || getCurrentUser();
    if (!user) {
      router.replace('/'); 
    }
  }, [router, currentUser]);

  if (!currentUser && typeof window !== 'undefined' && !getCurrentUser()) {
     return (
        <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-lg text-muted-foreground">Loading authentication...</p>
        </div>
      );
  }
  
  if (!currentUser) { 
    return null; 
  }

  const conversationName = activeConversation?.name || "New Conversation";
  const conversationSubtitle = activeConversation?.messages?.length > 1 
    ? `Last message at ${new Date(activeConversation.messages[activeConversation.messages.length - 1].timestamp).toLocaleTimeString()}`
    : "Ask questions about customer data, get insights and visualizations";


  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="bg-sidebar border-r border-sidebar-border">
        <ChatSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 h-[73px]">
            <div className="flex items-center space-x-2">
              {isMobile && <SidebarTrigger />} 
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  {conversationName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {conversationSubtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              <span className="text-xs text-muted-foreground font-medium">AI Assistant Online</span>
            </div>
          </header>
          <main className="flex-grow overflow-hidden">
            {children}
          </main>
        </div>
      </SidebarInset>
    </>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <SidebarProvider defaultOpen={true}>
        <ProtectedChatLayout>{children}</ProtectedChatLayout>
      </SidebarProvider>
    </ChatProvider>
  );
}
