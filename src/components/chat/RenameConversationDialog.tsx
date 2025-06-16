// @ts-nocheck
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useChat } from '@/contexts/ChatContext';

interface RenameConversationDialogProps {
  conversationId: string;
  currentName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RenameConversationDialog({
  conversationId,
  currentName,
  isOpen,
  onOpenChange,
}: RenameConversationDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const { renameConversation } = useChat();

  const handleSave = () => {
    if (newName.trim()) {
      renameConversation(conversationId, newName.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Rename Conversation</DialogTitle>
          <DialogDescription>
            Enter a new name for this conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-3"
              aria-label="New conversation name"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSave} className="bg-accent hover:bg-accent/90 text-accent-foreground">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
