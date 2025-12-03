'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageCircle, Trash2, Settings, Search, X, Clock, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SidebarProps {
  readonly conversations: any[];
  readonly activeConversationId: string | null;
  readonly onNewConversation: () => void;
  readonly onLoadConversation: (id: string) => void;
  readonly onDeleteConversation: (id: string) => void;
  readonly onUpdateTitle?: (id: string, title: string) => void;
  readonly onOpenSettings: () => void;
  readonly quotaStatus?: any;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly className?: string;
}

export function Sidebar({
  conversations,
  activeConversationId,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
  onUpdateTitle,
  onOpenSettings,
  quotaStatus,
  isOpen,
  onToggle,
  className = '',
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter conversations based on search
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatConversationDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <button
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] lg:hidden w-full h-full"
          onClick={onToggle}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-[70] lg:z-auto
        w-80 bg-background/95 backdrop-blur-lg border-r border-border/50
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${className}
        sidebar-mobile-fix
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded flex items-center justify-center">
              <DollarSign className="h-3 w-3 text-white" />
            </div>
            <h2
              className="font-semibold text-lg text-foreground mobile-text-adjust"
              style={{
                WebkitTextSizeAdjust: '100%',
                textSizeAdjust: '100%',
                color: 'hsl(var(--foreground))',
                fontSize: '1.125rem',
              }}
            >
              Budget Buddy
            </h2>
          </div>

          <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0 lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Today Section */}
        <div className="p-4">
          <p
            className="text-xs font-medium text-muted-foreground mb-3 mobile-text-adjust"
            style={{
              WebkitTextSizeAdjust: '100%',
              textSizeAdjust: '100%',
              color: 'hsl(var(--muted-foreground))',
              fontSize: '0.875rem',
            }}
          >
            Today
          </p>

          <Button
            onClick={onNewConversation}
            className="w-full justify-start gap-3 h-9 bg-background hover:bg-muted/50 text-foreground border border-border/30 rounded-lg mobile-text-adjust"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            <span
              className="text-foreground font-medium"
              style={{
                WebkitTextSizeAdjust: '100%',
                textSizeAdjust: '100%',
                color: 'hsl(var(--foreground))',
              }}
            >
              New Chat
            </span>
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-8 bg-background/60 border-border/30 focus:border-primary/50 transition-all rounded-lg text-sm mobile-text-adjust text-foreground placeholder:text-muted-foreground"
              style={{
                WebkitTextSizeAdjust: '100%',
                textSizeAdjust: '100%',
                color: 'hsl(var(--foreground))',
                fontSize: '16px',
              }}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              {conversations.length === 0 ? (
                <div className="text-sm text-muted-foreground mobile-text-adjust">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p
                    className="text-foreground font-medium"
                    style={{
                      WebkitTextSizeAdjust: '100%',
                      textSizeAdjust: '100%',
                      color: 'hsl(var(--foreground))',
                      fontSize: '16px',
                    }}
                  >
                    No conversations yet
                  </p>
                  <p
                    className="text-xs mt-1 px-4 text-muted-foreground mobile-text-adjust"
                    style={{
                      WebkitTextSizeAdjust: '100%',
                      textSizeAdjust: '100%',
                      color: 'hsl(var(--muted-foreground))',
                      fontSize: '14px',
                    }}
                  >
                    Start a new chat with your AI financial assistant to get personalized insights
                    and advice
                  </p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground mobile-text-adjust">
                  <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                  <p
                    className="text-foreground font-medium"
                    style={{
                      WebkitTextSizeAdjust: '100%',
                      textSizeAdjust: '100%',
                      color: 'hsl(var(--foreground))',
                      fontSize: '16px',
                    }}
                  >
                    No matches found
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;

                return (
                  <div
                    key={conversation.id}
                    className={`
                      group relative rounded-lg transition-all duration-200 w-full
                      ${isActive ? 'bg-muted/70 shadow-sm' : 'hover:bg-muted/40'}
                    `}
                  >
                    <button
                      className="w-full p-3 text-left cursor-pointer"
                      onClick={() => onLoadConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate mobile-text-adjust ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}
                            style={{
                              WebkitTextSizeAdjust: '100%',
                              textSizeAdjust: '100%',
                              color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                              fontSize: '16px',
                            }}
                          >
                            {conversation.title || `Chat ${conversation.id.slice(0, 8)}`}
                          </p>

                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p
                              className="text-xs text-muted-foreground mobile-text-adjust"
                              style={{
                                WebkitTextSizeAdjust: '100%',
                                textSizeAdjust: '100%',
                                color: 'hsl(var(--muted-foreground))',
                                fontSize: '14px',
                              }}
                            >
                              {formatConversationDate(
                                conversation.updated_at ||
                                  conversation.last_updated ||
                                  conversation.created_at
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Action buttons - separate from main button */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conversation.id);
                        }}
                        className="h-6 w-6 p-0 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          {/* Quota Status */}
          {quotaStatus && (
            <div className="mb-3 p-2 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between text-xs">
                <span
                  className="text-muted-foreground mobile-text-adjust"
                  style={{
                    WebkitTextSizeAdjust: '100%',
                    textSizeAdjust: '100%',
                    color: 'hsl(var(--muted-foreground))',
                    fontSize: '14px',
                  }}
                >
                  AI Usage
                </span>
                <Badge
                  variant={quotaStatus.status?.canMakeRequest ? 'secondary' : 'destructive'}
                  className="text-xs mobile-text-adjust text-foreground"
                >
                  {quotaStatus.status?.usage || 'Unknown'}
                </Badge>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={onOpenSettings}
              variant="ghost"
              className="w-full justify-start gap-3 h-9 text-foreground mobile-text-adjust"
            >
              <Settings className="h-4 w-4" />
              <span
                className="font-medium"
                style={{
                  WebkitTextSizeAdjust: '100%',
                  textSizeAdjust: '100%',
                  color: 'hsl(var(--foreground))',
                  fontSize: '16px',
                }}
              >
                Settings
              </span>
            </Button>

            {/* Deploy with Vercel style button */}
            <Button
              variant="outline"
              className="w-full justify-center gap-2 h-9 text-xs bg-background hover:bg-muted/50 text-foreground mobile-text-adjust"
              onClick={() => window.open('https://github.com/Xenonesis/Budget-Buddy', '_blank')}
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span
                className="font-medium"
                style={{
                  WebkitTextSizeAdjust: '100%',
                  textSizeAdjust: '100%',
                  color: 'hsl(var(--foreground))',
                  fontSize: '16px',
                }}
              >
                Star on GitHub
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
