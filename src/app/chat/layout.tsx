// @ts-nocheck
"use client"; // This layout client component needs to be a client component

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarTrigger, 
  SidebarInset,
  SidebarRail
} from '@/components/ui/sidebar';
import { ChatSidebarContent } from '@/components/chat/ChatSidebarContent';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button'; // For header
import { PanelLeftOpen } from 'lucide-react'; // For header trigger


function ProtectedChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser } = useChat(); // Get currentUser from ChatContext

  useEffect(() => {
    // Initial check. If context hasn't loaded user yet, getCurrentUser() is fallback.
    const user = currentUser || getCurrentUser();
    if (!user) {
      router.replace('/'); // Redirect to login if not authenticated
    }
  }, [router, currentUser]);

  // If no user, show loading or redirect (handled by useEffect, but this prevents render flicker)
  if (!currentUser && typeof window !== 'undefined' && !getCurrentUser()) {
     return (
        <div className="flex items-center justify-center h-screen bg-background">
          <p className="text-lg text-muted-foreground">Loading authentication...</p>
        </div>
      );
  }
  
  if (!currentUser) { // Still no user after checks (e.g. initial server render or context not ready)
    return null; // Or a more sophisticated loading state
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <ChatSidebarContent />
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          {/* Optional Header for main content area, especially for mobile */}
          <header className="md:hidden p-3 border-b flex items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <SidebarTrigger asChild>
              <Button variant="ghost" size="icon">
                <PanelLeftOpen />
              </Button>
            </SidebarTrigger>
            <h2 className="ml-3 font-headline text-xl">
              {/* Dynamically show conversation name here if possible, or BankerAI */}
              BankerAI Chat
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


// Wrap ProtectedChatLayout with ChatProvider
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <ProtectedChatLayout>{children}</ProtectedChatLayout>
    </ChatProvider>
  );
}
