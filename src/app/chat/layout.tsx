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
  useSidebar 
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'; // Added PanelLeftClose

function ProtectedChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser } = useChat(); 
  const { toggleSidebar, state: sidebarState, isMobile } = useSidebar();


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

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <ChatSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <header className="p-3 border-b flex items-center sticky top-0 bg-background/95 backdrop-blur-sm z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="h-7 w-7 mr-3"
              aria-label="Toggle sidebar"
            >
              {isMobile ? (
                <PanelLeftOpen />
              ) : sidebarState === 'expanded' ? (
                <PanelLeftClose />
              ) : (
                <PanelLeftOpen />
              )}
            </Button>
            <h2 className="font-headline text-xl truncate">
              {activeConversation?.name || 'BankerAI Chat'}
            </h2>
          </header>
          <main className="flex-grow overflow-hidden">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  // This outer ChatLayout component provides ChatContext to ProtectedChatLayout
  // So ProtectedChatLayout can then provide SidebarContext to its children.
  return (
    <ChatProvider>
      <SidebarProvider defaultOpen={true}> {/* SidebarProvider needs to wrap ProtectedChatLayout */}
        <ProtectedChatLayout>{children}</ProtectedChatLayout>
      </SidebarProvider>
    </ChatProvider>
  );
}
