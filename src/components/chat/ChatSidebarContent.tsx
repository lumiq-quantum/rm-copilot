
// @ts-nocheck
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { Plus, Search, MessageSquareText, Building, LogOut, Settings, UserCircle, Pencil, Trash2, AlertCircle } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function ChatSidebarContent() {
  const { conversations, activeConversationId, setActiveConversationId, createNewConversation, currentUser, renameConversation, deleteConversation } = useChat();
  const router = useRouter();
  const { setOpenMobile, isMobile, state: sidebarState } = useSidebar();

  const [renamingConversationId, setRenamingConversationId] = useState<string | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [conversationToDeleteId, setConversationToDeleteId] = useState<string | null>(null);


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

  const handleRename = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent conversation selection
    setRenamingConversationId(id);
    setIsRenameDialogOpen(true);
  };

  const handleDeleteInitiate = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent conversation selection
    setConversationToDeleteId(id);
    setShowDeleteConfirmDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (conversationToDeleteId) {
      deleteConversation(conversationToDeleteId);
      // If the deleted conversation was active, ChatContext handles setting a new activeId or null.
      // Router might need to navigate away if current page becomes invalid.
      // Current ChatPage/ConversationPage setup might handle this by showing "Select conversation".
      if (activeConversationId === conversationToDeleteId) {
         router.replace('/chat'); // Navigate to base if active one is deleted
      }
    }
    setShowDeleteConfirmDialog(false);
    setConversationToDeleteId(null);
  };


  const handleLogout = async () => {
    await logout();
    router.push('/');
  };
  
  const currentConversationForRename = conversations.find(c => c.id === renamingConversationId);

  const filteredConversations = conversations
    .filter(conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());


  const userInitial = currentUser?.username ? currentUser.username.substring(0, 1).toUpperCase() : "VP";


  return (
    <>
      <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
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
              <p className="text-xs text-muted-foreground">Create your first conversation to start.</p>
            </div>
          )}
           {filteredConversations.length === 0 && searchTerm !== '' && (sidebarState === 'expanded' || isMobile) && (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-muted-foreground">No conversations found for "{searchTerm}".</p>
            </div>
          )}

          <div className="space-y-1">
            {filteredConversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={cn(
                    "group relative flex flex-col p-3 rounded-md cursor-pointer transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                     (sidebarState === 'collapsed' && !isMobile) && "items-center !p-2"
                  )}
                  title={conv.name}
                >
                  {(sidebarState === 'expanded' || isMobile) ? (
                    <>
                      <div className="flex justify-between items-start">
                        <span className={cn("font-semibold text-sm truncate", isActive ? "text-primary-foreground" : "text-foreground")}>{conv.name}</span>
                        {isActive && (
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <button onClick={(e) => handleRename(conv.id, e)} className={cn("p-1 rounded hover:bg-primary/80", isActive ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")} aria-label="Rename conversation">
                              <Pencil size={14} />
                            </button>
                            <button onClick={(e) => handleDeleteInitiate(conv.id, e)} className={cn("p-1 rounded hover:bg-primary/80", isActive ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")} aria-label="Delete conversation">
                              <Trash2 size={14} />
                            </button>
                            <span className="w-2 h-2 bg-green-400 rounded-full shrink-0"></span>
                          </div>
                        )}
                      </div>
                      <p className={cn("text-xs truncate", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                        {conv.messages.length > 1 && conv.messages[conv.messages.length-1].sender === 'user' 
                         ? `You: ${(conv.messages[conv.messages.length-1].content as string)?.substring(0,30)}...`
                         : conv.messages.length > 1 && conv.messages[conv.messages.length-1].sender === 'bot'
                         ? `AI: ${(conv.messages[conv.messages.length-1].content as any)?.text?.substring(0,30)}...`
                         : "Click to continue conversation..."
                        }
                      </p>
                      <p className={cn("text-xs mt-0.5", isActive ? "text-primary-foreground/70" : "text-muted-foreground/80")}>
                        {formatDistanceToNow(new Date(conv.lastActivity || conv.createdAt), { addSuffix: true })}
                      </p>
                    </>
                  ) : (
                     <MessageSquareText className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-sidebar-foreground" )} />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

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

      <AlertDialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-destructive h-6 w-6" />
              <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConversationToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
