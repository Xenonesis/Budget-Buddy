"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Loader2, MessageSquare, Settings, Volume2, VolumeX, BarChart3 } from "lucide-react";
import { AIMessage, AIModelConfig, FinancialInsight } from "@/lib/ai";
import { ModelSelector } from "./ModelSelector";
import { VoiceInterface } from "./VoiceInterface";
import { TypingIndicator } from "./TypingIndicator";
import { InsightMessage } from "./InsightMessage";

interface ChatPanelProps {
  messages: AIMessage[];
  loading: boolean;
  currentModelConfig: AIModelConfig;
  availableProviders: string[];
  availableModels: Record<string, any[]>;
  loadingModels: Record<string, boolean>;
  insights?: FinancialInsight[];
  onSendMessageAction: (message: string) => Promise<string | null> | void;
  onModelConfigChangeAction: (provider: string | undefined, model: string) => void;
  onRequestInsights?: () => void;
  className?: string;
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
  const [isSpeaking, setIsSpeaking] = useState(false);
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
    if (text.trim().match(/[.!?]$/)) {
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentModelConfig.provider}
            </Badge>
            {onRequestInsights && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRequestInsights}
                disabled={loading}
                className="text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Show Insights
              </Button>
            )}
            <Button
              variant={autoSpeak ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoSpeak(!autoSpeak)}
              className="text-xs"
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
        <div className="mt-3 pt-3 border-t">
          <div className="text-center mb-3">
            <p className="text-xs text-muted-foreground">
              🎤 Ask me anything about your finances using voice
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Bot className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                Ask me anything about your finances, budgets, spending patterns, or get personalized advice.
              </p>
              
              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("Show me my financial insights")}
                  disabled={loading}
                  className="text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Show Insights
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("How much did I spend this month?")}
                  disabled={loading}
                  className="text-xs"
                >
                  💰 Monthly Spending
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSendMessageAction("Give me budget recommendations")}
                  disabled={loading}
                  className="text-xs"
                >
                  💡 Budget Tips
                </Button>
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <TypingIndicator />
              ) : (
                displayMessages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-3 animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-muted'
                    }`}>
                      {/* Check if this is an insights message and render InsightMessage component */}
                      {message.role === 'assistant' && 
                       insights.length > 0 && 
                       (message.content.toLowerCase().includes('insight') || 
                        message.content.toLowerCase().includes('analysis') ||
                        message.content.toLowerCase().includes('budget') ||
                        message.content.toLowerCase().includes('spending')) ? (
                        <div className="space-y-4">
                          <InsightMessage 
                            insights={insights}
                            onActionClick={(action, insight) => {
                              if (action === 'tell-me-more') {
                                onSendMessageAction(`Tell me more about ${insight.title.toLowerCase()}`);
                              } else if (action === 'take-action') {
                                onSendMessageAction(`How can I ${insight.type === 'saving_suggestion' ? 'save more money' : insight.type === 'budget_warning' ? 'reduce my spending' : 'improve my budget'}?`);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </div>
                      )}
                      {/* Speaker button for AI messages */}
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex justify-end border-t border-muted-foreground/10 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSpeakMessage(message.content)}
                            disabled={loading}
                            className="h-6 px-2 text-xs hover:bg-muted-foreground/10 transition-colors"
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Listen
                          </Button>
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          {/* Voice Listening Feedback */}
          {isListening && (
            <div className="mb-3 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">🎤 Listening...</span>
              {currentTranscript && (
                <span className="text-blue-600 dark:text-blue-400 italic ml-2">"{currentTranscript}"</span>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Speak clearly..." : "Ask about your finances..."}
                disabled={loading}
                className={`transition-all duration-200 ${
                  isListening 
                    ? "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/10 focus:border-blue-500" 
                    : ""
                }`}
              />
              {/* Voice indicator in input */}
              {isListening && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                </div>
              )}
            </div>
            <Button 
              onClick={handleSend} 
              disabled={loading || !inputMessage.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
}