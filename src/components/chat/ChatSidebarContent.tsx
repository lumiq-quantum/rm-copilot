// @ts-nocheck
"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/contexts/ChatContext';
import { PlusCircle, Edit3, MessageSquare, LogOut, Settings, Users } from 'lucide-react';
import { RenameConversationDialog } from './RenameConversationDialog';
import { logout } from '@/lib/auth';
import { useSidebar } from '@/components/ui/sidebar'; // Import useSidebar
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ChatSidebarContent() {
  const { conversations, activeConversation, setActiveConversationId, createNewConversation, currentUser } = useChat();
  const router = useRouter();
  const params = useParams();
  const currentConversationId = params.conversationId as string | undefined;
  const { setOpenMobile, isMobile, state: sidebarState } = useSidebar(); // Get sidebar context

  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const handleNewConversation = async () => {
    const newConv = await createNewConversation();
    if (newConv) {
      router.push(`/chat/${newConv.id}`);
      if (isMobile) setOpenMobile(false); // Close mobile sidebar
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    router.push(`/chat/${id}`);
    if (isMobile) setOpenMobile(false); // Close mobile sidebar
  };

  const handleRename = (id: string) => {
    setRenamingConversationId(id);
    setIsRenameDialogOpen(true);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const currentConversationForRename = conversations.find(c => c.id === renamingConversationId);

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className={`font-headline text-2xl text-sidebar-foreground transition-opacity duration-300 ${sidebarState === 'collapsed' && !isMobile ? 'opacity-0' : 'opacity-100'}`}>
            BankerAI
          </h1>
        </div>

        <div className="p-2">
          <Button
            onClick={handleNewConversation}
            className={`w-full justify-start bg-accent hover:bg-accent/80 text-accent-foreground ${sidebarState === 'collapsed' && !isMobile ? 'justify-center' : ''}`}
            aria-label="Start a new conversation"
          >
            <PlusCircle className={`mr-2 h-5 w-5 ${sidebarState === 'collapsed' && !isMobile ? 'mr-0' : ''}`} />
            <span className={`${sidebarState === 'collapsed' && !isMobile ? 'hidden' : 'inline'}`}>New Conversation</span>
          </Button>
        </div>

        <ScrollArea className="flex-grow p-2">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <div key={conv.id} className="group relative">
                <Button
                  variant={currentConversationId === conv.id ? 'secondary' : 'ghost'}
                  className={`w-full justify-start text-sm h-auto py-2 px-3 truncate ${sidebarState === 'collapsed' && !isMobile ? 'justify-center' : ''} ${currentConversationId === conv.id ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
                  onClick={() => handleSelectConversation(conv.id)}
                  title={conv.name}
                >
                  <MessageSquare className={`mr-2 h-4 w-4 shrink-0 ${sidebarState === 'collapsed' && !isMobile ? 'mr-0' : ''}`} />
                  <span className={`truncate ${sidebarState === 'collapsed' && !isMobile ? 'hidden' : 'inline'}`}>{conv.name}</span>
                </Button>
                {(sidebarState === 'expanded' || isMobile) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    onClick={() => handleRename(conv.id)}
                    aria-label={`Rename conversation ${conv.name}`}
                  >
                    <Edit3 size={14} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className={`p-3 border-t border-sidebar-border mt-auto ${sidebarState === 'collapsed' && !isMobile ? 'flex justify-center' : ''}`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${sidebarState === 'collapsed' && !isMobile ? 'justify-center' : ''}`}>
                <Avatar className={`h-8 w-8 mr-2 ${sidebarState === 'collapsed' && !isMobile ? 'mr-0' : ''}`}>
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : 'RM'}
                  </AvatarFallback>
                </Avatar>
                {(sidebarState === 'expanded' || isMobile) && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{currentUser?.username || 'Relationship Manager'}</span>
                    <span className="text-xs text-sidebar-foreground/70">Online</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 bg-popover text-popover-foreground mb-2">
              <DropdownMenuLabel className="font-medium">{currentUser?.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {renamingConversationId && currentConversationForRename && (
        <RenameConversationDialog
          conversationId={renamingConversationId}
          currentName={currentConversationForRename.name}
          isOpen={isRenameDialogOpen}
          onOpenChange={setIsRenameDialogOpen}
        />
      )}
    </>
  );
}
