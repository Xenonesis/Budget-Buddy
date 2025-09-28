"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Paperclip, 
  Menu,
  Sparkles
} from "lucide-react";
import { AIMessage, AIModelConfig, FinancialInsight, AIProvider } from "@/lib/ai";
import { AIProviderModelSelector } from "./AIProviderModelSelector";
import { VoiceInterface } from "./VoiceInterface";
import { TypingIndicator } from "./TypingIndicator";
import { InsightMessage } from "./InsightMessage";
import { MessageRenderer } from "./MessageRenderer";

interface ChatInterfaceProps {
  readonly messages: AIMessage[];
  readonly loading: boolean;
  readonly currentModelConfig: AIModelConfig;
  readonly availableProviders: AIProvider[];
  readonly availableModels: Record<string, any[]>;
  readonly loadingModels: Record<string, boolean>;
  readonly insights?: FinancialInsight[];
  readonly quotaStatus?: any;
  readonly onSendMessage: (message: string) => Promise<string | null> | void;
  readonly onModelConfigChange: (provider: AIProvider, model: string) => void;
  readonly onToggleSidebar: () => void;
  readonly className?: string;
}

export function ChatInterface({ 
  messages, 
  loading, 
  currentModelConfig,
  availableProviders,
  availableModels,
  loadingModels,
  insights = [],
  quotaStatus,
  onSendMessage, 
  onModelConfigChange,
  onToggleSidebar,
  className = "" 
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakFunctionRef = useRef<((text: string) => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle voice transcript
  const handleVoiceTranscript = (text: string) => {
    setCurrentTranscript("");
    setInputMessage(text);
    
    // Auto-send if the transcript seems complete
    if (/[.!?]$/.exec(text.trim())) {
      setTimeout(() => {
        if (!loading) {
          onSendMessage(text.trim());
          setInputMessage("");
        }
      }, 500);
    }
  };

  const handleVoiceStateChange = (listening: boolean) => {
    setIsListening(listening);
    if (!listening) {
      setCurrentTranscript("");
    }
  };

  const handleTranscriptUpdate = (transcript: string) => {
    setCurrentTranscript(transcript);
  };

  const handleSpeakTextSetup = (speakFunction: (text: string) => void) => {
    speakFunctionRef.current = speakFunction;
  };

  const handleSend = () => {
    if (inputMessage.trim() && !loading) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === 'Escape') {
      setInputMessage("");
      inputRef.current?.blur();
    }
  };

  const handleSpeakMessage = (messageContent: string) => {
    if (speakFunctionRef.current) {
      speakFunctionRef.current(messageContent);
    }
  };

  // Filter out system messages for display (only if the first message is actually a system message)
  const displayMessages = messages.length > 0 && messages[0].role === 'system' 
    ? messages.slice(1) 
    : messages;

  return (
    <div className={`flex flex-col h-screen bg-background ${className}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0 lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">Financial Assistant</h1>
              <p className="text-xs text-muted-foreground">
                {currentModelConfig.provider.toUpperCase()} • {currentModelConfig.model}
              </p>
            </div>
          </div>
        </div>

        {/* Model Selector & Quota Status */}
        <div className="flex items-center gap-2">
          {quotaStatus?.status && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                quotaStatus.status.canMakeRequest 
                  ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              }`}
            >
              <div className={`w-2 h-2 rounded-full mr-1 ${
                quotaStatus.status.canMakeRequest ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              {quotaStatus.status.usage}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></div>
            Active
          </Badge>
          
          <AIProviderModelSelector
            currentProvider={currentModelConfig.provider}
            currentModel={currentModelConfig.model}
            availableProviders={availableProviders}
            availableModels={availableModels}
            loadingModels={loadingModels}
            onChange={onModelConfigChange}
            disabled={loading}
            className="flex-shrink-0"
          />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={messagesContainerRef}
          className="h-full overflow-y-auto p-6 space-y-6"
        >
          {displayMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              {availableProviders.length === 0 ? (
                <>
                  <h3 className="text-xl font-semibold mb-3 text-orange-600 dark:text-orange-400">
                    AI Assistant Setup Required
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-8">
                    To use the AI financial assistant, you need to configure at least one AI provider in your settings. 
                    Add your API keys for services like OpenAI, Anthropic, or Gemini to get started.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-3">
                    Hello there! How can I help you today?
                  </h3>
                  <p className="text-muted-foreground max-w-md mb-8">
                    I'm your AI financial assistant. Ask me anything about your finances, budgets, spending patterns, 
                    or get personalized advice.
                  </p>
                </>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                <Button
                  variant="outline"
                  onClick={() => onSendMessage("Show me my spending analysis")}
                  disabled={loading}
                  className="h-12 justify-start text-left bg-background/50 hover:bg-muted/50 border border-border/50"
                >
                  Show me my spending analysis
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSendMessage("How can I save more money?")}
                  disabled={loading}
                  className="h-12 justify-start text-left bg-background/50 hover:bg-muted/50 border border-border/50"
                >
                  How can I save more money?
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSendMessage("Create a budget plan for me")}
                  disabled={loading}
                  className="h-12 justify-start text-left bg-background/50 hover:bg-muted/50 border border-border/50"
                >
                  Create a budget plan for me
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onSendMessage("What financial advice do you have?")}
                  disabled={loading}
                  className="h-12 justify-start text-left bg-background/50 hover:bg-muted/50 border border-border/50"
                >
                  What financial advice do you have?
                </Button>
              </div>
            </div>
          ) : (
            <>
              {displayMessages.map((message, index) => {
                const actionHandler = (action: string, insight: any) => {
                  if (action === 'tell-me-more') {
                    onSendMessage(`Tell me more about ${insight.title.toLowerCase()}`);
                  } else if (action === 'take-action') {
                    let actionText = 'improve my budget';
                    if (insight.type === 'saving_suggestion') {
                      actionText = 'save more money';
                    } else if (insight.type === 'budget_warning') {
                      actionText = 'reduce my spending';
                    }
                    onSendMessage(`How can I ${actionText}?`);
                  }
                };

                return (
                  <div 
                    key={`message-${index}-${message.content.slice(0, 20)}`} 
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`
                      max-w-[80%] rounded-2xl p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-muted/50'
                      }
                    `}>
                      {message.role === 'assistant' && 
                       insights.length > 0 && 
                       (message.content.toLowerCase().includes('insight') || 
                        message.content.toLowerCase().includes('analysis')) ? (
                        <InsightMessage 
                          insights={insights}
                          onActionClick={actionHandler}
                        />
                      ) : (
                        <MessageRenderer
                          content={message.content}
                          role={message.role as 'user' | 'assistant'}
                          onSpeak={message.role === 'assistant' ? handleSpeakMessage : undefined}
                        />
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl p-4">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Interface */}
      <div className="px-6 py-2 border-t border-border/50">
        <VoiceInterface
          onTranscriptAction={handleVoiceTranscript}
          onSpeakTextAction={handleSpeakTextSetup}
          onListeningChangeAction={handleVoiceStateChange}
          onTranscriptUpdateAction={handleTranscriptUpdate}
          disabled={loading}
          className="justify-center mb-2"
        />
        
        {/* Voice feedback */}
        {isListening && (
          <div className="text-center text-sm text-primary mb-2">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Listening for your voice...
              {currentTranscript && (
                <span className="ml-2 text-muted-foreground italic">
                  "{currentTranscript}"
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Suggested prompts */}
          <div className="mb-4 flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendMessage("Show me my spending analysis")}
              disabled={loading}
              className="text-xs h-8 bg-background hover:bg-muted/50"
            >
              Show me my spending analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendMessage("How can I save more money?")}
              disabled={loading}
              className="text-xs h-8 bg-background hover:bg-muted/50"
            >
              How can I save more money?
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendMessage("Create a budget plan for me")}
              disabled={loading}
              className="text-xs h-8 bg-background hover:bg-muted/50"
            >
              Create a budget plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendMessage("What financial advice do you have?")}
              disabled={loading}
              className="text-xs h-8 bg-background hover:bg-muted/50"
            >
              Financial advice
            </Button>
          </div>

          <div className="relative">
            <div className="flex gap-2 items-end bg-background border border-border rounded-2xl p-2 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 flex-shrink-0"
                disabled
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Send a message..."
                  disabled={loading}
                  className="border-0 bg-transparent h-10 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
                />
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Context Usage */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground hidden sm:flex items-center gap-1"
                  disabled
                >
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  0.00% of model context used
                </Button>
                
                <Button 
                  onClick={handleSend} 
                  disabled={loading || !inputMessage.trim()}
                  size="sm"
                  className="h-10 w-10 p-0 rounded-xl transition-all hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}