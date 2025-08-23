"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserPreferences } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { 
  isAIEnabled, 
  generateGoogleAIInsights,
  getUserQuotaStatus,
  chatWithAI,
  getAvailableAIProviders,
  getAIModelsForProvider,
  getUserAISettings,
  type FinancialInsight,
  type AIMessage,
  type AIModelConfig,
  type AIModel,
  type AIProvider
} from "@/lib/ai";

import {
  QuotaStatusCard,
  InsightsPanel,
  ChatPanel,
  ConversationHistory,
  PageHeader,
  EmptyState,
  LoadingState,
  VoiceInterface
} from "./components";

type LayoutMode = 'default' | 'chat-focus' | 'insights-focus' | 'voice-focus';

export default function AIInsightsPage() {
  const router = useRouter();
  const { userId } = useUserPreferences();

  // Core state
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [insightLoading, setInsightLoading] = useState<boolean>(false);

  // Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    { role: "system", content: "You are a helpful financial assistant." }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);

  // AI Configuration state
  const [currentModelConfig, setCurrentModelConfig] = useState<AIModelConfig>({
    provider: 'mistral',
    model: 'mistral-small'
  });
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [availableModels, setAvailableModels] = useState<Record<string, AIModel[]>>({});
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});

  // UI state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  
  // Voice interface state
  const speakFunctionRef = useRef<((text: string) => void) | null>(null);

  // Initialize data
  useEffect(() => {
    if (userId) {
      initializeData();
    }
  }, [userId]);

  // Welcome message for voice mode
  useEffect(() => {
    if (layoutMode === 'voice-focus' && speakFunctionRef.current) {
      const timer = setTimeout(() => {
        if (speakFunctionRef.current) {
          speakFunctionRef.current(
            "Welcome to your AI financial assistant! I'm here to help with all your money questions. " +
            "You can ask me about your spending, budgets, savings, or anything financial. " +
            "Just click the microphone and start talking!"
          );
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [layoutMode, speakFunctionRef.current]);

  const initializeData = async () => {
    try {
      await Promise.all([
        checkAIEnabled(),
        fetchInsightsAndChats(),
        fetchAISettings(),
        fetchQuotaStatus()
      ]);
    } catch (error) {
      console.error("Error initializing data:", error);
      toast.error("Failed to initialize AI assistant");
    } finally {
      setLoading(false);
    }
  };

  const checkAIEnabled = async () => {
    if (!userId) return;
    try {
      const enabled = await isAIEnabled(userId);
      setAiEnabled(enabled);
    } catch (error) {
      console.error("Error checking AI status:", error);
      setAiEnabled(false);
    }
  };

  const fetchQuotaStatus = async () => {
    if (!userId) return;
    try {
      const status = await getUserQuotaStatus(userId);
      setQuotaStatus(status);
    } catch (error) {
      console.error("Error fetching quota status:", error);
    }
  };

  const fetchAISettings = async () => {
    if (!userId) return;
    try {
      const providers = await getAvailableAIProviders(userId);
      setAvailableProviders(providers);
      
      // Get the user's actual default model from their settings
      const userSettings = await getUserAISettings(userId);
      
      if (userSettings && userSettings.defaultModel) {
        // Use the user's saved default model
        setCurrentModelConfig({
          provider: userSettings.defaultModel.provider as AIProvider,
          model: userSettings.defaultModel.model as AIModel
        });
      } else if (providers.length > 0) {
        // Fallback to first available provider if no default is set
        setCurrentModelConfig({
          provider: providers[0] as AIProvider,
          model: getDefaultModelForProvider(providers[0]) as AIModel
        });
      }
    } catch (error) {
      console.error("Error fetching AI settings:", error);
    }
  };

  const fetchInsightsAndChats = async () => {
    if (!userId) return;
    
    try {
      // Fetch conversations
      const { data: conversationsData } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("last_updated", { ascending: false });
      
      if (conversationsData) {
        setConversations(conversationsData);
      }

      // Fetch financial data for insights
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(100);
        
      const { data: budgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId);
      
      // Generate insights
      if (transactions && budgets) {
        try {
          const generatedInsights = await generateGoogleAIInsights(
            userId, 
            transactions, 
            budgets
          );
          
          if (typeof generatedInsights === 'string') {
            setQuotaError(generatedInsights);
            setInsights([]);
          } else if (generatedInsights) {
            setInsights(generatedInsights);
            setQuotaError(null);
          }
        } catch (error) {
          console.error("Error generating insights:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSendMessage = async (message: string): Promise<string | null> => {
    if (!userId || chatLoading) return null;

    setChatLoading(true);
    const newMessages = [...chatMessages, { role: "user" as const, content: message }];
    setChatMessages(newMessages);

    try {
      // Check if user is asking for insights
      const lowerMessage = message.toLowerCase();
      const insightKeywords = [
        'insights', 'financial insights', 'show insights', 'my insights',
        'spending patterns', 'financial analysis', 'budget analysis',
        'financial overview', 'what insights', 'current insights'
      ];
      
      const isInsightRequest = insightKeywords.some(keyword => 
        lowerMessage.includes(keyword)
      );

      let response: string;

      if (isInsightRequest && insights.length > 0) {
        // Format insights for chat display
        response = formatInsightsForChat(insights);
      } else {
        // Regular AI chat response
        const aiResponse = await chatWithAI(userId, newMessages, currentModelConfig);
        response = aiResponse || "I'm sorry, I couldn't process your request right now.";
      }
      
      if (response) {
        const updatedMessages = [...newMessages, { role: "assistant" as const, content: response }];
        setChatMessages(updatedMessages);
        
        // Save conversation if active
        if (activeConversationId) {
          await saveConversation(activeConversationId, updatedMessages);
        }
        
        return response; // Return the response for voice speaking
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setChatLoading(false);
    }
    
    return null;
  };

  // Handle insights request from chat
  const handleRequestInsights = () => {
    handleSendMessage("Show me my current financial insights");
  };

  const handleRefreshInsights = async () => {
    if (!userId || insightLoading) return;

    setInsightLoading(true);
    try {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(100);
        
      const { data: budgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId);
      
      if (transactions && budgets) {
        const generatedInsights = await generateGoogleAIInsights(
          userId, 
          transactions, 
          budgets
        );
        
        if (typeof generatedInsights === 'string') {
          setQuotaError(generatedInsights);
          setInsights([]);
          toast.error("Quota limit reached");
        } else if (generatedInsights) {
          setInsights(generatedInsights);
          setQuotaError(null);
          toast.success("Insights refreshed successfully");
        } else {
          toast.error("Unable to generate new insights");
        }
      }
    } catch (error) {
      console.error("Error refreshing insights:", error);
      toast.error("Failed to refresh insights");
    } finally {
      setInsightLoading(false);
    }
  };

  const handleModelConfigChange = async (provider: string | undefined, model: string) => {
    const newProvider = (provider || currentModelConfig.provider) as AIProvider;
    setCurrentModelConfig({ provider: newProvider, model: model as AIModel });
    
    // Fetch models for the new provider if not already loaded
    if (!availableModels[newProvider] && !loadingModels[newProvider]) {
      setLoadingModels(prev => ({ ...prev, [newProvider]: true }));
      try {
        const models = await getAIModelsForProvider(newProvider);
        setAvailableModels(prev => ({ ...prev, [newProvider]: models }));
      } catch (error) {
        console.error(`Error fetching models for ${newProvider}:`, error);
      } finally {
        setLoadingModels(prev => ({ ...prev, [newProvider]: false }));
      }
    }
  };

  const handleNewConversation = () => {
    setChatMessages([{ role: "system", content: "You are a helpful financial assistant." }]);
    setActiveConversationId(null);
    setConversationTitle("");
    setIsTitleEditing(false);
  };

  const handleLoadConversation = async (conversationId: string) => {
    try {
      const { data: messages } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (messages) {
        const formattedMessages = [
          { role: "system" as const, content: "You are a helpful financial assistant." },
          ...messages.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content
          }))
        ];
        setChatMessages(formattedMessages);
      }

      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setConversationTitle(conversation.title || "");
        setActiveConversationId(conversationId);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await supabase.from("ai_conversations").delete().eq("id", conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        handleNewConversation();
      }
      
      toast.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    }
  };

  const handleUpdateTitle = async (title: string) => {
    if (!activeConversationId) return;
    
    try {
      await supabase
        .from("ai_conversations")
        .update({ title })
        .eq("id", activeConversationId);
      
      setConversationTitle(title);
      setIsTitleEditing(false);
      
      // Update local state
      setConversations(prev => 
        prev.map(c => c.id === activeConversationId ? { ...c, title } : c)
      );
      
      toast.success("Title updated");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };

  const saveConversation = async (conversationId: string, messages: AIMessage[]) => {
    try {
      // Save messages (excluding system message)
      const messagesToSave = messages.slice(1).map(msg => ({
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content,
        user_id: userId
      }));

      await supabase.from("ai_messages").upsert(messagesToSave);
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const getDefaultModelForProvider = (provider: string): string => {
    const defaults: Record<string, string> = {
      mistral: 'mistral-small',
      anthropic: 'claude-3-5-sonnet',
      groq: 'llama-3.1-8b',
      gemini: 'gemini-1.5-flash',
      openai: 'gpt-4o'
    };
    return defaults[provider] || 'mistral-small';
  };

  // Format insights for chat display
  const formatInsightsForChat = (insights: FinancialInsight[]): string => {
    if (insights.length === 0) {
      return "I don't have any financial insights available right now. Would you like me to generate some fresh insights for you?";
    }

    // Return a minimal message since visual cards will handle the display
    return `💡 I found ${insights.length} financial insights for you:`;
  };

  // Get emoji for insight type
  const getInsightEmoji = (type: string): string => {
    const emojiMap: Record<string, string> = {
      'spending_pattern': '📈',
      'saving_suggestion': '💡',
      'budget_warning': '⚠️',
      'investment_tip': '🎯',
      'warning': '🚨',
      'success': '✅',
      'trend': '📊',
      'decline': '📉'
    };
    return emojiMap[type] || '📋';
  };

  const handleSpeakTextSetup = (speakFunction: (text: string) => void) => {
    speakFunctionRef.current = speakFunction;
  };

  const handleVoiceCommand = async (command: string) => {
    if (!command.trim()) return;
    
    const lowerCommand = command.toLowerCase();
    
    // Voice commands for insights
    if (lowerCommand.includes('read insights') || lowerCommand.includes('read my insights') || lowerCommand.includes('show insights') || lowerCommand.includes('financial insights')) {
      const response = await handleSendMessage("Show me my current financial insights");
      return;
    }
    
    if (lowerCommand.includes('refresh insights') || lowerCommand.includes('generate insights')) {
      handleRefreshInsights();
      if (speakFunctionRef.current) {
        speakFunctionRef.current('Generating new financial insights for you.');
      }
      return;
    }
    
    if (lowerCommand.includes('switch to chat') || lowerCommand.includes('open chat')) {
      setLayoutMode('chat-focus');
      if (speakFunctionRef.current) {
        speakFunctionRef.current('Switching to chat mode. You can now ask me anything!');
      }
      return;
    }
    
    if (lowerCommand.includes('switch to insights') || lowerCommand.includes('show insights')) {
      setLayoutMode('insights-focus');
      if (speakFunctionRef.current) {
        speakFunctionRef.current('Switching to insights mode.');
      }
      return;
    }

    if (lowerCommand.includes('switch to voice') || lowerCommand.includes('voice mode')) {
      setLayoutMode('voice-focus');
      if (speakFunctionRef.current) {
        speakFunctionRef.current('Voice mode activated. You can ask me anything using your voice!');
      }
      return;
    }

    // Enhanced feedback for general questions
    if (speakFunctionRef.current) {
      speakFunctionRef.current('Let me think about that...');
    }
    
    // Treat all other voice input as AI conversation
    try {
      const aiResponse = await handleSendMessage(command);
      
      // Auto-speak the AI response
      if (aiResponse && speakFunctionRef.current) {
        // Wait a moment for the loading state to clear
        setTimeout(() => {
          speakFunctionRef.current!(aiResponse);
        }, 500);
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      if (speakFunctionRef.current) {
        speakFunctionRef.current('Sorry, I had trouble processing that. Could you try asking again?');
      }
    }
  };

  // Render loading state
  if (loading) {
    return <LoadingState onRetry={() => window.location.reload()} />;
  }

  // Render empty state if AI not enabled
  if (!aiEnabled) {
    return <EmptyState onConfigureSettings={() => router.push('/dashboard/settings')} />;
  }

  // Main layout based on layout mode
  const renderMainContent = () => {
    switch (layoutMode) {
      case 'voice-focus':
        return (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Voice-first interface */}
            <div className="text-center">
              <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full border border-primary/20 mb-4">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">AI Voice Assistant Active</span>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    AI Voice Assistant
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    Ask me anything about your finances! I can help with budgeting, expense analysis, 
                    financial planning, and much more. Just speak naturally.
                  </p>
                  
                  {/* Voice Interface */}
                  <div className="bg-gradient-to-br from-primary/5 via-blue-50/50 to-purple-50/30 dark:from-primary/10 dark:via-blue-950/20 dark:to-purple-950/10 rounded-2xl p-8 mb-8 border border-primary/10">
                    <VoiceInterface
                      onTranscriptAction={handleVoiceCommand}
                      onSpeakTextAction={handleSpeakTextSetup}
                      disabled={chatLoading}
                      mode="center"
                      className="justify-center"
                    />
                  </div>

                  {/* Example Questions Grid */}
                  <div className="bg-card/50 backdrop-blur rounded-2xl p-6 mb-8 border border-border/50">
                    <h3 className="text-xl font-semibold mb-4 text-center">Try asking me:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200/50">
                          <div className="text-green-600 text-lg">💰</div>
                          <span>"How much did I spend on groceries this month?"</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50">
                          <div className="text-blue-600 text-lg">📊</div>
                          <span>"What's my biggest expense category?"</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200/50">
                          <div className="text-purple-600 text-lg">💡</div>
                          <span>"Give me budget recommendations"</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50">
                          <div className="text-orange-600 text-lg">📈</div>
                          <span>"How are my savings looking?"</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-pink-50 dark:bg-pink-950/20 rounded-lg border border-pink-200/50">
                          <div className="text-pink-600 text-lg">🎯</div>
                          <span>"Help me plan a vacation budget"</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200/50">
                          <div className="text-red-600 text-lg">⚠️</div>
                          <span>"Am I overspending anywhere?"</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg border border-teal-200/50">
                          <div className="text-teal-600 text-lg">📋</div>
                          <span>"Read my financial insights"</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg border border-indigo-200/50">
                          <div className="text-indigo-600 text-lg">🔮</div>
                          <span>"What's my financial forecast?"</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Chat Messages (Voice Mode) */}
            {chatMessages.length > 1 && (
              <div className="bg-card/80 backdrop-blur border rounded-2xl p-6 max-w-4xl mx-auto">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Recent Conversation
                </h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {chatMessages.slice(-4).map((message, index) => (
                    message.role !== 'system' && (
                      <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-start' : 'justify-start'}`}>
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                        }`}>
                          {message.role === 'user' ? '👤' : '🤖'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`inline-block max-w-full p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary/10 border border-primary/20'
                              : 'bg-muted/80 border border-border/50'
                          }`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'chat-focus':
        return (
          <div className="grid xl:grid-cols-4 lg:grid-cols-3 gap-6">
            <div className="xl:col-span-3 lg:col-span-2">
              <ChatPanel
                messages={chatMessages}
                loading={chatLoading}
                currentModelConfig={currentModelConfig}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                insights={insights}
                onSendMessageAction={handleSendMessage}
                onModelConfigChangeAction={handleModelConfigChange}
                onRequestInsights={handleRequestInsights}
                className="h-[600px]"
              />
            </div>
            <div className="xl:col-span-1 lg:col-span-1">
              <ConversationHistory
                conversations={conversations}
                activeConversationId={activeConversationId}
                conversationTitle={conversationTitle}
                isTitleEditing={isTitleEditing}
                onNewConversation={handleNewConversation}
                onLoadConversation={handleLoadConversation}
                onDeleteConversation={handleDeleteConversation}
                onUpdateTitle={handleUpdateTitle}
                onStartTitleEdit={() => setIsTitleEditing(true)}
                onCancelTitleEdit={() => setIsTitleEditing(false)}
              />
            </div>
          </div>
        );

      case 'insights-focus':
        return (
          <div className="max-w-4xl mx-auto">
            <InsightsPanel
              insights={insights}
              loading={insightLoading}
              onRefresh={handleRefreshInsights}
              onSpeakInsight={speakFunctionRef.current || undefined}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Insights Panel - Takes 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                <InsightsPanel
                  insights={insights}
                  loading={insightLoading}
                  onRefresh={handleRefreshInsights}
                  onSpeakInsight={speakFunctionRef.current || undefined}
                />
              </div>
              
              {/* Conversation History - Takes 1 column */}
              <div>
                <ConversationHistory
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  conversationTitle={conversationTitle}
                  isTitleEditing={isTitleEditing}
                  onNewConversation={handleNewConversation}
                  onLoadConversation={handleLoadConversation}
                  onDeleteConversation={handleDeleteConversation}
                  onUpdateTitle={handleUpdateTitle}
                  onStartTitleEdit={() => setIsTitleEditing(true)}
                  onCancelTitleEdit={() => setIsTitleEditing(false)}
                />
              </div>
            </div>
            
            {/* Chat Panel - Full Width */}
            <div className="w-full">
              <ChatPanel
                messages={chatMessages}
                loading={chatLoading}
                currentModelConfig={currentModelConfig}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                insights={insights}
                onSendMessageAction={handleSendMessage}
                onModelConfigChangeAction={handleModelConfigChange}
                onRequestInsights={handleRequestInsights}
                className="h-[500px]"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <PageHeader
          layoutMode={layoutMode}
          insightLoading={insightLoading}
          quotaStatus={quotaStatus}
          onLayoutChange={setLayoutMode}
          onRefreshInsights={handleRefreshInsights}
          onOpenSettings={() => router.push('/dashboard/settings')}
        />

        <QuotaStatusCard
          quotaError={quotaError}
          quotaStatus={quotaStatus}
          onRefreshStatus={fetchQuotaStatus}
        />

        {renderMainContent()}
      </div>
    </div>
  );
}