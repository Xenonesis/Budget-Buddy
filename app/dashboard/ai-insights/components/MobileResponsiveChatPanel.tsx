"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, Volume2, VolumeX, BarChart3, Sparkles, MessageCircle, Settings, Maximize2, Minimize2 } from "lucide-react";
import { AIMessage, AIModelConfig, FinancialInsight, AIProvider } from "@/lib/ai";
import { AIProviderModelSelector } from "./AIProviderModelSelector";
import { VoiceInterface } from "./VoiceInterface";
import { TypingIndicator } from "./TypingIndicator";
import { InsightMessage } from "./InsightMessage";
import { MessageRenderer } from "./MessageRenderer";

interface MobileResponsiveChatPanelProps {
  readonly messages: AIMessage[];
  readonly loading: boolean;
  readonly currentModelConfig: AIModelConfig;
  readonly availableProviders: AIProvider[];
  readonly availableModels: Record<string, any[]>;
  readonly loadingModels: Record<string, boolean>;
  readonly insights?: FinancialInsight[];
  readonly onSendMessageAction: (message: string) => Promise<string | null> | void;
  readonly onModelConfigChangeAction: (provider: AIProvider, model: string) => void;
  readonly onRequestInsights?: () => void;
  readonly className?: string;
  readonly isMobile: boolean;
}

export function MobileResponsiveChatPanel({ 
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
  className = "",
  isMobile
}: MobileResponsiveChatPanelProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Quick action suggestions
  const quickActions = [
    {
      text: "Show me my financial insights",
      icon: BarChart3,
      gradient: "from-primary/5 to-blue-50/50",
      hoverGradient: "from-primary/10 to-blue-100/80",
      borderColor: "border-primary/20",
      hoverBorderColor: "border-primary/40",
      iconColor: "text-primary"
    },
    {
      text: "How much did I spend this month?",
      emoji: "💰",
      gradient: "from-green-50/50 to-emerald-50/50",
      hoverGradient: "from-green-100/80 to-emerald-100/80",
      borderColor: "border-green-200/50",
      hoverBorderColor: "border-green-300/70",
      textColor: "text-green-700"
    },
    {
      text: "Give me budget recommendations",
      emoji: "💡",
      gradient: "from-purple-50/50 to-pink-50/50",
      hoverGradient: "from-purple-100/80 to-pink-100/80",
      borderColor: "border-purple-200/50",
      hoverBorderColor: "border-purple-300/70",
      textColor: "text-purple-700"
    },
    {
      text: "What are some ways I can save money?",
      emoji: "🎯",
      gradient: "from-orange-50/50 to-yellow-50/50",
      hoverGradient: "from-orange-100/80 to-yellow-100/80",
      borderColor: "border-orange-200/50",
      hoverBorderColor: "border-orange-300/70",
      textColor: "text-orange-700"
    }
  ];

  return (
    <Card className={`flex flex-col h-full bg-gradient-to-br from-background via-background to-muted/20 border-2 shadow-lg ${
      isFullscreen && isMobile ? 'fixed inset-0 z-50 rounded-none' : ''
    } ${className}`}>
      <CardHeader className={`border-b bg-gradient-to-r from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10 ${
        isMobile ? 'pb-3' : 'pb-4'
      }`}>
        <div className="flex items-center justify-between">
          <CardTitle className={`flex items-center gap-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-full blur-sm opacity-20"></div>
              <div className={`relative bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center ${
                isMobile ? 'w-6 h-6' : 'w-8 h-8'
              }`}>
                <Sparkles className={`text-white ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
              </div>
            </div>
            <div>
              <div className="font-semibold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI Financial Assistant
              </div>
              <div className={`text-muted-foreground font-normal ${isMobile ? 'text-xs' : 'text-xs'}`}>
                Your intelligent finance companion
              </div>
            </div>
          </CardTitle>

          <div className="flex items-center gap-2">
            {/* Mobile Settings Toggle */}
            {isMobile && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0"
                >
                  {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              </>
            )}

            {/* Desktop Controls */}
            {!isMobile && (
              <>
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
                <AIProviderModelSelector
                  currentProvider={currentModelConfig.provider}
                  currentModel={currentModelConfig.model}
                  availableProviders={availableProviders}
                  availableModels={availableModels}
                  loadingModels={loadingModels}
                  onChange={onModelConfigChangeAction}
                  disabled={loading}
                  className="flex-shrink-0"
                />
              </>
            )}
          </div>
        </div>

        {/* Mobile Settings Panel */}
        {isMobile && showSettings && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auto-speak responses</span>
              <Button
                variant={autoSpeak ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoSpeak(!autoSpeak)}
                className="text-xs"
              >
                {autoSpeak ? <Volume2 className="h-3 w-3 mr-1" /> : <VolumeX className="h-3 w-3 mr-1" />}
                {autoSpeak ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm font-medium">AI Model</span>
              <AIProviderModelSelector
                currentProvider={currentModelConfig.provider}
                currentModel={currentModelConfig.model}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                onChange={onModelConfigChangeAction}
                disabled={loading}
                className="w-full"
              />
            </div>
          </div>
        )}
        
        {/* Voice Interface */}
        <div className={`pt-3 border-t border-border/50 ${isMobile ? 'mt-3' : 'mt-4'}`}>
          <div className="text-center mb-3">
            <p className={`text-muted-foreground flex items-center justify-center gap-1 ${isMobile ? 'text-xs' : 'text-xs'}`}>
              <MessageCircle className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} />
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
        <div className={`flex-1 overflow-y-auto overflow-x-hidden space-y-4 min-h-0 bg-gradient-to-b from-background/50 to-muted/10 ${
          isMobile ? 'p-4' : 'p-6 space-y-6'
        }`}>
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full blur-xl"></div>
                <div className={`relative bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center shadow-lg ${
                  isMobile ? 'w-12 h-12' : 'w-16 h-16'
                }`}>
                  <Bot className={`text-white ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
                </div>
              </div>
              <h3 className={`font-semibold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Ready to chat about your finances!
              </h3>
              <p className={`text-muted-foreground max-w-md mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-sm'}`}>
                I'm your AI financial assistant. Ask me anything about your finances, budgets, spending patterns, 
                or get personalized advice.
              </p>
              
              {/* Quick Action Buttons */}
              <div className={`grid gap-3 w-full max-w-lg ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessageAction(action.text)}
                    disabled={loading}
                    className={`text-xs bg-gradient-to-br ${action.gradient} hover:${action.hoverGradient} ${action.borderColor} hover:${action.hoverBorderColor} transition-all hover:scale-[1.02] group ${
                      isMobile ? 'h-10 justify-start' : 'h-12'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${isMobile ? '' : 'flex-col'}`}>
                      {action.icon ? (
                        <action.icon className={`group-hover:scale-110 transition-transform ${action.iconColor} ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                      ) : (
                        <div className={`group-hover:scale-110 transition-transform ${isMobile ? 'text-base' : 'text-lg'}`}>
                          {action.emoji}
                        </div>
                      )}
                      <span className={`font-medium ${action.textColor || ''} ${isMobile ? 'text-left' : ''}`}>
                        {isMobile ? action.text : action.text.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  </Button>
                ))}
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
                  className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${
                    isMobile ? 'gap-2' : 'gap-4'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {message.role === 'assistant' && (
                    <div className={`flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-primary/20 ${
                      isMobile ? 'w-8 h-8' : 'w-10 h-10'
                    }`}>
                      <Bot className={`text-white ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    </div>
                  )}
                  
                  <div className={`flex-1 min-w-0 max-w-[85%] rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md group ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto shadow-primary/20' 
                      : 'bg-card/80 backdrop-blur border border-border/50 shadow-black/5'
                  }`}>
                    <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
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
                    <div className={`flex-shrink-0 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center shadow-lg ring-2 ring-muted-foreground/10 ${
                      isMobile ? 'w-8 h-8' : 'w-10 h-10'
                    }`}>
                      <User className={`text-muted-foreground ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    </div>
                  )}
                </div>
                );
              })}
              {loading && (
                <div className={`flex justify-start ${isMobile ? 'gap-2' : 'gap-4'}`}>
                  <div className={`flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg ring-2 ring-primary/20 ${
                    isMobile ? 'w-8 h-8' : 'w-10 h-10'
                  }`}>
                    <Bot className={`text-white ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
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
        <div className={`border-t bg-gradient-to-r from-background via-muted/10 to-background ${isMobile ? 'p-4' : 'p-6'}`}>
          {/* Voice Listening Feedback */}
          {isListening && (
            <div className={`flex items-center gap-3 text-sm bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-700/50 rounded-xl shadow-sm ${
              isMobile ? 'mb-3 p-3' : 'mb-4 p-4'
            }`}>
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
          
          <div className={`flex ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Speak clearly..." : "Ask me anything about your finances..."}
                disabled={loading}
                className={`text-sm bg-background/80 backdrop-blur border-2 transition-all duration-300 focus:ring-2 focus:ring-primary/20 ${
                  isListening 
                    ? "border-blue-300 dark:border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 focus:border-blue-500 shadow-blue-200/50 shadow-lg" 
                    : "border-border/50 hover:border-border focus:border-primary/50 shadow-sm hover:shadow-md"
                } ${inputMessage.trim() ? "border-primary/30" : ""} ${
                  isMobile ? 'h-10 px-3' : 'h-12 px-4'
                }`}
              />
              {/* Voice indicator in input */}
              {isListening && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
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
              size={isMobile ? "default" : "lg"}
              className={`bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:hover:scale-100 ${
                isMobile ? 'h-10 px-4' : 'h-12 px-6'
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className={`animate-spin ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {!isMobile && <span className="text-xs">Thinking...</span>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {!isMobile && <span className="text-xs font-medium">Send</span>}
                </div>
              )}
            </Button>
          </div>
          
          {!isMobile && (
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
          )}
        </div>
      </CardContent>
    </Card>
  );
}