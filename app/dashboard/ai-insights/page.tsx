"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserPreferences } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { 
  isAIEnabled, 
  generateGoogleAIInsights, 
  chatWithAI,
  AIMessage, 
  FinancialInsight, 
  getAIConversations, 
  saveAIConversation,
  getUserAISettings,
  AIProvider,
  AIModel,
  ModelConfig
} from "@/lib/ai";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Send,
  MessageCircle,
  LucideIcon,
  RefreshCw,
  Settings
} from "lucide-react";

// Icons for different insight types
const InsightIcons: Record<string, LucideIcon> = {
  spending_pattern: TrendingUp,
  saving_suggestion: PiggyBank,
  budget_warning: AlertTriangle,
  investment_tip: Lightbulb,
};

export default function AIInsightsPage() {
  const router = useRouter();
  const { userId } = useUserPreferences();
  const [aiEnabled, setAiEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    { role: "system", content: "I'm your financial assistant. How can I help you with your budget and finances today?" }
  ]);
  const [userMessage, setUserMessage] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [insightLoading, setInsightLoading] = useState<boolean>(false);
  const [setupNeeded, setSetupNeeded] = useState<boolean>(false);
  const [aiSettings, setAiSettings] = useState<any>(null);
  const [currentModelConfig, setCurrentModelConfig] = useState<ModelConfig>({
    provider: 'mistral',
    model: 'mistral-small'
  });
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isTitleEditing, setIsTitleEditing] = useState<boolean>(false);
  const [layoutMode, setLayoutMode] = useState<'default' | 'chat-focus' | 'insights-focus'>('default');

  useEffect(() => {
    if (userId) {
      checkAIEnabled();
      fetchInsightsAndChats();
      fetchAISettings();
    }
  }, [userId]);

  const fetchAISettings = async () => {
    if (!userId) return;
    
    try {
      const settings = await getUserAISettings(userId);
      setAiSettings(settings);
      
      // Initialize current model from settings
      if (settings?.defaultModel) {
        setCurrentModelConfig(settings.defaultModel);
      } else if (settings?.mistral_model) {
        // Legacy support
        setCurrentModelConfig({
          provider: 'mistral',
          model: settings.mistral_model as AIModel
        });
      }
      
      // Always provide all providers, even if API keys aren't configured yet
      // This allows users to see what options are available
      const allProviders = ['mistral', 'anthropic', 'groq', 'deepseek', 'llama', 'cohere', 'gemini', 'qwen', 'openrouter'];
      
      // Check which providers have API keys (for the "available" badge/indicator)
      const configuredProviders: string[] = [];
      if (settings?.mistral_api_key) configuredProviders.push('mistral');
      if (settings?.anthropic_api_key) configuredProviders.push('anthropic');
      if (settings?.groq_api_key) configuredProviders.push('groq');
      if (settings?.deepseek_api_key) configuredProviders.push('deepseek');
      if (settings?.llama_api_key) configuredProviders.push('llama');
      if (settings?.cohere_api_key) configuredProviders.push('cohere');
      if (settings?.gemini_api_key || settings?.google_api_key) configuredProviders.push('gemini');
      if (settings?.qwen_api_key) configuredProviders.push('qwen');
      if (settings?.openrouter_api_key) configuredProviders.push('openrouter');
      
      setAvailableProviders(configuredProviders);
    } catch (error) {
      console.error("Error fetching AI settings:", error);
    }
  };

  const checkAIEnabled = async () => {
    if (!userId) return;
    
    try {
      const enabled = await isAIEnabled(userId);
      setAiEnabled(enabled);
      
      if (!enabled) {
        toast.info("AI features are not enabled. Please configure your API keys in settings.");
      }
    } catch (error) {
      console.error("Error checking AI enabled status:", error);
      setSetupNeeded(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsightsAndChats = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Fetch transactions and budgets for AI analysis
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
          
          if (generatedInsights) {
            setInsights(generatedInsights);
          }
        } catch (error) {
          console.error("Error generating insights:", error);
          toast.error("Failed to generate AI insights");
        }
      }
      
      // Fetch past AI conversations
      try {
        const pastConversations = await getAIConversations(userId);
        setConversations(pastConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // This is not critical, so just log it
      }
      
    } catch (error) {
      console.error("Error fetching AI data:", error);
      toast.error("Failed to load data for AI analysis");
      setSetupNeeded(true);
    } finally {
      setLoading(false);
    }
  };

  // New function to load a previous conversation
  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("user_id", userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Set active conversation id
        setActiveConversationId(conversationId);
        
        // Set conversation title
        setConversationTitle(data.title || `Conversation ${new Date(data.created_at).toLocaleDateString()}`);
        
        // Load messages
        setChatMessages(data.messages || []);
        
        // Scroll to the end of chat
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-messages-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
        
        toast.success("Loaded conversation");
        
        // Focus layout on chat
        setLayoutMode('chat-focus');
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    }
  };
  
  // New function to save conversation title
  const saveConversationTitle = async () => {
    if (!activeConversationId || !userId) return;
    
    try {
      const { error } = await supabase
        .from("ai_conversations")
        .update({ title: conversationTitle })
        .eq("id", activeConversationId)
        .eq("user_id", userId);
        
      if (error) throw error;
      
      // Update the title in the conversations list
      setConversations(conversations.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, title: conversationTitle } 
          : conv
      ));
      
      toast.success("Conversation title saved");
      setIsTitleEditing(false);
    } catch (error) {
      console.error("Error saving conversation title:", error);
      toast.error("Failed to save conversation title");
    }
  };
  
  // New function to start a new conversation
  const startNewConversation = () => {
    setChatMessages([
      { role: "system", content: "I'm your financial assistant. How can I help you with your budget and finances today?" }
    ]);
    setActiveConversationId(null);
    setConversationTitle("");
    setLayoutMode('chat-focus');
  };

  const handleChangeModelConfig = async (provider?: string, model?: string) => {
    const newConfig = { ...currentModelConfig };
    
    if (provider) {
      newConfig.provider = provider as AIProvider;
      // Set default model for the provider if not specified
      if (!model) {
        newConfig.model = getDefaultModelForProvider(provider);
      }
    }
    
    if (model) {
      newConfig.model = model as AIModel;
    }
    
    setCurrentModelConfig(newConfig);
    
    // Save the setting if we have a user ID
    if (userId && aiSettings) {
      try {
        const updatedSettings = {
          ...aiSettings,
          defaultModel: newConfig
        };
        
        // Update in Supabase
        const { error } = await supabase
          .from("profiles")
          .update({
            ai_settings: updatedSettings
          })
          .eq("id", userId);
          
        if (error) {
          console.error("Error updating AI settings:", error);
          toast.error("Failed to save model preference");
        } else {
          setAiSettings(updatedSettings);
          toast.success(`Switched to ${getModelDisplayName(newConfig)}`);
        }
      } catch (error) {
        console.error("Error updating model:", error);
      }
    }
  };

  const getDefaultModelForProvider = (provider: string): AIModel => {
    switch (provider) {
      case 'mistral': return 'mistral-small';
      case 'anthropic': return 'claude-3-haiku';
      case 'groq': return 'llama3-8b';
      case 'deepseek': return 'deepseek-chat';
      case 'llama': return 'llama-3-8b';
      case 'cohere': return 'command';
      case 'gemini': return 'gemini-1.5-flash';
      case 'qwen': return 'qwen-turbo';
      case 'openrouter': return 'openrouter-default';
      default: return 'mistral-small';
    }
  };
  
  const getModelDisplayName = (config: ModelConfig): string => {
    const providerName = getProviderDisplayName(config.provider);
    const modelName = config.model.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return `${providerName} - ${modelName}`;
  };
  
  const getProviderDisplayName = (provider: string): string => {
    switch(provider) {
      case 'mistral': return 'Mistral AI';
      case 'anthropic': return 'Claude';
      case 'groq': return 'Groq';
      case 'deepseek': return 'DeepSeek';
      case 'llama': return 'Llama';
      case 'cohere': return 'Cohere';
      case 'gemini': return 'Gemini';
      case 'qwen': return 'Qwen';
      case 'openrouter': return 'OpenRouter';
      default: return provider;
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !userId || !aiEnabled) return;
    
    // Check if the selected provider has an API key
    const hasApiKey = availableProviders.includes(currentModelConfig.provider);
    if (!hasApiKey) {
      toast.error(`${getProviderDisplayName(currentModelConfig.provider)} API key not configured. Please add it in Settings.`);
      return;
    }
    
    setChatLoading(true);
    
    // Add user message to chat
    const newMessages: AIMessage[] = [
      ...chatMessages,
      { role: "user" as const, content: userMessage }
    ];
    
    setChatMessages(newMessages);
    setUserMessage("");
    
    try {
      // Get response from the selected AI provider
      const response = await chatWithAI(userId, newMessages, currentModelConfig);
      
      if (response) {
        // Add assistant response to chat
        const updatedMessages: AIMessage[] = [
          ...newMessages,
          { role: "assistant" as const, content: response }
        ];
        
        setChatMessages(updatedMessages);
        
        // Generate a default title if this is a new conversation and we have enough messages
        const isNewConversation = !activeConversationId;
        const hasEnoughMessages = updatedMessages.filter(m => m.role === 'user').length >= 1;
        
        // Save conversation and update the ID if it's a new one
        const conversationId = await saveAIConversation(
          userId, 
          updatedMessages, 
          activeConversationId,
          isNewConversation && hasEnoughMessages && !conversationTitle 
            ? `Chat from ${new Date().toLocaleDateString()}` 
            : conversationTitle
        );
        
        // If this was a new conversation, set the active ID and fetch the updated list
        if (isNewConversation && conversationId) {
          setActiveConversationId(conversationId);
          if (!conversationTitle) {
            setConversationTitle(`Chat from ${new Date().toLocaleDateString()}`);
          }
          
          // Refresh the conversations list
          const pastConversations = await getAIConversations(userId);
          setConversations(pastConversations);
        }
        
        // Scroll to the end of chat
        setTimeout(() => {
          const chatContainer = document.getElementById('chat-messages-container');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 100);
      } else {
        toast.error("Failed to get response from AI assistant");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error communicating with AI assistant");
    } finally {
      setChatLoading(false);
    }
  };

  const refreshInsights = async () => {
    if (!userId || !aiEnabled) return;
    
    setInsightLoading(true);
    
    try {
      // Fetch fresh data and regenerate insights
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
        
        if (generatedInsights) {
          setInsights(generatedInsights);
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

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (setupNeeded) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardHeader>
            <CardTitle>Database Setup Required</CardTitle>
            <CardDescription>
              The AI features require database setup before they can be used.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <div className="rounded-full bg-muted p-6">
              <Settings className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="max-w-md text-muted-foreground">
              Please run the SQL script provided in <code>setup-ai-tables.sql</code> in your Supabase database
              to create the required tables for AI features.
            </p>
          </CardContent>
          <CardFooter className="justify-center flex flex-col space-y-2">
            <Button onClick={() => router.push('/dashboard/settings')} className="w-full">
              Go to Settings
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!aiEnabled) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Card className="border-2 border-dashed border-muted-foreground/25">
          <CardHeader>
            <CardTitle>AI Features Not Enabled</CardTitle>
            <CardDescription>
              Configure your AI settings to access personalized financial insights and assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <div className="rounded-full bg-muted p-6">
              <Settings className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="max-w-md text-muted-foreground">
              To use AI features, you need to provide Google AI and/or Mistral AI API keys in your settings.
              These services will analyze your financial data to provide personalized insights, suggestions,
              and an interactive chat assistant.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push('/dashboard/settings')}>
              Configure AI Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 py-4 md:p-6">
      <div className="mb-4 md:mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold md:text-3xl">AI Financial Assistant</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={`w-9 h-9 p-0 ${layoutMode === 'default' ? 'bg-primary/10' : ''}`}
              onClick={() => setLayoutMode('default')}
              title="Default view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={`w-9 h-9 p-0 ${layoutMode === 'chat-focus' ? 'bg-primary/10' : ''}`}
              onClick={() => setLayoutMode('chat-focus')}
              title="Focus on chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className={`w-9 h-9 p-0 ${layoutMode === 'insights-focus' ? 'bg-primary/10' : ''}`}
              onClick={() => setLayoutMode('insights-focus')}
              title="Focus on insights"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshInsights}
            disabled={insightLoading}
            size="sm"
            className="w-full sm:w-auto"
          >
            {insightLoading ? (
              <>
                <div className="mr-2 h-3 w-3 md:h-4 md:w-4 animate-spin rounded-full border-b-2 border-primary"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>
      </div>

      <div className={`grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 ${
        layoutMode === 'default' ? 'xl:grid-cols-12' : 
        layoutMode === 'chat-focus' ? 'xl:grid-cols-1' : 
        'xl:grid-cols-1'
      }`}>
        {/* AI Insights Section */}
        {(layoutMode === 'default' || layoutMode === 'insights-focus') && (
          <div className={`${layoutMode === 'default' ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
            <h2 className="mb-3 text-lg font-semibold md:text-xl">Financial Insights</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => {
                  const Icon = InsightIcons[insight.type] || Lightbulb;
                  
                  return (
                    <Card key={index} className="overflow-hidden transition-shadow hover:shadow-md">
                      <CardHeader className="pb-2 p-3 md:p-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-semibold md:text-lg">{insight.title}</CardTitle>
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <CardDescription className="text-xs md:text-sm">
                          {insight.type.split("_").map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(" ")} 
                          {insight.confidence > 0.85 ? " • High confidence" : 
                          insight.confidence > 0.6 ? " • Medium confidence" : " • Low confidence"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 md:p-4">
                        <p className="text-xs md:text-sm">{insight.description}</p>
                        {insight.relevantCategories && insight.relevantCategories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {insight.relevantCategories.map((category, i) => (
                              <span key={i} className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs">
                                {category}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex h-48 md:h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-4 md:p-8 text-center">
                  <Lightbulb className="mb-3 h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
                  <h3 className="text-base md:text-lg font-medium">No Insights Available</h3>
                  <p className="mt-1 md:mt-2 max-w-md text-xs md:text-sm text-muted-foreground">
                    We need more transaction data to generate meaningful insights. Add more transactions or click
                    "Refresh Insights" to try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Past Conversations and Chat Assistant Section */}
        {(layoutMode === 'default' || layoutMode === 'chat-focus') && (
          <div className={`${layoutMode === 'default' ? 'xl:col-span-5' : 'xl:col-span-12'}`}>
            <div className="flex flex-col h-full">
              {/* Chat Assistant */}
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold md:text-xl">Financial Assistant</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={startNewConversation}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  New Chat
                </Button>
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                {/* Past Conversations List - Only show on larger screens or when focused on chat */}
                {conversations.length > 0 && (layoutMode === 'chat-focus' || (layoutMode === 'default' && window.innerWidth >= 1024)) && (
                  <div className="lg:w-1/3">
                    <div className="bg-card border rounded-md h-[200px] lg:h-[500px] overflow-y-auto p-2">
                      <div className="text-sm font-medium mb-2">Chat History</div>
                      <div className="space-y-1">
                        {conversations.map((conversation, index) => (
                          <div 
                            key={index}
                            className={`p-2 text-xs md:text-sm rounded-md cursor-pointer hover:bg-accent/50 transition-colors
                                      ${activeConversationId === conversation.id ? 'bg-accent' : ''}`}
                            onClick={() => loadConversation(conversation.id)}
                          >
                            <div className="font-medium truncate">
                              {conversation.title || `Chat ${index + 1}`}
                            </div>
                            <div className="text-[10px] md:text-xs text-muted-foreground">
                              {new Date(conversation.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              
                {/* Chat Interface */}
                <Card className={`flex h-[400px] sm:h-[500px] md:h-[600px] flex-col ${
                  layoutMode === 'chat-focus' && conversations.length === 0 ? 'lg:w-full' : 
                  layoutMode === 'chat-focus' ? 'lg:w-2/3' : 'lg:w-full'
                }`}>
                  <CardHeader className="p-2 md:py-3 border-b">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
                      {isTitleEditing ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={conversationTitle}
                            onChange={(e) => setConversationTitle(e.target.value)}
                            className="flex-1 text-sm rounded border border-input p-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Enter conversation title..."
                            autoFocus
                          />
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveConversationTitle}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsTitleEditing(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm md:text-base font-medium">
                            {activeConversationId ? (
                              <div className="flex items-center gap-1">
                                {conversationTitle || "Chat"}
                                {activeConversationId && (
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={() => setIsTitleEditing(true)}
                                    title="Edit title"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                      <path d="m15 5 4 4"/>
                                    </svg>
                                  </Button>
                                )}
                              </div>
                            ) : "Chat with AI Assistant"}
                          </CardTitle>
                        </div>
                      )}
                      <div className="flex space-x-2 w-full xs:w-auto overflow-x-auto">
                        {/* Provider selector */}
                        <select
                          value={currentModelConfig.provider}
                          onChange={(e) => handleChangeModelConfig(e.target.value)}
                          className="rounded-md border border-input bg-transparent px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={chatLoading}
                          aria-label="Select AI provider"
                          title="Select AI provider"
                          id="ai-provider-select"
                        >
                          <option value="mistral" className={!availableProviders.includes('mistral') ? 'text-gray-400 italic' : ''}>
                            Mistral {availableProviders.includes('mistral') ? '✓' : '(no key)'}
                          </option>
                          <option value="anthropic" className={!availableProviders.includes('anthropic') ? 'text-gray-400 italic' : ''}>
                            Claude {availableProviders.includes('anthropic') ? '✓' : '(no key)'}
                          </option>
                          <option value="groq" className={!availableProviders.includes('groq') ? 'text-gray-400 italic' : ''}>
                            Groq {availableProviders.includes('groq') ? '✓' : '(no key)'}
                          </option>
                          <option value="deepseek" className={!availableProviders.includes('deepseek') ? 'text-gray-400 italic' : ''}>
                            DeepSeek {availableProviders.includes('deepseek') ? '✓' : '(no key)'}
                          </option>
                          <option value="llama" className={!availableProviders.includes('llama') ? 'text-gray-400 italic' : ''}>
                            Llama {availableProviders.includes('llama') ? '✓' : '(no key)'}
                          </option>
                          <option value="cohere" className={!availableProviders.includes('cohere') ? 'text-gray-400 italic' : ''}>
                            Cohere {availableProviders.includes('cohere') ? '✓' : '(no key)'}
                          </option>
                          <option value="gemini" className={!availableProviders.includes('gemini') ? 'text-gray-400 italic' : ''}>
                            Gemini {availableProviders.includes('gemini') ? '✓' : '(no key)'}
                          </option>
                          <option value="qwen" className={!availableProviders.includes('qwen') ? 'text-gray-400 italic' : ''}>
                            Qwen {availableProviders.includes('qwen') ? '✓' : '(no key)'}
                          </option>
                          <option value="openrouter" className={!availableProviders.includes('openrouter') ? 'text-gray-400 italic' : ''}>
                            OpenRouter {availableProviders.includes('openrouter') ? '✓' : '(no key)'}
                          </option>
                        </select>
                        {/* Model selector */}
                        <select
                          value={currentModelConfig.model}
                          onChange={(e) => handleChangeModelConfig(undefined, e.target.value)}
                          className="rounded-md border border-input bg-transparent px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={chatLoading}
                          aria-label="Select AI model"
                          title="Select AI model"
                          id="ai-model-select"
                        >
                          {renderModelOptions(currentModelConfig.provider)}
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent id="chat-messages-container" className="flex-1 overflow-y-auto p-2 md:p-4">
                    <div className="space-y-3">
                      {chatMessages.slice(1).map((message, index) => (
                        <div 
                          key={index} 
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[85%] rounded-lg p-2 md:p-3 ${
                              message.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-xs md:text-sm break-words">{message.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] rounded-lg bg-muted p-2 md:p-3">
                            <div className="flex space-x-1 md:space-x-2">
                              <div className="h-1.5 w-1.5 md:h-2 md:w-2 animate-bounce rounded-full bg-muted-foreground/50"></div>
                              <div className="h-1.5 w-1.5 md:h-2 md:w-2 animate-bounce rounded-full bg-muted-foreground/50 delay-75"></div>
                              <div className="h-1.5 w-1.5 md:h-2 md:w-2 animate-bounce rounded-full bg-muted-foreground/50 delay-150"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t bg-card p-2 md:p-3">
                    <form 
                      className="flex w-full items-center space-x-2" 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      <input
                        type="text"
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        placeholder="Ask about your finances..."
                        className="flex-1 rounded-lg border border-input bg-background p-1.5 md:p-2 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={chatLoading}
                      />
                      <Button 
                        type="submit" 
                        size="icon"
                        disabled={chatLoading || !userMessage.trim()}
                        className="h-8 w-8 md:h-9 md:w-9"
                      >
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </form>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Past Conversations Section - only show in default layout and when not already showing conversations sidebar */}
      {layoutMode === 'default' && conversations.length > 0 && window.innerWidth < 1024 && (
        <div className="mt-6 md:mt-8">
          <h2 className="mb-3 text-lg font-semibold md:text-xl">Recent Conversations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {conversations.slice(0, 6).map((conversation, index) => (
              <Card 
                key={index} 
                className="overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
                onClick={() => loadConversation(conversation.id)}
              >
                <CardHeader className="p-3 md:p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm md:text-lg font-semibold">
                      {conversation.title || `Conversation ${index + 1}`}
                    </CardTitle>
                    <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <CardDescription className="text-xs md:text-sm">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-4 max-h-24 md:max-h-32 overflow-hidden text-ellipsis">
                  {conversation.messages
                    .filter((msg: AIMessage) => msg.role !== 'system')
                    .slice(0, 2)
                    .map((msg: AIMessage, i: number) => (
                      <p key={i} className="text-xs md:text-sm text-muted-foreground">
                        <span className="font-semibold">
                          {msg.role === 'user' ? 'You: ' : 'Assistant: '}
                        </span>
                        {msg.content.substring(0, 40)}
                        {msg.content.length > 40 ? '...' : ''}
                      </p>
                    ))}
                  {conversation.messages.filter((msg: AIMessage) => msg.role !== 'system').length > 2 && (
                    <p className="mt-1 text-[10px] md:text-xs text-muted-foreground">
                      + {conversation.messages.filter((msg: AIMessage) => msg.role !== 'system').length - 2} more messages
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Add this helper function to render model options per provider
const renderModelOptions = (provider: string) => {
  switch (provider) {
    case 'mistral':
      return (
        <>
          <option value="mistral-tiny">Mistral Tiny</option>
          <option value="mistral-small">Mistral Small</option>
          <option value="mistral-medium">Mistral Medium</option>
          <option value="mistral-large-latest">Mistral Large</option>
        </>
      );
    case 'anthropic':
      return (
        <>
          <option value="claude-3-haiku">Claude 3 Haiku</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
        </>
      );
    case 'groq':
      return (
        <>
          <option value="llama3-8b">Llama 3 8B</option>
          <option value="llama3-70b">Llama 3 70B</option>
          <option value="mixtral-8x7b">Mixtral 8x7B</option>
        </>
      );
    case 'deepseek':
      return (
        <>
          <option value="deepseek-chat">DeepSeek Chat</option>
          <option value="deepseek-coder">DeepSeek Coder</option>
        </>
      );
    case 'llama':
      return (
        <>
          <option value="llama-2-7b">Llama 2 7B</option>
          <option value="llama-2-13b">Llama 2 13B</option>
          <option value="llama-2-70b">Llama 2 70B</option>
          <option value="llama-3-8b">Llama 3 8B</option>
          <option value="llama-3-70b">Llama 3 70B</option>
        </>
      );
    case 'cohere':
      return (
        <>
          <option value="command">Command</option>
          <option value="command-light">Command Light</option>
          <option value="command-r">Command R</option>
          <option value="command-r-plus">Command R+</option>
        </>
      );
    case 'gemini':
      return (
        <>
          <option value="gemini-pro">Gemini Pro</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
        </>
      );
    case 'qwen':
      return (
        <>
          <option value="qwen-turbo">Qwen Turbo</option>
          <option value="qwen-plus">Qwen Plus</option>
          <option value="qwen-max">Qwen Max</option>
        </>
      );
    case 'openrouter':
      return (
        <>
          <option value="openrouter-default">OpenRouter Default</option>
          <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
          <option value="google/gemini-pro">Gemini Pro</option>
          <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
        </>
      );
    default:
      return <option value="mistral-small">Mistral Small</option>;
  }
}; 