"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  MessageSquare,
  Calendar
} from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  conversationTitle: string;
  isTitleEditing: boolean;
  onNewConversation: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (title: string) => void;
  onStartTitleEdit: () => void;
  onCancelTitleEdit: () => void;
  className?: string;
}

export function ConversationHistory({
  conversations,
  activeConversationId,
  conversationTitle,
  isTitleEditing,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
  onUpdateTitle,
  onStartTitleEdit,
  onCancelTitleEdit,
  className = ""
}: ConversationHistoryProps) {
  const [editingTitle, setEditingTitle] = useState(conversationTitle);

  const handleSaveTitle = () => {
    onUpdateTitle(editingTitle);
  };

  const handleCancelEdit = () => {
    setEditingTitle(conversationTitle);
    onCancelTitleEdit();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Conversations
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNewConversation}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Active Conversation Title Editor */}
        {activeConversationId && (
          <div className="p-3 bg-muted/50 rounded-lg border-2 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Current Chat</span>
            </div>
            
            {isTitleEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className="flex-1 h-8 text-sm"
                  placeholder="Enter conversation title..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSaveTitle();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                  <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate flex-1">
                  {conversationTitle || 'Untitled Conversation'}
                </span>
                <Button size="sm" variant="ghost" onClick={onStartTitleEdit}>
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Conversation List */}
        {conversations.length === 0 ? (
          <div className="text-center py-6">
            <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-3">
              <MessageSquare className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              No conversations yet
            </p>
            <Button variant="outline" size="sm" onClick={onNewConversation}>
              Start your first chat
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                  activeConversationId === conversation.id 
                    ? 'border-primary/50 bg-primary/5' 
                    : 'border-border hover:border-primary/30'
                }`}
                onClick={() => onLoadConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {conversation.title || 'Untitled Conversation'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(conversation.updated_at)}
                      </div>
                      {conversation.message_count && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {conversation.message_count} messages
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}