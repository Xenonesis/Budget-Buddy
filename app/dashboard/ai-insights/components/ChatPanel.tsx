"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Settings, Volume2, VolumeX, BarChart3, Sparkles, MessageCircle } from "lucide-react";
import { AIMessage, AIModelConfig, FinancialInsight } from "@/lib/ai";
import { ModelSelector } from "./ModelSelector";
import { VoiceInterface } from "./VoiceInterface";
import { TypingIndicator } from "./TypingIndicator";
import { InsightMessage } from "./InsightMessage";
import { MessageRenderer } from "./MessageRenderer";

interface ChatPanelProps {
  readonly messages: AIMessage[];
  readonly loading: boolean;
  readonly currentModelConfig: AIModelConfig;
  readonly availableProviders: string[];
  readonly availableModels: Record<string, any[]>;
  readonly loadingModels: Record<string, boolean>;
  readonly insights?: FinancialInsight[];
  readonly onSendMessageAction: (message: string) => Promise<string | null> | void;
  readonly onModelConfigChangeAction: (provider: string | undefined, model: string) => void;
  readonly onRequestInsights?: () => void;
  readonly className?: string;
}

export function ChatPanel({ 
  messages, 
  loading, 
  currentModelConfig,
  availableProviders,
  availableModels,
  loadingModels,
  insights = [],
  onSendMessageAction, 
  onModelConfigChangeAction,
  onRequestInsights,
  className = "" 
}: ChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakFunctionRef = useRef<((text: string) => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-speak AI responses when enabled
  useEffect(() => {
    if (autoSpeak && messages.length > 0 && speakFunctionRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !loading) {
        speakFunctionRef.current(lastMessage.content);
      }
    }
  }, [messages, autoSpeak, loading]);

  // Handle real-time transcript updates
  const handleTranscriptUpdate = (transcript: string) => {
    setCurrentTranscript(transcript);
  };

  // Handle voice transcript with real-time updates
  const handleVoiceTranscript = (text: string) => {
    setCurrentTranscript("");
    const newMessage = inputMessage + (inputMessage ? ' ' : '') + text;
    setInputMessage(newMessage);
    
    // Auto-send if the transcript seems complete (ends with punctuation)
    if (/[.!?]$/.exec(text.trim())) {
      setTimeout(() => {
        if (!loading) {
          onSendMessageAction(newMessage.trim());
          setInputMessage("");
          setCurrentTranscript("");
        }
      }, 1000); // Wait 1 second for user to add more
    }
  };

  // Handle voice state changes
  const handleVoiceStateChange = (listening: boolean, transcript: string = "") => {
    setIsListening(listening);
    if (!listening) {
      setCurrentTranscript("");
    }
  };

  const handleSpeakTextSetup = (speakFunction: (text: string) => void) => {
    speakFunctionRef.current = speakFunction;
  };

  const handleSend = () => {
    if (inputMessage.trim() && !loading) {
      onSendMessageAction(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeakMessage = (messageContent: string) => {
    if (speakFunctionRef.current) {
      speakFunctionRef.current(messageContent);
    }
  };

  // Filter out system messages for display
  const displayMessages = messages.slice(1);

  return (
    <Card className={`flex flex-col h-full ${className} bg-gradient-to-br from-background via-background to-muted/20 border-2 shadow-lg`}>
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-full blur-sm opacity-20"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
            <div>
              <div className="font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI Financial Assistant
              </div>
              <div className="text-xs text-muted-foreground font-normal">
                Your intelligent finance companion
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              {currentModelConfig.provider}
            </Badge>
            {onRequestInsights && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestInsights}
                disabled={loading}
                className="text-xs hover:bg-primary/10 hover:border-primary/30 transition-all"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Show Insights
              </Button>
            )}
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className="text-xs transition-all hover:scale-105"
            >
              {autoSpeak ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
              Auto-speak
            </Button>
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3 text-muted-foreground" />
              <ModelSelector
                provider={currentModelConfig.provider}
                model={currentModelConfig.model}
                availableModels={availableModels}
                loadingModels={loadingModels}
                onChange={onModelConfigChangeAction}
                disabled={loading}
                className="w-auto min-w-[120px]"
              />
            </div>
          </div>
        </div>
        
        {/* Voice Interface */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-center mb-3">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <MessageCircle className="h-3 w-3" />
              Ask me anything about your finances using voice or text
            </p>
          </div>
          <VoiceInterface
            onTranscriptAction={handleVoiceTranscript}
            onSpeakTextAction={handleSpeakTextSetup}
            onListeningChangeAction={handleVoiceStateChange}
            onTranscriptUpdateAction={handleTranscriptUpdate}
            disabled={loading}
            className="justify-center"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6 min-h-0 bg-gradient-to-b from-background/50 to-muted/10">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full blur-xl"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Ready to chat about your finances!
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
                I'm your AI financial assistant. Ask me anything about your finances, budgets, spending patterns, 
                or get personalized advice. I can help you make smarter financial decisions.
              </p>
              
              {/* Enhanced Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("Show me my financial insights")}
                  disabled={loading}
                  className="text-xs h-12 bg-gradient-to-br from-primary/5 to-blue-50/50 hover:from-primary/10 hover:to-blue-100/80 border-primary/20 hover:border-primary/40 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Financial Insights</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("How much did I spend this month?")}
                  disabled={loading}
                  className="text-xs h-12 bg-gradient-to-br from-green-50/50 to-emerald-50/50 hover:from-green-100/80 hover:to-emerald-100/80 border-green-200/50 hover:border-green-300/70 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-lg group-hover:scale-110 transition-transform">💰</div>
                    <span className="font-medium text-green-700">Monthly Spending</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("Give me budget recommendations")}
                  disabled={loading}
                  className="text-xs h-12 bg-gradient-to-br from-purple-50/50 to-pink-50/50 hover:from-purple-100/80 hover:to-pink-100/80 border-purple-200/50 hover:border-purple-300/70 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-lg group-hover:scale-110 transition-transform">💡</div>
                    <span className="font-medium text-purple-700">Budget Tips</span>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("What are some ways I can save money?")}
                  disabled={loading}
                  className="text-xs h-12 bg-gradient-to-br from-orange-50/50 to-yellow-50/50 hover:from-orange-100/80 hover:to-yellow-100/80 border-orange-200/50 hover:border-orange-300/70 transition-all hover:scale-[1.02] group"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="text-lg group-hover:scale-110 transition-transform">🎯</div>
                    <span className="font-medium text-orange-700">Save Money</span>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((message, index) => {
                const messageKey = `message-${index}-${message.content.slice(0, 20)}`;
                const actionHandler = (action: string, insight: any) => {
                  if (action === 'tell-me-more') {
                    onSendMessageAction(`Tell me more about ${insight.title.toLowerCase()}`);
                  } else if (action === 'take-action') {
                    let actionText = 'improve my budget';
                    if (insight.type === 'saving_suggestion') {
                      actionText = 'save more money';
                    } else if (insight.type === 'budget_warning') {
                      actionText = 'reduce my spending';
                    }
                    onSendMessageAction(`How can I ${actionText}?`);
                  }
                };

                return (
                <div 
                  key={messageKey} 
                  className={`flex gap-4 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex-1 min-w-0 max-w-[85%] rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md group ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto shadow-primary/20' 
                      : 'bg-card/80 backdrop-blur border border-border/50 shadow-black/5'
                  }`}>
                    <div className="p-4">
                      {/* Enhanced message rendering */}
                      {message.role === 'assistant' && 
                       insights.length > 0 && 
                       (message.content.toLowerCase().includes('insight') || 
                        message.content.toLowerCase().includes('analysis') ||
                        message.content.toLowerCase().includes('budget') ||
                        message.content.toLowerCase().includes('spending')) ? (
                        <div className="space-y-4">
                          <InsightMessage 
                            insights={insights}
                            onActionClick={actionHandler}
                          />
                        </div>
                      ) : (
                        <MessageRenderer
                          content={message.content}
                          role={message.role as 'user' | 'assistant'}
                          onSpeak={message.role === 'assistant' ? handleSpeakMessage : undefined}
                        />
                      )}
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center shadow-lg ring-2 ring-muted-foreground/10">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                );
              })}
              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-4 shadow-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Enhanced Input Area */}
        <div className="border-t bg-gradient-to-r from-background via-muted/10 to-background p-6">
          {/* Voice Listening Feedback */}
          {isListening && (
            <div className="mb-4 flex items-center gap-3 text-sm bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4 shadow-sm">
              <div className="relative">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <div className="flex-1">
                <span className="text-blue-700 dark:text-blue-300 font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Listening for your voice...
                </span>
                {currentTranscript && (
                  <div className="text-blue-600 dark:text-blue-400 italic mt-1 text-xs">
                    "{currentTranscript}"
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Speak clearly..." : "Ask me anything about your finances..."}
                disabled={loading}
                className={`h-12 px-4 text-sm bg-background/80 backdrop-blur border-2 transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  isListening 
                    ? "border-blue-300 dark:border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 focus:border-blue-500 shadow-blue-200/50 shadow-lg" 
                    : "border-border/50 hover:border-border focus:border-primary/50 shadow-sm hover:shadow-md"
                } ${inputMessage.trim() ? "border-primary/30" : ""}`}
              />
              {/* Enhanced Voice indicator in input */}
              {isListening && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-4 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              )}
            </div>
            <Button 
              onClick={handleSend} 
              disabled={loading || !inputMessage.trim()}
              size="lg"
              className="h-12 px-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span className="text-xs font-medium">Send</span>
                </div>
              )}
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground flex items-center gap-4">
              <span>Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> to send</span>
              <span><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Enter</kbd> for new line</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {inputMessage.length > 0 && (
                <span className="text-primary font-medium">{inputMessage.length} chars</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}