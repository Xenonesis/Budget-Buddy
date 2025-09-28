"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserPreferences } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { 
  isAIEnabled, 
  getUserQuotaStatus,
  chatWithAI,
  getAvailableAIProviders,
  getAIModelsForProvider,
  getUserAISettings,
  getValidModelForProvider,
  type FinancialInsight,
  type AIMessage,
  type AIModelConfig,
  type AIModel,
  type AIProvider
} from "@/lib/ai";

import {
  QuotaStatusCard,
  ChatPanel,
  ConversationHistory,
  PageHeader,
  EmptyState,
  VoiceInterface
} from "./components";

// Layout modes matching the components
type LayoutMode = 'default' | 'chat-focus' | 'voice-focus';

export default function AIInsightsPage() {
  const router = useRouter();
  const { userId } = useUserPreferences();

  // Core state
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Chat state
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
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

  // Responsive UI state
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('default');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  
  // Voice interface state
  const speakFunctionRef = useRef<((text: string) => void) | null>(null);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // Auto-adjust layout mode based on screen size - simplified for new layout modes
      // Mobile responsiveness is now handled via CSS and component logic
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [layoutMode]);

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

  // Listen for settings changes via localStorage and window focus
  useEffect(() => {
    if (!userId) return;

    const refetchAISettingsInternal = async () => {
      try {
        const providers = await getAvailableAIProviders(userId);
        setAvailableProviders(providers);
        
        const userSettings = await getUserAISettings(userId);
        
        if (userSettings?.defaultModel) {
          const validModel = getValidModelForProvider(
            userSettings.defaultModel.provider, 
            userSettings.defaultModel.model
          );
          setCurrentModelConfig({
            provider: userSettings.defaultModel.provider,
            model: validModel
          });
        } else if (providers.length > 0) {
          setCurrentModelConfig({
            provider: providers[0],
            model: getValidModelForProvider(providers[0])
          });
        }
      } catch (error) {
        console.error("Error refetching AI settings:", error);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ai-settings-updated' && e.newValue) {
        refetchAISettingsInternal();
        toast.success("AI settings updated! Using your new default provider and model.");
        localStorage.removeItem('ai-settings-updated');
      }
    };

    const handleWindowFocus = () => {
      refetchAISettingsInternal();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [userId]);

  const initializeData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Check AI enablement
      const enabled = await isAIEnabled(userId);
      setAiEnabled(enabled);

      if (!enabled) {
        setLoading(false);
        return;
      }

      // Fetch quota status
      await fetchQuotaStatus();

      // Fetch AI providers and models
      const providers = await getAvailableAIProviders(userId);
      setAvailableProviders(providers);

      // Get user's AI settings
      const userSettings = await getUserAISettings(userId);
      if (userSettings?.defaultModel) {
        const validModel = getValidModelForProvider(
          userSettings.defaultModel.provider, 
          userSettings.defaultModel.model
        );
        setCurrentModelConfig({
          provider: userSettings.defaultModel.provider,
          model: validModel
        });
      } else if (providers.length > 0) {
        setCurrentModelConfig({
          provider: providers[0],
          model: getValidModelForProvider(providers[0])
        });
      }

      // Fetch conversations
      const { data: conversationsData } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (conversationsData) {
        setConversations(conversationsData);
      }

    } catch (error) {
      console.error("Error initializing AI Insights:", error);
      toast.error("Failed to initialize AI assistant");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotaStatus = async () => {
    if (!userId) return;

    try {
      const status = await getUserQuotaStatus(userId);
      setQuotaStatus(status);
      
      if (!status?.status?.canMakeRequest) {
        setQuotaError(status?.status?.message || "Quota limit exceeded");
      } else {
        setQuotaError(null);
      }
    } catch (error) {
      console.error("Error fetching quota status:", error);
    }
  };

  const handleSendMessage = async (message: string): Promise<string | null> => {
    if (!userId || chatLoading) return null;

    setChatLoading(true);
    const newMessages = [...chatMessages, { role: "user" as const, content: message }];
    setChatMessages(newMessages);

    try {
      const isInsightRequest = /\b(insight|analysis|analyze|spending|budget|financial|recommend|advice)\b/i.test(message);

      let response: string;

      if (isInsightRequest) {
        response = "For detailed financial insights, please visit the dedicated Financial Insights page in your dashboard. You'll find comprehensive analysis of your spending patterns, budget alerts, and personalized recommendations there.";
      } else {
        const aiResponse = await chatWithAI(userId, newMessages, currentModelConfig);
        response = aiResponse || "I'm sorry, I couldn't process your request right now.";
      }
      
      if (response) {
        const updatedMessages = [...newMessages, { role: "assistant" as const, content: response }];
        setChatMessages(updatedMessages);
        
        if (activeConversationId) {
          await saveConversation(activeConversationId, updatedMessages);
        }
        
        return response;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setChatMessages(newMessages.slice(0, -1));
    } finally {
      setChatLoading(false);
    }

    return null;
  };

  const saveConversation = async (conversationId: string, messages: AIMessage[]) => {
    if (!userId) return;

    try {
      await supabase
        .from("ai_messages")
        .delete()
        .eq("conversation_id", conversationId);

      const messagesToSave = messages.map((msg, index) => ({
        conversation_id: conversationId,
        user_id: userId,
        role: msg.role,
        content: msg.content,
        created_at: new Date().toISOString()
      }));

      await supabase
        .from("ai_messages")
        .insert(messagesToSave);

      await supabase
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);

    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  const handleModelConfigChange = async (provider: AIProvider, model: string) => {
    setCurrentModelConfig({ provider, model: model as AIModel });
    
    if (!availableModels[provider] && !loadingModels[provider]) {
      setLoadingModels(prev => ({ ...prev, [provider]: true }));
      try {
        const models = await getAIModelsForProvider(provider);
        setAvailableModels(prev => ({ ...prev, [provider]: models }));
      } catch (error) {
        console.error(`Error fetching models for ${provider}:`, error);
      } finally {
        setLoadingModels(prev => ({ ...prev, [provider]: false }));
      }
    }
  };

  const handleNewConversation = () => {
    setChatMessages([]);
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
        const formattedMessages = messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
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
      await supabase
        .from("ai_messages")
        .delete()
        .eq("conversation_id", conversationId);

      await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);

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

  const handleUpdateTitle = async (conversationId: string, newTitle: string) => {
    try {
      await supabase
        .from("ai_conversations")
        .update({ title: newTitle })
        .eq("id", conversationId);

      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
      );
      setConversationTitle(newTitle);
      setIsTitleEditing(false);
      toast.success("Title updated");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title");
    }
  };

  // Mobile layout switcher
  const handleMobileLayoutSwitch = (mode: 'chat' | 'history') => {
    if (mode === 'chat') {
      setLayoutMode('chat-focus');
    } else {
      setLayoutMode('default');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-muted-foreground">Loading AI Assistant...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI not enabled state
  if (!aiEnabled) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <EmptyState 
            onConfigureSettings={() => router.push('/dashboard/settings')}
          />
        </div>
      </div>
    );
  }

  // Responsive layout rendering
  const renderMainContent = () => {
    if (isMobile) {
      // Mobile layouts
      if (layoutMode === 'default') {
        return (
          <div className="space-y-4">
            {/* Mobile Navigation */}
            <div className="flex gap-2 bg-card/50 backdrop-blur rounded-lg p-2">
              <button
                onClick={() => handleMobileLayoutSwitch('chat')}
                className="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground"
              >
                Chat
              </button>
              <button
                onClick={() => handleMobileLayoutSwitch('history')}
                className="flex-1 py-2 px-4 text-sm font-medium rounded-md bg-primary/10 text-primary transition-colors"
              >
                History
              </button>
            </div>
            
            <ConversationHistory
              conversations={conversations}
              activeConversationId={activeConversationId}
              conversationTitle={conversationTitle}
              isTitleEditing={isTitleEditing}
              onNewConversation={handleNewConversation}
              onLoadConversation={(id) => {
                handleLoadConversation(id);
                handleMobileLayoutSwitch('chat');
              }}
              onDeleteConversation={handleDeleteConversation}
              onUpdateTitle={handleUpdateTitle}
              onStartTitleEdit={() => setIsTitleEditing(true)}
              onCancelTitleEdit={() => setIsTitleEditing(false)}
              className="h-[calc(100vh-12rem)]"
            />
          </div>
        );
      }

      // Mobile chat (default mobile view)
      return (
        <div className="space-y-4">
          {/* Mobile Navigation */}
          <div className="flex gap-2 bg-card/50 backdrop-blur rounded-lg p-2">
            <button
              onClick={() => handleMobileLayoutSwitch('chat')}
              className="flex-1 py-2 px-4 text-sm font-medium rounded-md bg-primary/10 text-primary transition-colors"
            >
              Chat
            </button>
            <button
              onClick={() => handleMobileLayoutSwitch('history')}
              className="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors text-muted-foreground hover:text-foreground"
            >
              History ({conversations.length})
            </button>
          </div>
          
          <ChatPanel
            messages={chatMessages}
            loading={chatLoading}
            currentModelConfig={currentModelConfig}
            availableProviders={availableProviders}
            availableModels={availableModels}
            loadingModels={loadingModels}
            insights={[]}
            onSendMessageAction={handleSendMessage}
            onModelConfigChangeAction={handleModelConfigChange}
            onRequestInsights={() => {}}
            className="h-[calc(100vh-12rem)]"
          />
        </div>
      );
    }

    // Desktop layouts
    switch (layoutMode) {
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
                insights={[]}
                onSendMessageAction={handleSendMessage}
                onModelConfigChangeAction={handleModelConfigChange}
                onRequestInsights={() => {}}
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

      case 'voice-focus':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <VoiceInterface
              onTranscriptAction={handleSendMessage}
              onSpeakTextAction={(speakFn) => { speakFunctionRef.current = speakFn; }}
              onListeningChangeAction={() => {}}
              onTranscriptUpdateAction={() => {}}
              disabled={chatLoading}
              className="justify-center"
            />
            
            <div className="grid lg:grid-cols-2 gap-6">
              <ChatPanel
                messages={chatMessages}
                loading={chatLoading}
                currentModelConfig={currentModelConfig}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                insights={[]}
                onSendMessageAction={handleSendMessage}
                onModelConfigChangeAction={handleModelConfigChange}
                onRequestInsights={() => {}}
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
                className="h-[500px]"
              />
            </div>
          </div>
        );

      default: // default
        return (
          <div className="grid lg:grid-cols-3 gap-6">
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
            
            <div className="lg:col-span-2">
              <ChatPanel
                messages={chatMessages}
                loading={chatLoading}
                currentModelConfig={currentModelConfig}
                availableProviders={availableProviders}
                availableModels={availableModels}
                loadingModels={loadingModels}
                insights={[]}
                onSendMessageAction={handleSendMessage}
                onModelConfigChangeAction={handleModelConfigChange}
                onRequestInsights={() => {}}
                className="h-[600px]"
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
          insightLoading={false}
          quotaStatus={quotaStatus}
          onLayoutChange={(mode) => {
            if (isMobile) {
              // Mobile layout changes handled separately
              if (mode === 'voice-focus') {
                setLayoutMode('voice-focus');
              }
            } else {
              setLayoutMode(mode as LayoutMode);
            }
          }}
          onRefreshInsights={() => {}}
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