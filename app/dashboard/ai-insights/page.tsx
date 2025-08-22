"use client";

import { useState, useEffect } from "react";
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
  LoadingState
} from "./components";

type LayoutMode = 'default' | 'chat-focus' | 'insights-focus';

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

  // Initialize data
  useEffect(() => {
    if (userId) {
      initializeData();
    }
  }, [userId]);

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
      
      if (providers.length > 0) {
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
        .order("updated_at", { ascending: false });
      
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

  const handleSendMessage = async (message: string) => {
    if (!userId || chatLoading) return;

    setChatLoading(true);
    const newMessages = [...chatMessages, { role: "user" as const, content: message }];
    setChatMessages(newMessages);

    try {
      const response = await chatWithAI(userId, newMessages, currentModelConfig);
      
      if (response) {
        const updatedMessages = [...newMessages, { role: "assistant" as const, content: response }];
        setChatMessages(updatedMessages);
        
        // Save conversation if active
        if (activeConversationId) {
          await saveConversation(activeConversationId, updatedMessages);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setChatLoading(false);
    }
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
    const newProvider = provider || currentModelConfig.provider;
    setCurrentModelConfig({ provider: newProvider, model });
    
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
      case 'chat-focus':
        return (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ChatPanel
                messages={chatMessages}
                loading={chatLoading}
                currentModelConfig={currentModelConfig}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                onSendMessage={handleSendMessage}
                onModelConfigChange={handleModelConfigChange}
                className="h-[600px]"
              />
            </div>
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
        );

      case 'insights-focus':
        return (
          <div className="max-w-4xl mx-auto">
            <InsightsPanel
              insights={insights}
              loading={insightLoading}
              onRefresh={handleRefreshInsights}
            />
          </div>
        );

      default:
        return (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <InsightsPanel
                insights={insights}
                loading={insightLoading}
                onRefresh={handleRefreshInsights}
              />
            </div>
            <div className="space-y-6">
              <ChatPanel
                messages={chatMessages}
                loading={chatLoading}
                currentModelConfig={currentModelConfig}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                onSendMessage={handleSendMessage}
                onModelConfigChange={handleModelConfigChange}
                className="h-[500px]"
              />
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
    }
  };

  return (
    <div className="container mx-auto px-2 py-4 md:p-6">
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
  );
}