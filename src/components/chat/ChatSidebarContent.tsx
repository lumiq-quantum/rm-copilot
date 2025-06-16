
// @ts-nocheck
"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { Plus, Search, MessageSquareText, Building, LogOut, Settings, UserCircle } from 'lucide-react';
import { RenameConversationDialog } from './RenameConversationDialog';
import { logout } from '@/lib/auth';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ChatSidebarContent() {
  const { conversations, activeConversationId: currentConversationId, setActiveConversationId, createNewConversation, currentUser } = useChat();
  const router = useRouter();
  const { setOpenMobile, isMobile, state: sidebarState } = useSidebar();

  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleNewConversation = async () => {
    const newConv = await createNewConversation();
    if (newConv) {
      router.push(`/chat/${newConv.id}`);
      if (isMobile) setOpenMobile(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    router.push(`/chat/${id}`);
    if (isMobile) setOpenMobile(false);
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

  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userInitial = currentUser?.username ? currentUser.username.substring(0, 1).toUpperCase() : "VP";


  return (
    <>
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
        {/* User Info and New Conversation Button */}
        <div className={`p-4 border-b border-sidebar-border ${sidebarState === 'collapsed' && !isMobile ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex items-center ${sidebarState === 'collapsed' && !isMobile ? 'justify-center w-full mb-2' : 'mb-3'}`}>
            <Avatar className={`h-10 w-10 ${sidebarState === 'collapsed' && !isMobile ? '' : 'mr-3'}`}>
              <AvatarFallback className="bg-primary text-primary-foreground text-base font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            {(sidebarState === 'expanded' || isMobile) && (
              <div>
                <p className="text-sm font-semibold text-foreground">{currentUser?.username || 'Vishal Pandey'}</p>
                <p className="text-xs text-muted-foreground">Relationship Manager</p>
              </div>
            )}
          </div>
          <Button
            onClick={handleNewConversation}
            className={`w-full justify-center bg-primary hover:bg-primary/90 text-primary-foreground text-sm py-2.5 ${sidebarState === 'collapsed' && !isMobile ? 'px-2' : ''}`}
            aria-label="Start a new conversation"
          >
            <Plus className={`h-4 w-4 ${sidebarState === 'collapsed' && !isMobile ? '' : 'mr-2'}`} />
            {(sidebarState === 'expanded' || isMobile) && <span>New Conversation</span>}
          </Button>
        </div>

        {/* Search Input */}
        {(sidebarState === 'expanded' || isMobile) && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-9 h-9 text-sm bg-background border-border focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}


        <ScrollArea className="flex-grow p-2">
          {filteredConversations.length === 0 && searchTerm === '' && (sidebarState === 'expanded' || isMobile) && (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <MessageSquareText className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="font-medium text-sm text-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground">Create your first conversation to start chatting with the AI assistant.</p>
            </div>
          )}
           {filteredConversations.length === 0 && searchTerm !== '' && (sidebarState === 'expanded' || isMobile) && (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-muted-foreground">No conversations found for "{searchTerm}".</p>
            </div>
          )}
          <div className="space-y-1">
            {filteredConversations.map((conv) => (
              <div key={conv.id} className="group relative">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm h-auto py-2.5 px-3 truncate 
                    ${sidebarState === 'collapsed' && !isMobile ? 'justify-center !px-0' : ''} 
                    ${currentConversationId === conv.id 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                  onClick={() => handleSelectConversation(conv.id)}
                  title={conv.name}
                >
                   {(sidebarState === 'expanded' || isMobile) ? (
                     <span className="truncate">{conv.name}</span>
                   ) : (
                     <MessageSquareText className="h-5 w-5" /> 
                   )}
                </Button>
                {/* Rename button can be added back here if needed, removed for screenshot alignment */}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom "BankChat Portal" and User Dropdown */}
        <div className={`p-3 border-t border-sidebar-border mt-auto ${sidebarState === 'collapsed' && !isMobile ? 'flex flex-col items-center space-y-2' : ''}`}>
          <Button variant="ghost" className={`w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${sidebarState === 'collapsed' && !isMobile ? 'justify-center' : ''}`}>
            <Building className={`h-4 w-4 ${sidebarState === 'collapsed' && !isMobile ? '' : 'mr-2'}`} />
            {(sidebarState === 'expanded' || isMobile) && <span className="text-xs">BankChat Portal</span>}
          </Button>
          
          {(sidebarState === 'expanded' || isMobile) && <div className="h-px bg-sidebar-border my-1 mx-[-0.75rem]"></div>}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`w-full justify-start p-2 h-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${sidebarState === 'collapsed' && !isMobile ? 'justify-center' : ''}`}>
                <Avatar className={`h-7 w-7 ${sidebarState === 'collapsed' && !isMobile ? '' : 'mr-2'}`}>
                   <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {(sidebarState === 'expanded' || isMobile) && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-xs">{currentUser?.username || 'Vishal Pandey'}</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 bg-popover text-popover-foreground mb-1">
              <DropdownMenuLabel className="font-medium text-sm">{currentUser?.username}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-xs">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-xs">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 dark:text-red-400 focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer text-xs">
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
          onOpenChange={(isOpen) => {
            setIsRenameDialogOpen(isOpen);
            if (!isOpen) setRenamingConversationId(null);
          }}
        />
      )}
    </>
  );
}
