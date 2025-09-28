"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  MessageCircle, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Clock,
  Search,
  Filter,
  MoreVertical,
  Calendar
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConversationHistoryProps {
  conversations: any[];
  activeConversationId: string | null;
  conversationTitle: string;
  isTitleEditing: boolean;
  onNewConversation: () => void;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [showSearchFilter, setShowSearchFilter] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isTitleEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isTitleEditing]);

  // Set editing title when editing starts
  useEffect(() => {
    if (isTitleEditing) {
      setEditingTitle(conversationTitle);
    }
  }, [isTitleEditing, conversationTitle]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveTitle = () => {
    if (activeConversationId && editingTitle.trim()) {
      onUpdateTitle(activeConversationId, editingTitle.trim());
    }
  };

  const handleCancelEdit = () => {
    setEditingTitle("");
    onCancelTitleEdit();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const formatConversationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <Card className={`flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/10 border-2 shadow-lg ${className}`}>
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-muted/20 via-muted/10 to-background">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-sm"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <div className="font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Conversations
              </div>
              <div className="text-xs text-muted-foreground font-normal">
                {conversations.length} total
              </div>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSearchFilter(!showSearchFilter)}
              className="h-8 w-8 p-0 lg:hidden"
              title="Search & Filter"
            >
              <Search className="h-3 w-3" />
            </Button>
            
            <Button
              onClick={onNewConversation}
              size="sm"
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">New</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter - Always visible on desktop, toggleable on mobile */}
        <div className={`space-y-3 ${showSearchFilter || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'block' : 'hidden lg:block'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 bg-background/60 border-border/50 focus:border-primary/50 transition-all"
            />
          </div>
          
          {searchTerm && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Found {filteredConversations.length} conversations</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm("")}
                className="h-6 px-2 text-xs"
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Active Conversation Title Editor */}
        {activeConversationId && (
          <div className="pt-3 border-t border-border/30">
            {isTitleEditing ? (
              <div className="space-y-2">
                <Input
                  ref={editInputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter conversation title..."
                  className="h-8 text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveTitle}
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {conversationTitle || "Untitled Conversation"}
                  </p>
                  <p className="text-xs text-muted-foreground">Current conversation</p>
                </div>
                <Button
                  onClick={onStartTitleEdit}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              {conversations.length === 0 ? (
                <>
                  <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <MessageCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                    Start a new conversation with your AI financial assistant to get personalized help and insights.
                  </p>
                  <Button
                    onClick={onNewConversation}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Start Your First Chat
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try adjusting your search terms
                  </p>
                  <Button
                    onClick={() => setSearchTerm("")}
                    variant="outline"
                  >
                    Clear Search
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                
                return (
                  <div
                    key={conversation.id}
                    className={`group relative rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                      isActive 
                        ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                        : 'border-border/50 bg-card/50 hover:border-border hover:bg-card'
                    }`}
                    onClick={() => onLoadConversation(conversation.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-sm font-medium truncate ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}>
                              {conversation.title || `Chat ${conversation.id.slice(0, 8)}`}
                            </h4>
                            {isActive && (
                              <Badge variant="secondary" className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20">
                                Active
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatConversationDate(conversation.updated_at)}</span>
                            <span className="text-border">•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(conversation.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conversation.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            title="Delete conversation"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-blue-600 rounded-r-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}