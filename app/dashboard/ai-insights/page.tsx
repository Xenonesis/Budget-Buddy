"use client";

import { useState, useEffect } from "react";
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
  type AIMessage,
  type AIModelConfig,
  type AIModel,
  type AIProvider
} from "@/lib/ai";

import {
  ChatInterface,
  Sidebar,
  EmptyState
} from "./components";

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
  
  // AI Configuration state
  const [currentModelConfig, setCurrentModelConfig] = useState<AIModelConfig>({
    provider: 'mistral',
    model: 'mistral-small'
  });
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);
  const [availableModels, setAvailableModels] = useState<Record<string, AIModel[]>>({});
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});

  // UI state
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [conversationLoading, setConversationLoading] = useState<boolean>(false);

  // Initialize data
  useEffect(() => {
    if (userId) {
      initializeData();
    }
  }, [userId]);

  // Listen for AI settings changes
  useEffect(() => {
    if (!userId) return;

    const refetchAISettings = async () => {
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
        refetchAISettings();
        toast.success("AI settings updated!");
        localStorage.removeItem('ai-settings-updated');
      }
    };

    const handleWindowFocus = () => {
      refetchAISettings();
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
        .order("last_updated", { ascending: false });

      if (conversationsData) {
        // Generate titles for conversations that don't have them
        const conversationsWithTitles = conversationsData.map(conv => {
          let title = conv.title || "New Conversation";
          
          // If no title, try to generate one from the first message
          if (!conv.title && conv.messages) {
            try {
              const messages = typeof conv.messages === 'string' 
                ? JSON.parse(conv.messages) 
                : conv.messages;
              
              if (Array.isArray(messages) && messages.length > 0) {
                const firstUserMessage = messages.find(m => m.role === 'user');
                if (firstUserMessage?.content) {
                  title = generateConversationTitle(firstUserMessage.content);
                }
              }
            } catch (e) {
              console.warn("Error parsing messages for title generation:", e);
            }
          }
          
          return {
            ...conv,
            title,
            updated_at: conv.last_updated // Normalize the column name for UI
          };
        });
        
        setConversations(conversationsWithTitles);
        
        // Auto-load the first conversation if none is currently active
        if (conversationsWithTitles.length > 0 && !activeConversationId) {
          const firstConv = conversationsWithTitles[0];
          handleLoadConversation(firstConv.id);
        }
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
      // Create new conversation if none exists
      let conversationId = activeConversationId;
      if (!conversationId) {
        try {
          conversationId = await createNewConversation(message);
          setActiveConversationId(conversationId);
        } catch (convError) {
          console.error("Failed to create conversation, continuing with temporary storage:", convError);
          // Continue without conversation ID for this session
        }
      }

      const isInsightRequest = /\b(insight|analysis|analyze|spending|budget|financial|recommend|advice)\b/i.test(message);

      let response: string;

      if (isInsightRequest) {
        response = "For detailed financial insights, please visit the dedicated Financial Insights page in your dashboard. You'll find comprehensive analysis of your spending patterns, budget alerts, and personalized recommendations there.";
      } else {
        try {
          const aiResponse = await chatWithAI(userId, newMessages, currentModelConfig);
          response = aiResponse || "I'm sorry, I couldn't process your request right now. Please check your AI configuration or try again later.";
        } catch (aiError) {
          console.error("AI Service Error:", aiError);
          response = "I'm having trouble connecting to the AI service. Please check your settings or try again in a moment.";
        }
      }
      
      if (response) {
        const updatedMessages = [...newMessages, { role: "assistant" as const, content: response }];
        setChatMessages(updatedMessages);
        
        // Only save to database if we have a valid conversation ID
        if (conversationId && !conversationId.startsWith('temp_')) {
          try {
            await saveConversation(conversationId, updatedMessages);
          } catch (saveError) {
            console.error("Failed to save conversation to database:", saveError);
            // Continue anyway - the conversation is still available in memory
          }
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

    // Skip saving if it's a temporary conversation
    if (conversationId.startsWith('temp_')) {
      console.log("Skipping save for temporary conversation:", conversationId);
      return;
    }

    try {
      // Update conversation with messages in JSONB format (existing schema)
      const { error: updateError } = await supabase
        .from("ai_conversations")
        .update({ 
          messages: JSON.stringify(messages),
          last_updated: new Date().toISOString() 
        })
        .eq("id", conversationId);

      if (updateError) {
        console.error("Error updating conversation:", updateError);
      }

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

  const createNewConversation = async (firstMessage: string): Promise<string> => {
    if (!userId) throw new Error("User ID not found");

    try {
      // Generate conversation title from first message
      const title = generateConversationTitle(firstMessage);
      
      // Try to insert with existing schema structure
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: userId,
          messages: JSON.stringify([]),
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating conversation:", error);
        // If the above fails, try with a different approach
        const fallbackId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("ai_conversations")
          .insert({
            id: fallbackId,
            user_id: userId,
            messages: JSON.stringify([]),
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          })
          .select()
          .single();

        if (fallbackError) {
          console.error("Fallback conversation creation also failed:", fallbackError);
          // Create a temporary conversation ID for local use
          const tempId = `temp_${Date.now()}`;
          const tempConversation = {
            id: tempId,
            user_id: userId,
            messages: JSON.stringify([]),
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            title: title // Keep title for local display
          };
          
          setConversations(prev => [tempConversation, ...prev]);
          return tempId;
        }
        
        setConversations(prev => [fallbackData, ...prev]);
        return fallbackData.id;
      }

      // Update local conversations list
      setConversations(prev => [data, ...prev]);
      
      return data.id;
    } catch (err) {
      console.error("Unexpected error in createNewConversation:", err);
      // Fallback to temporary local conversation
      const tempId = `temp_${Date.now()}`;
      const tempConversation = {
        id: tempId,
        user_id: userId,
        messages: JSON.stringify([]),
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        title: generateConversationTitle(firstMessage) // Keep title for local display
      };
      
      setConversations(prev => [tempConversation, ...prev]);
      toast.error("Failed to save conversation to database, using temporary storage");
      return tempId;
    }
  };

  const generateConversationTitle = (message: string): string => {
    // Extract key financial terms or use first few words
    const financialTerms = ['budget', 'spending', 'savings', 'investment', 'money', 'finance', 'expense'];
    const words = message.toLowerCase().split(' ');
    
    const relevantTerm = financialTerms.find(term => 
      words.some(word => word.includes(term))
    );
    
    if (relevantTerm) {
      return `${relevantTerm.charAt(0).toUpperCase() + relevantTerm.slice(1)} Discussion`;
    }
    
    // Fallback to first 4-6 words
    const titleWords = message.split(' ').slice(0, 5);
    let title = titleWords.join(' ');
    if (title.length > 30) {
      title = title.substring(0, 30) + '...';
    }
    
    return title || 'New Conversation';
  };

  const handleNewConversation = () => {
    setChatMessages([]);
    setActiveConversationId(null);
  };

  const handleLoadConversation = async (conversationId: string) => {
    try {
      setConversationLoading(true);
      
      const { data: conversation, error } = await supabase
        .from("ai_conversations")
        .select("messages")
        .eq("id", conversationId)
        .single();

      if (error) {
        console.error("Error fetching conversation:", error);
        toast.error("Failed to load conversation");
        return;
      }

      if (conversation?.messages) {
        let messages: AIMessage[] = [];
        try {
          // Parse the messages from JSONB
          messages = typeof conversation.messages === 'string' 
            ? JSON.parse(conversation.messages) 
            : conversation.messages;
          
          if (Array.isArray(messages)) {
            setChatMessages(messages);
          } else {
            setChatMessages([]);
          }
        } catch (parseError) {
          console.error("Error parsing conversation messages:", parseError);
          setChatMessages([]);
        }
      } else {
        setChatMessages([]);
      }

      setActiveConversationId(conversationId);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setConversationLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // With the existing schema, we only need to delete from ai_conversations
      // as messages are stored as JSONB in the same table
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
      // Since the database schema doesn't have a title column,
      // we'll update the local state only and the last_updated timestamp
      await supabase
        .from("ai_conversations")
        .update({ last_updated: new Date().toISOString() })
        .eq("id", conversationId);

      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
      );
      toast.success("Conversation renamed (stored locally)");
    } catch (error) {
      console.error("Error updating conversation:", error);
      // Even if the database update fails, we can still update locally
      setConversations(prev => 
        prev.map(c => c.id === conversationId ? { ...c, title: newTitle } : c)
      );
      toast.success("Conversation renamed locally");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-full opacity-20 animate-ping"></div>
            <div className="relative w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <p className="text-lg font-medium">Loading AI Assistant</p>
            <p className="text-sm text-muted-foreground">Preparing your financial companion...</p>
          </div>
        </div>
      </div>
    );
  }

  // AI not enabled state
  if (!aiEnabled) {
    return (
      <div className="flex items-center justify-center h-screen">
        <EmptyState 
          onConfigureSettings={() => router.push('/dashboard/settings')}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewConversation={handleNewConversation}
        onLoadConversation={handleLoadConversation}
        onDeleteConversation={handleDeleteConversation}
        onUpdateTitle={handleUpdateTitle}
        onOpenSettings={() => router.push('/dashboard/settings')}
        quotaStatus={quotaStatus}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          messages={chatMessages}
          loading={chatLoading || conversationLoading}
          currentModelConfig={currentModelConfig}
          availableProviders={availableProviders}
          availableModels={availableModels}
          loadingModels={loadingModels}
          insights={[]}
          onSendMessage={handleSendMessage}
          onModelConfigChange={handleModelConfigChange}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      </div>
    </div>
  );
}