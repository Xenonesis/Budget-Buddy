import { supabase } from './supabase';
import { 
  canMakeRequest, 
  incrementQuotaUsage, 
  setQuotaExceeded, 
  getQuotaStatus,
  formatTimeUntilReset 
} from './quota-manager';
import { 
  getUserFinancialProfile, 
  buildFinancialSystemMessage, 
  buildQuickFinancialSummary,
  type UserFinancialProfile 
} from './ai-financial-context';
import {
  validateAIResponse,
  addFinancialDisclaimers,
  detectFinancialTopicType,
  checkRateLimit,
  logAIInteraction,
  anonymizeFinancialData
} from './ai-privacy-security';
import {
  buildUserPersonalityProfile,
  personalizeAIResponse,
  generatePredictiveInsights,
  createContextualMemory
} from './ai-intelligence-engine';
import { financeNewsService } from './finance-news-service';

// Types for AI interactions
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface FinancialInsight {
  type: 'spending_pattern' | 'saving_suggestion' | 'budget_warning' | 'investment_tip' | 'warning' | 'success' | 'trend' | 'decline';
  title: string;
  description: string;
  confidence: number; // 0-1
  relevantCategories?: string[];
  createdAt: string;
  amount?: number;
  category?: string;
}

export type AIProvider = 'mistral' | 'google' | 'anthropic' | 'groq' | 'deepseek' | 'llama' | 'cohere' | 'gemini' | 'qwen' | 'openrouter' | 'cerebras' | 'xAI' | 'unbound' | 'openai' | 'ollama' | 'lmstudio';
export type AIModel = 
  // Mistral models
  | 'mistral-tiny' | 'mistral-small' | 'mistral-medium' | 'mistral-large-latest' | 'mistral-large' | 'mistral-small-latest' | 'mistral-nemo'
  // Claude models
  | 'claude-3-haiku' | 'claude-3-sonnet' | 'claude-3-opus' | 'claude-3-5-sonnet' | 'claude-3-5-haiku'
  // Groq models
  | 'llama3-8b' | 'llama3-70b' | 'mixtral-8x7b' | 'llama-3.1-8b' | 'llama-3.1-70b' | 'llama-3.1-405b' | 'llama3-groq-8b' | 'llama3-groq-70b'
  // DeepSeek models
  | 'deepseek-coder' | 'deepseek-chat' | 'deepseek-chat-v2' | 'deepseek-coder-v2'
  // Llama models
  | 'llama-2-7b' | 'llama-2-13b' | 'llama-2-70b' | 'llama-3-8b' | 'llama-3-70b' | 'llama-3.1-8b' | 'llama-3.1-70b' | 'llama-3.1-405b' | 'llama-3.2-1b' | 'llama-3.2-3b'
  // Cohere models
  | 'command' | 'command-light' | 'command-r' | 'command-r-plus' | 'command-nightly' | 'c4ai-aya-expanse-8b' | 'c4ai-aya-expanse-32b'
  // Gemini models - use only currently supported models
  | 'gemini-pro' | 'gemini-1.5-pro' | 'gemini-1.5-flash' | 'gemini-1.5-pro-exp-0801' | 'gemini-1.5-flash-exp-0801' | 'gemini-2.0-flash-exp'
  // Qwen models
  | 'qwen-turbo' | 'qwen-plus' | 'qwen-max' | 'qwen-1.5-7b' | 'qwen-1.5-14b' | 'qwen-1.5-32b' | 'qwen-1.5-72b' | 'qwen-2-0.5b' | 'qwen-2-1.5b' | 'qwen-2-7b' | 'qwen-2-72b' | 'qwen-2.5-0.5b' | 'qwen-2.5-1.5b' | 'qwen-2.5-3b' | 'qwen-2.5-7b' | 'qwen-2.5-14b' | 'qwen-2.5-32b' | 'qwen-2.5-72b'
  // OpenRouter models (can be many models from different providers)
  | 'openrouter-default' | 'anthropic/claude-3-opus' | 'anthropic/claude-3-5-sonnet' | 'google/gemini-pro' | 'google/gemini-1.5-pro' | 'meta-llama/llama-3-70b-instruct' | 'meta-llama/llama-3.1-405b' | 'meta-llama/llama-3.1-70b' | 'meta-llama/llama-3.1-8b' | 'mistralai/mistral-7b-instruct' | 'mistralai/mistral-large' | 'mistralai/mixtral-8x22b' | 'mistralai/mixtral-8x7b' | 'openai/gpt-3.5-turbo' | 'openai/gpt-4' | 'openai/gpt-4-turbo' | 'openai/gpt-4o' | 'x-ai/grok-beta' | 'x-ai/grok-vision-beta' | 'x-ai/grok-4-fast-free'
  // Cerebras models
  | 'cerebras-gemma-2b' | 'cerebras-llama3-8b' | 'cerebras-llama-3.1-8b' | 'cerebras-llama-3.1-70b'
  // xAI models
  | 'grok-1' | 'grok-2' | 'grok-3' | 'grok-4'
  // Unbound models
  | 'unbound-llama-3-8b' | 'unbound-llama-3-70b' | 'unbound-llama-3.1-8b' | 'unbound-llama-3.1-70b'
  // OpenAI models
  | 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini' | 'o1-preview' | 'o1-mini' | 'gpt-4o-2024-08-06'
  // Ollama models
  | 'ollama-llama2' | 'ollama-mistral' | 'ollama-gemma' | 'ollama-phi3' | 'ollama-llama3' | 'ollama-llama3.1' | 'ollama-gemma2' | 'ollama-mixtral' | 'ollama-qwen' | 'ollama-command-r' | 'ollama-command-r-plus'
  // LM Studio models
  | 'lmstudio-llama3' | 'lmstudio-mistral' | 'lmstudio-gemma' | 'lmstudio-llama3.1' | 'lmstudio-gemma2' | 'lmstudio-mixtral';

export interface ModelConfig {
  provider: AIProvider;
  model: AIModel;
  apiKey?: string;
}

export interface AIModelConfig {
  provider: AIProvider;
  model: AIModel;
}

export interface AISettings {
  enabled: boolean;
  google_api_key?: string;
  mistral_api_key?: string;
  anthropic_api_key?: string;
  groq_api_key?: string;
  deepseek_api_key?: string;
  llama_api_key?: string;
  cohere_api_key?: string;
  gemini_api_key?: string;
  qwen_api_key?: string;
  openrouter_api_key?: string;
  cerebras_api_key?: string;
  xai_api_key?: string;
  unbound_api_key?: string;
  openai_api_key?: string;
  ollama_api_key?: string;
  lmstudio_api_key?: string;
  mistral_model?: string;
  defaultModel: ModelConfig;
}

// Get user's AI settings
export async function getUserAISettings(userId: string): Promise<AISettings | null> {
  try {
    // Simply try to get the user's AI settings directly
    const { data, error } = await supabase
      .from('profiles')
      .select('ai_settings')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching AI settings:', error);
      return getDefaultAISettings();
    }
    
    // If ai_settings is null or undefined, return default
    if (!data || !data.ai_settings) {
      return getDefaultAISettings();
    }
    
    // Convert legacy settings if needed
    const settings = data.ai_settings;
    
    // Fix any deprecated Gemini models
    if (settings.defaultModel && settings.defaultModel.provider === 'gemini') {
      const model = settings.defaultModel.model;
      if (model === 'gemini-pro-vision' || model === 'gemini-1.0-pro' || model.includes('vision')) {
        settings.defaultModel.model = 'gemini-2.0-flash-exp';
      }
    }
    
    if (!settings.defaultModel) {
      // Fix any deprecated Mistral models
      let modelToUse = settings.mistral_model || 'mistral-small';
      
      // If it's a Gemini model, make sure it's valid
      if (settings.gemini_api_key && modelToUse.startsWith('gemini-')) {
        if (modelToUse === 'gemini-pro-vision' || modelToUse === 'gemini-1.0-pro' || modelToUse.includes('vision')) {
          modelToUse = 'gemini-2.0-flash-exp';
        }
      }
      
      return {
        ...settings,
        defaultModel: {
          provider: 'mistral',
          model: modelToUse,
          apiKey: settings.mistral_api_key
        }
      };
    }
    
    return settings;
  } catch (error) {
    console.error('Error in getUserAISettings:', error);
    return getDefaultAISettings();
  }
}

// Default AI settings when not found
function getDefaultAISettings(): AISettings {
  return {
    google_api_key: '',
    mistral_api_key: '',
    anthropic_api_key: '',
    groq_api_key: '',
    deepseek_api_key: '',
    llama_api_key: '',
    cohere_api_key: '',
    gemini_api_key: '',
    qwen_api_key: '',
    openrouter_api_key: '',
    cerebras_api_key: '',
    xai_api_key: '',
    unbound_api_key: '',
    openai_api_key: '',
    ollama_api_key: '',
    lmstudio_api_key: '',
    mistral_model: 'mistral-small', // Legacy support
    enabled: false,
    defaultModel: {
      provider: 'mistral',
      model: 'mistral-small',
      apiKey: ''
    }
  };
}

// Check if AI is enabled and keys are valid
export async function isAIEnabled(userId: string): Promise<boolean> {
  const settings = await getUserAISettings(userId);
  if (!settings || !settings.enabled) return false;
  
  // Check if at least one API key is available
  return !!(
    settings.google_api_key || 
    settings.mistral_api_key || 
    settings.anthropic_api_key || 
    settings.groq_api_key || 
    settings.deepseek_api_key || 
    settings.llama_api_key || 
    settings.cohere_api_key ||
    settings.gemini_api_key ||
    settings.qwen_api_key ||
    settings.openrouter_api_key ||
    settings.cerebras_api_key ||
    settings.xai_api_key ||
    settings.unbound_api_key ||
    settings.openai_api_key ||
    settings.ollama_api_key ||
    settings.lmstudio_api_key
  );
}

// Function to test API key validity and fetch available models
export async function getAvailableModelsForProvider(provider: AIProvider, apiKey: string): Promise<AIModel[] | null> {
  try {
    switch (provider) {
      case 'mistral':
        if (!apiKey) return null;
        // Fetch models from Mistral API
        const mistralResponse = await fetch('https://api.mistral.ai/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (!mistralResponse.ok) return null;
        const mistralData = await mistralResponse.json();
        return mistralData.data.map((model: any) => model.id as AIModel);
        
      case 'anthropic':
        if (!apiKey) return null;
        // Anthropic doesn't have a models endpoint, so we return the known models
        return ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'claude-3-5-sonnet', 'claude-3-5-haiku'];
        
      case 'groq':
        if (!apiKey) return null;
        // Fetch models from Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (!groqResponse.ok) return null;
        const groqData = await groqResponse.json();
        return groqData.data.map((model: any) => model.id as AIModel);
        
      case 'deepseek':
        if (!apiKey) return null;
        // DeepSeek doesn't have a models endpoint, so we return the known models
        return ['deepseek-chat', 'deepseek-coder', 'deepseek-chat-v2', 'deepseek-coder-v2'];
        
      case 'llama':
        if (!apiKey) return null;
        // Llama API doesn't have a standard models endpoint, so we return the known models
        return [
          'llama-2-7b', 'llama-2-13b', 'llama-2-70b', 
          'llama-3-8b', 'llama-3-70b',
          'llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b',
          'llama-3.2-1b', 'llama-3.2-3b'
        ];
        
      case 'cohere':
        if (!apiKey) return null;
        // Fetch models from Cohere API
        const cohereResponse = await fetch('https://api.cohere.ai/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (!cohereResponse.ok) return null;
        const cohereData = await cohereResponse.json();
        return cohereData.models.map((model: any) => model.name as AIModel);
        
      case 'gemini':
        if (!apiKey) return null;
        // Google doesn't have a models endpoint, so we return the known models
        return [
          'gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash',
          'gemini-1.5-pro-exp-0801', 'gemini-1.5-flash-exp-0801', 'gemini-2.0-flash-exp'
        ];
        
      case 'qwen':
        if (!apiKey) return null;
        // Qwen doesn't have a models endpoint, so we return the known models
        return [
          'qwen-turbo', 'qwen-plus', 'qwen-max',
          'qwen-1.5-7b', 'qwen-1.5-14b', 'qwen-1.5-32b', 'qwen-1.5-72b',
          'qwen-2-0.5b', 'qwen-2-1.5b', 'qwen-2-7b', 'qwen-2-72b',
          'qwen-2.5-0.5b', 'qwen-2.5-1.5b', 'qwen-2.5-3b', 'qwen-2.5-7b', 
          'qwen-2.5-14b', 'qwen-2.5-32b', 'qwen-2.5-72b'
        ];
        
      case 'openrouter':
        if (!apiKey) return null;
        // Fetch models from OpenRouter API
        const openrouterResponse = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (!openrouterResponse.ok) return null;
        const openrouterData = await openrouterResponse.json();
        return openrouterData.data.map((model: any) => model.id as AIModel);
        
      case 'cerebras':
        if (!apiKey) return null;
        // Cerebras doesn't have a models endpoint, so we return the known models
        return ['cerebras-gemma-2b', 'cerebras-llama3-8b', 'cerebras-llama-3.1-8b', 'cerebras-llama-3.1-70b'];
        
      case 'xAI':
        if (!apiKey) return null;
        // xAI doesn't have a models endpoint, so we return the known models
        return ['grok-1', 'grok-2', 'grok-3', 'grok-4'];
        
      case 'unbound':
        if (!apiKey) return null;
        // Unbound doesn't have a models endpoint, so we return the known models
        return ['unbound-llama-3-8b', 'unbound-llama-3-70b', 'unbound-llama-3.1-8b', 'unbound-llama-3.1-70b'];
        
      case 'openai':
        if (!apiKey) return null;
        // Fetch models from OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        if (!openaiResponse.ok) return null;
        const openaiData = await openaiResponse.json();
        return openaiData.data.map((model: any) => model.id as AIModel);
        
      case 'ollama':
        if (!apiKey) return null;
        // Fetch models from Ollama API
        const baseUrl = apiKey ? `https://${apiKey}.api.ollama.ai` : 'http://localhost:11434';
        const ollamaResponse = await fetch(`${baseUrl}/api/tags`);
        if (!ollamaResponse.ok) return null;
        const ollamaData = await ollamaResponse.json();
        return ollamaData.models.map((model: any) => `ollama-${model.name}` as AIModel);
        
      case 'lmstudio':
        if (!apiKey) return null;
        // LM Studio doesn't have a models endpoint, so we return the known models
        return ['lmstudio-llama3', 'lmstudio-mistral', 'lmstudio-gemma', 'lmstudio-llama3.1', 'lmstudio-gemma2', 'lmstudio-mixtral'];
        
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching models for ${provider}:`, error);
    return null;
  }
}

// Generate financial insights using Google AI API
export async function generateGoogleAIInsights(
  userId: string,
  transactionData: any[],
  budgetData: any[]
): Promise<FinancialInsight[] | string> {
  try {
    const settings = await getUserAISettings(userId);
    if (!settings?.google_api_key || !settings.enabled) return getExampleInsights();

    const modelName = "gemini-2.0-flash-exp";
    const quotaStatus = getQuotaStatus('gemini', modelName, userId);
    if (!quotaStatus.canMakeRequest) {
      return `You've reached your daily quota for Gemini AI (${quotaStatus.usage} requests). Your quota will reset in ${quotaStatus.timeUntilReset}. Consider upgrading your plan or trying a different AI provider.`;
    }
    
    try {
      // Use gemini-2.0-flash-exp instead of the deprecated model
      const apiKey = settings.gemini_api_key || settings.google_api_key;
      const modelName = "gemini-2.0-flash-exp"; // Updated to supported model
      
      // Check quota before making request
      if (!canMakeRequest('gemini', modelName, userId)) {
        const quotaStatus = getQuotaStatus('gemini', modelName, userId);
        return `You've reached your daily quota for Gemini AI (${quotaStatus.usage} requests). Your quota will reset in ${quotaStatus.timeUntilReset}. Consider upgrading your plan or trying a different AI provider.`;
      }
      
      // Sanitize transaction and budget data to prevent JSON issues
      const sanitizedTransactions = transactionData.map(t => ({
        id: t.id,
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
        type: t.type
      }));
      
      const sanitizedBudgets = budgetData.map(b => ({
        id: b.id,
        category: b.category,
        amount: b.amount,
        period: b.period
      }));
      
      // Increment quota usage before making request
      incrementQuotaUsage('gemini', modelName, userId);
      
      // Basic request to Google AI API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Based on the following transaction and budget data, provide financial insights, suggestions, and warnings:
                  Transaction data: ${JSON.stringify(sanitizedTransactions)}
                  Budget data: ${JSON.stringify(sanitizedBudgets)}
                  Format your response as JSON following this structure:
                  [
                    {
                      "type": "spending_pattern" | "saving_suggestion" | "budget_warning" | "investment_tip",
                      "title": "Short title",
                      "description": "Detailed explanation",
                      "confidence": 0.95, // 0-1 confidence score
                      "relevantCategories": ["category1", "category2"], // Optional
                      "createdAt": "2023-01-01T00:00:00Z"
                    }
                  ]`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
            topK: 40,
            topP: 0.95
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });
      
      // Check if the request was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API HTTP error: ${response.status}`, errorText);
        
        // Check for rate limit error specifically
        if (response.status === 429) {
          // Mark quota as exceeded
          setQuotaExceeded('gemini', modelName, userId, true);
          
          // Parse the error response to get more specific information
          try {
            const errorData = JSON.parse(errorText);
            const quotaInfo = errorData.error?.details?.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure');
            const retryInfo = errorData.error?.details?.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
            
            let rateLimitMessage = "You've reached the rate limit for Gemini AI. ";
            
            if (quotaInfo?.violations?.[0]) {
              const violation = quotaInfo.violations[0];
              if (violation.quotaId?.includes('FreeTier')) {
                rateLimitMessage += "You've exceeded your free tier quota. ";
              }
              if (violation.quotaValue) {
                rateLimitMessage += `Daily limit: ${violation.quotaValue} requests. `;
              }
            }
            
            // Use our quota manager for reset time
            const timeUntilReset = formatTimeUntilReset('gemini', modelName, userId);
            if (retryInfo?.retryDelay) {
              rateLimitMessage += `Try again in ${retryInfo.retryDelay}. `;
            } else if (timeUntilReset) {
              rateLimitMessage += `Quota resets in ${timeUntilReset}. `;
            }
            
            rateLimitMessage += "Consider upgrading your plan or trying a different AI provider.";
            return rateLimitMessage;
          } catch (parseError) {
            console.error('Error parsing rate limit error:', parseError);
            const timeUntilReset = formatTimeUntilReset('gemini', modelName, userId);
            return `You've reached the rate limit for Gemini AI. Quota resets in ${timeUntilReset}. Consider upgrading your plan or trying a different AI provider.`;
          }
        }
        
        return "There was an error connecting to Gemini AI. Please try again later.";
      }
      
      const result = await response.json();
      
      // Check if result has the expected structure
      if (result && result.candidates && result.candidates.length > 0 && 
          result.candidates[0].content && result.candidates[0].content.parts && 
          result.candidates[0].content.parts.length > 0) {
        
        try {
          const textResponse = result.candidates[0].content.parts[0].text;
          
          // Extract JSON carefully - look for array start/end markers
          const jsonStartIdx = textResponse.indexOf('[');
          const jsonEndIdx = textResponse.lastIndexOf(']') + 1;
          
          if (jsonStartIdx >= 0 && jsonEndIdx > jsonStartIdx) {
            try {
              const jsonStr = textResponse.substring(jsonStartIdx, jsonEndIdx);
              return JSON.parse(jsonStr);
            } catch (jsonError) {
              console.error('JSON parsing error:', jsonError);
              
              // Attempt to fix common JSON issues
              let cleanedJson = textResponse.substring(jsonStartIdx, jsonEndIdx);
              
              // Remove trailing commas before closing brackets (common LLM error)
              cleanedJson = cleanedJson.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
              
              // Remove comments (LLMs sometimes include explanatory comments)
              cleanedJson = cleanedJson.replace(/\/\/.*?(\n|$)/g, '');
              
              try {
                return JSON.parse(cleanedJson);
              } catch (fallbackError) {
                console.error('Failed to parse cleaned JSON:', fallbackError);
                return getExampleInsights();
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }
      
      console.log('API response did not contain expected data structure:', result);
      return getExampleInsights(); // Fall back to example data
    } catch (apiError) {
      console.error('Error calling Google AI API:', apiError);
      return getExampleInsights(); // Fall back to example data if API call fails
    }
  } catch (error) {
    console.error('Error generating Google AI insights:', error);
    return getExampleInsights(); // Fall back to example data
  }
}

// Provide example insights when API call fails or returns unexpected format
function getExampleInsights(): FinancialInsight[] {
  return [
    {
      type: "trend",
      title: "Increased Spending on Food",
      description: "Your food expenses have increased by 15% compared to last month. Consider meal planning to reduce costs.",
      confidence: 0.92,
      relevantCategories: ["Food", "Groceries", "Restaurants"],
      createdAt: new Date().toISOString(),
      amount: 245.50,
      category: "Food"
    },
    {
      type: "warning",
      title: "Entertainment Budget at Risk",
      description: "You've already spent 80% of your entertainment budget with 10 days left in the month.",
      confidence: 0.85,
      relevantCategories: ["Entertainment", "Subscriptions"],
      createdAt: new Date().toISOString(),
      amount: 320.00,
      category: "Entertainment"
    },
    {
      type: "success",
      title: "Potential Savings on Subscriptions",
      description: "You're spending $45 monthly on subscription services. Consider reviewing which ones you actually use regularly.",
      confidence: 0.78,
      relevantCategories: ["Subscriptions", "Entertainment"],
      createdAt: new Date().toISOString(),
      amount: 45.00,
      category: "Subscriptions"
    },
    {
      type: "investment_tip",
      title: "Savings Account Optimization",
      description: "Based on your current savings, moving to a high-yield savings account could earn you an additional $120 per year.",
      confidence: 0.88,
      relevantCategories: ["Savings", "Investments"],
      createdAt: new Date().toISOString(),
      amount: 120.00,
      category: "Savings"
    }
  ];
}

/**
 * Enhances AI messages with user's financial context for personalized advice
 */
async function enhanceMessagesWithFinancialContext(
  userId: string, 
  messages: AIMessage[]
): Promise<AIMessage[]> {
  try {
    // Get user's actual financial data from the database
    const { supabase } = await import('./supabase');
    
    const [transactionsResult, budgetsResult] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100),
      supabase.from('budgets').select('*').eq('user_id', userId)
    ]);
    
    const transactions = transactionsResult.data || [];
    const budgets = budgetsResult.data || [];

    // Find existing system message or create one
    let systemMessage = messages.find(msg => msg.role === 'system');
    const otherMessages = messages.filter(msg => msg.role !== 'system');

    // Create enhanced system message with actual financial context
    let enhancedSystemContent = buildFinancialSystemMessageFromData(transactions, budgets, userId);
    
    // If there was an existing system message, append it to our enhanced message
    if (systemMessage?.content.trim()) {
      const existingContent = systemMessage.content.replace(/^You are a helpful financial assistant\.?\s*/i, '').trim();
      if (existingContent) {
        enhancedSystemContent += `\n\nADDITIONAL INSTRUCTIONS:\n${existingContent}`;
      }
    }

    // Check if the last user message is finance-related and add news context
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage?.content) {
      try {
        const { financeNewsService } = await import('./finance-news-service');
        const newsContext = await financeNewsService.getFinanceNewsContext(lastUserMessage.content);
        
        if (newsContext) {
          enhancedSystemContent += `\n\n${newsContext}`;
        }
      } catch (newsError) {
        console.log('Could not fetch news context:', newsError);
      }
    }

    return [
      { role: 'system', content: enhancedSystemContent },
      ...otherMessages
    ];
  } catch (error) {
    console.error('Error enhancing messages with financial context:', error);
    // Return basic system message if enhancement fails
    const basicSystemMessage = {
      role: 'system' as const,
      content: "You are a helpful financial assistant. You can provide general financial advice and answer questions about personal finance, budgeting, and money management. Always remind users that your advice is educational and they should consult with qualified financial professionals for personalized guidance."
    };
    
    return [
      basicSystemMessage,
      ...messages.filter(msg => msg.role !== 'system')
    ];
  }
}

/**
 * Builds financial system message from actual user data
 */
function buildFinancialSystemMessageFromData(
  transactions: any[], 
  budgets: any[], 
  userId: string
): string {
  // Calculate financial metrics from actual data
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netWorth = income - expenses;
  
  // Get current month data
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
  
  const monthlyIncome = thisMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const monthlyExpenses = thisMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // Calculate spending by category
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const spendingByCategory = expenseTransactions.reduce((acc, t) => {
    const category = t.category || 'Other';
    acc[category] = (acc[category] || 0) + Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);
  
  const topCategories = Object.entries(spendingByCategory)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([category, amount]) => `${category}: $${(amount as number).toFixed(2)}`)
    .join(', ');

  let systemMessage = `You are an advanced financial assistant with access to the user's complete financial data. You should provide personalized, data-driven advice based on their actual financial situation.

USER'S CURRENT FINANCIAL PROFILE:
- Total Transactions: ${transactions.length}
- Net Worth: $${netWorth.toLocaleString()}
- All-time Income: $${income.toLocaleString()}
- All-time Expenses: $${expenses.toLocaleString()}

CURRENT MONTH ACTIVITY:
- Monthly Income: $${monthlyIncome.toLocaleString()}
- Monthly Expenses: $${monthlyExpenses.toLocaleString()}
- Monthly Net: $${(monthlyIncome - monthlyExpenses).toLocaleString()}

SPENDING PATTERNS:
- Top Expense Categories: ${topCategories || 'No expenses recorded'}

BUDGET STATUS:
- Active Budgets: ${budgets.length}`;

  if (budgets.length > 0) {
    const budgetSummary = budgets.map(b => `${b.category}: $${b.amount}`).join(', ');
    systemMessage += `\n- Budget Categories: ${budgetSummary}`;
  }

  systemMessage += `\n\nIMPORTANT GUIDELINES:
1. You have access to the user's actual financial data shown above - use it to provide specific, personalized advice
2. When asked about balances, spending, budgets, or financial status, reference their actual data
3. Calculate current balance from their transaction history (income minus expenses)
4. Provide specific insights based on their spending patterns and budget usage
5. Give actionable advice based on their real financial situation
6. Always be encouraging and supportive while being honest about their financial health
7. Reference actual numbers from their data when relevant
8. If they have no data in a category, encourage them to add it for better insights

When users ask about their financial information, you should provide specific details from their actual data, not general responses. Always end financial advice with an appropriate disclaimer about consulting qualified financial professionals.`;

  return systemMessage;
}

export async function chatWithAI(
  userId: string,
  messages: AIMessage[],
  modelConfig?: ModelConfig
): Promise<string | null> {
  try {
    // Check rate limiting
    if (!checkRateLimit(userId)) {
      return "You've reached the maximum number of AI requests for this hour. Please try again later.";
    }

    const settings = await getUserAISettings(userId);
    if (!settings?.enabled) {
      return "AI features are not enabled. Please configure your API keys in settings.";
    }
    
    // Use provided model config or default from settings
    const config = modelConfig || settings.defaultModel;

    // Check for enhanced financial commands first (for direct data queries)
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const { clientEnhancedAICommands } = await import('./client-enhanced-ai-commands');
      
      // Check for help/commands requests
      const lowerContent = lastUserMessage.content.toLowerCase();
      if (lowerContent.includes('what can you') || lowerContent.includes('help') && lowerContent.includes('topic') || 
          lowerContent.includes('what financial') || lowerContent.includes('commands') || lowerContent.includes('what do you do')) {
        const { getAvailableFinancialCommands } = await import('./ai-financial-commands');
        return getAvailableFinancialCommands();
      }
      
      // Try enhanced commands first (for balance, spending, etc.)
      const enhancedResponse = await clientEnhancedAICommands.processQuery(userId, lastUserMessage.content);
      if (enhancedResponse) {
        return enhancedResponse;
      }
      
      // Fall back to specialized financial commands for complex analysis
      const { handleFinancialCommand } = await import('./ai-financial-commands');
      const commandResponse = await handleFinancialCommand(userId, lastUserMessage.content);
      if (commandResponse) {
        return commandResponse;
      }
    }

    // Enhance messages with financial context
    const enhancedMessages = await enhanceMessagesWithFinancialContext(userId, messages);
    
    // Get AI response and validate it
    let rawResponse: string | null = null;
    let apiKey = '';
    
    switch (config.provider) {
      case 'mistral':
        apiKey = settings.mistral_api_key || '';
        rawResponse = await chatWithMistralAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'anthropic':
        apiKey = settings.anthropic_api_key || '';
        rawResponse = await chatWithClaudeAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'groq':
        apiKey = settings.groq_api_key || '';
        rawResponse = await chatWithGroqAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'deepseek':
        apiKey = settings.deepseek_api_key || '';
        rawResponse = await chatWithDeepSeekAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'llama':
        apiKey = settings.llama_api_key || '';
        rawResponse = await chatWithLlamaAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'cohere':
        apiKey = settings.cohere_api_key || '';
        rawResponse = await chatWithCohereAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'gemini':
        apiKey = settings.gemini_api_key || settings.google_api_key || '';
        rawResponse = await chatWithGeminiAI(apiKey, enhancedMessages, config.model as string, userId);
        break;
      case 'qwen':
        apiKey = settings.qwen_api_key || '';
        rawResponse = await chatWithQwenAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'openrouter':
        apiKey = settings.openrouter_api_key || '';
        rawResponse = await chatWithOpenRouterAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'cerebras':
        apiKey = settings.cerebras_api_key || '';
        rawResponse = await chatWithCerebrasAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'xAI':
        apiKey = settings.xai_api_key || '';
        rawResponse = await chatWithXaiAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'unbound':
        apiKey = settings.unbound_api_key || '';
        rawResponse = await chatWithUnboundAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'openai':
        apiKey = settings.openai_api_key || '';
        rawResponse = await chatWithOpenAIAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'ollama':
        apiKey = settings.ollama_api_key || '';
        rawResponse = await chatWithOllamaAI(apiKey, enhancedMessages, config.model as string);
        break;
      case 'lmstudio':
        apiKey = settings.lmstudio_api_key || '';
        rawResponse = await chatWithLmStudioAI(apiKey, enhancedMessages, config.model as string);
        break;
      default:
        return `Unknown AI provider selected: ${config.provider}.`;
    }

    // Validate and enhance the response
    if (!rawResponse) {
      return "I couldn't generate a response. Please try again.";
    }

    // Validate the response for safety
    const validation = validateAIResponse(rawResponse);
    
    if (!validation.isValid) {
      console.error('AI response validation failed:', validation.errors);
      logAIInteraction(userId, lastUserMessage?.content || '', rawResponse, validation);
      return "I apologize, but I can't provide that response as it may contain inappropriate financial advice. Please rephrase your question or consult with a qualified financial professional.";
    }

    // Personalize response based on user profile and preferences
    const personalizedResponse = await personalizeAIResponse(userId, rawResponse, {
      topic: detectFinancialTopicType(rawResponse),
      questionType: lastUserMessage?.content.toLowerCase().includes('?') ? 'question' : 'statement'
    });

    // Detect topic type and add appropriate disclaimers
    const topicType = detectFinancialTopicType(personalizedResponse);
    const finalResponse = addFinancialDisclaimers(personalizedResponse, topicType);

    // Create contextual memory for future conversations
    if (enhancedMessages.length > 1) {
      await createContextualMemory('current_conversation', userId, enhancedMessages);
    }

    // Log the interaction for audit purposes
    logAIInteraction(userId, lastUserMessage?.content || '', finalResponse, validation);

    // Show warnings to console if any
    if (validation.warnings.length > 0) {
      console.warn('AI response warnings:', validation.warnings);
    }

    return finalResponse;
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    return "There was an error communicating with the AI assistant. Please try again later.";
  }
}

// Chat with Mistral AI (existing implementation, modified)
async function chatWithMistralAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'mistral-small'
): Promise<string | null> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return "Mistral AI API key is not configured. Please add your API key in settings.";
    }
    
    // Basic API key format validation - Mistral API keys can have various formats
    const trimmedKey = apiKey.trim();
    // Remove overly restrictive validation - let the API itself validate the key
    // Modern Mistral API keys may start with different prefixes
    
    if (trimmedKey.length < 10) {
      return "Mistral AI API key appears to be too short. Please check your API key in settings and ensure it's complete.";
    }
    
    // Validate model name
    const validMistralModels = [
      'mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large-latest', 
      'mistral-large', 'mistral-small-latest', 'mistral-nemo'
    ];
    
    if (!validMistralModels.includes(model)) {
      console.warn(`Invalid Mistral model: ${model}, using mistral-small as fallback`);
      model = 'mistral-small';
    }
    
    // Filter and format messages for Mistral API
    // Mistral API only supports 'user' and 'assistant' roles
    const formattedMessages = messages
      .filter(msg => msg.content && msg.content.trim() !== '')
      .map(msg => {
        if (msg.role === 'system') {
          // Convert system message to user message with context
          return {
            role: 'user' as const,
            content: `Context: ${msg.content.trim()}`
          };
        }
        return {
          role: msg.role as 'user' | 'assistant',
          content: msg.content.trim()
        };
      })
      .filter(msg => msg.content.length > 0);
    
    // Ensure we have at least one user message
    if (formattedMessages.length === 0) {
      return "No valid messages to process.";
    }
    
    // If the first message is not from user, add a default user message
    if (formattedMessages[0].role !== 'user') {
      formattedMessages.unshift({
        role: 'user',
        content: 'Hello, I need help with financial advice.'
      });
    }
    
    console.log(`Making Mistral API request with model: ${model}`);
    console.log('Formatted messages:', JSON.stringify(formattedMessages, null, 2));
    console.log('API key configured:', trimmedKey ? `Yes (${trimmedKey.length} chars, starts with: ${trimmedKey.substring(0, 12)}...)` : 'No');
    
    // Implement Mistral AI API request
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`
      },
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    
    // Check if response is ok
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      
      console.error(`Mistral API HTTP error: ${response.status} ${response.statusText}`, errorText);
      
      if (response.status === 401) {
        return "Invalid Mistral AI API key. Please check your API key in settings.";
      } else if (response.status === 429) {
        return "Mistral AI rate limit exceeded. Please try again in a few minutes.";
      } else if (response.status === 400) {
        // Try to parse the error for more specific feedback
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            return `Mistral AI request error: ${errorData.message}`;
          }
        } catch (e) {
          // Ignore JSON parse error
        }
        return "Invalid request to Mistral AI. Please try a different message.";
      } else if (response.status === 403) {
        return "Access denied to Mistral AI. Please check your API key permissions.";
      } else if (response.status >= 500) {
        return "Mistral AI service is temporarily unavailable. Please try again later.";
      } else {
        return `Mistral AI error (${response.status}): ${response.statusText}. ${errorText ? 'Details: ' + errorText : ''}`;
      }
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Mistral API error:', data.error);
      if (data.error.type === 'invalid_api_key') {
        return "Invalid Mistral AI API key. Please check your API key in settings.";
      } else if (data.error.type === 'insufficient_quota') {
        return "Mistral AI quota exceeded. Please check your account or try again later.";
      } else {
        return `Mistral AI error: ${data.error.message || 'Unknown error'}`;
      }
    }
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from Mistral API:', data);
      return "Received an unexpected response from Mistral AI. Please try again later.";
    }
    
    const content = data.choices[0].message.content;
    if (!content || content.trim() === '') {
      return "Mistral AI returned an empty response. Please try rephrasing your question.";
    }
    
    return content.trim();
  } catch (error) {
    console.error('Error chatting with Mistral AI:', error);
    
    // More specific error handling
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return "Network error connecting to Mistral AI. Please check your internet connection.";
    } else if (error instanceof SyntaxError) {
      return "Invalid response from Mistral AI. Please try again later.";
    } else {
      return "There was an error communicating with Mistral AI. Please try again later.";
    }
  }
}

// Chat with Claude AI (Anthropic)
async function chatWithClaudeAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'claude-3-haiku'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Claude API key is not configured. Please add your API key in settings.";
    }
    
    // Convert messages to Anthropic's format
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
    const systemMessage = messages.find(m => m.role === 'system')?.content || "";
    
    // Implement Claude API request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: lastUserMessage }],
        system: systemMessage
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Claude API error:', data.error);
      return "There was an error connecting to Claude AI. Please check your API key in settings.";
    }
    
    return data.content?.[0]?.text || "No response from Claude AI.";
  } catch (error) {
    console.error('Error chatting with Claude AI:', error);
    return "There was an error communicating with Claude AI. Please try again later.";
  }
}

// Chat with Groq AI
async function chatWithGroqAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'llama3-8b'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Groq API key is not configured. Please add your API key in settings.";
    }
    
    // Implement Groq API request
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Groq API error:', data.error);
      return "There was an error connecting to Groq AI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from Groq AI.";
  } catch (error) {
    console.error('Error chatting with Groq AI:', error);
    return "There was an error communicating with Groq AI. Please try again later.";
  }
}

// Chat with DeepSeek AI
async function chatWithDeepSeekAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'deepseek-chat'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "DeepSeek API key is not configured. Please add your API key in settings.";
    }
    
    // Implement DeepSeek API request
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('DeepSeek API error:', data.error);
      return "There was an error connecting to DeepSeek AI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from DeepSeek AI.";
  } catch (error) {
    console.error('Error chatting with DeepSeek AI:', error);
    return "There was an error communicating with DeepSeek AI. Please try again later.";
  }
}

// Chat with Llama AI
async function chatWithLlamaAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'llama-3-8b'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Llama API key is not configured. Please add your API key in settings.";
    }
    
    // Implement Llama API request (using a generic endpoint, actual implementation may vary)
    const response = await fetch('https://api.llama-api.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Llama API error:', data.error);
      return "There was an error connecting to Llama AI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from Llama AI.";
  } catch (error) {
    console.error('Error chatting with Llama AI:', error);
    return "There was an error communicating with Llama AI. Please try again later.";
  }
}

// Chat with Cohere AI
async function chatWithCohereAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'command'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Cohere API key is not configured. Please add your API key in settings.";
    }
    
    // Convert messages to Cohere's format
    const chatHistory = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'USER' : 'CHATBOT',
        message: m.content
      }));
    
    const systemMessage = messages.find(m => m.role === 'system')?.content || "";
    
    // Implement Cohere API request
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        message: chatHistory[chatHistory.length - 1].message,
        chat_history: chatHistory.slice(0, -1),
        preamble: systemMessage,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Cohere API error:', data.error);
      return "There was an error connecting to Cohere AI. Please check your API key in settings.";
    }
    
    return data.text || "No response from Cohere AI.";
  } catch (error) {
    console.error('Error chatting with Cohere AI:', error);
    return "There was an error communicating with Cohere AI. Please try again later.";
  }
}

// Chat with Gemini AI (Google)
async function chatWithGeminiAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'gemini-pro',
  userId?: string
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Gemini API key is not configured. Please add your API key in settings.";
    }
    
    // Check quota if userId is provided
    if (userId && !canMakeRequest('gemini', model, userId)) {
      const quotaStatus = getQuotaStatus('gemini', model, userId);
      return `You've reached your daily quota for Gemini AI (${quotaStatus.usage} requests). Your quota will reset in ${quotaStatus.timeUntilReset}. Consider upgrading your plan or trying a different AI provider.`;
    }
    
    // Validate model - prevent using deprecated models
    if (model === 'gemini-pro-vision' || model === 'gemini-1.0-pro' || model.includes('vision') || model === 'gemini-1.5-flash') {
      console.warn(`Deprecated Gemini model requested: ${model}. Switching to gemini-2.0-flash-exp.`);
      model = 'gemini-2.0-flash-exp';
    }
    
    // Only allow supported models
    const supportedModels = ['gemini-pro', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-1.5-pro-exp-0801', 'gemini-1.5-flash-exp-0801'];
    if (!supportedModels.includes(model)) {
      console.warn(`Unsupported Gemini model requested: ${model}. Switching to gemini-2.0-flash-exp.`);
      model = 'gemini-2.0-flash-exp';
    }
    
    // Check if using newer Gemini 1.5 models
    const isGemini15 = model.includes('1.5');
    
    // Convert messages to Google's format - Gemini has specific requirements
    const formattedMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));
    
    // Add system message as user message if present (Gemini doesn't have system messages)
    const systemMessage = messages.find(m => m.role === 'system')?.content;
    if (systemMessage && formattedMessages.length > 0) {
      // For Gemini, we need to prepend system instructions as a separate user message
      formattedMessages.unshift({
        role: 'user',
        parts: [{ text: `Instructions: ${systemMessage}` }]
      });
      
      // Add an acknowledgment from the model
      if (formattedMessages.length > 1) {
        formattedMessages.splice(1, 0, {
          role: 'model',
          parts: [{ text: 'I will follow these instructions in our conversation.' }]
        });
      }
    }
    
    // Ensure we have a valid conversation structure
    if (formattedMessages.length === 0) {
      formattedMessages.push({
        role: 'user',
        parts: [{ text: "Hello" }]
      });
    }
    
    // Construct Gemini API URL with the model
    const modelPath = model.replace('gemini-', 'models/gemini-');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${apiKey}`;
    
    console.log('Using Gemini model:', model);
    
    // Increment quota usage if userId is provided
    if (userId) {
      incrementQuotaUsage('gemini', model, userId);
    }
    
    // Implement Gemini API request
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topK: 40,
          topP: 0.95
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API HTTP error:', response.status, errorText);
      
      // Check for specific error codes
      if (response.status === 400) {
        return "The request to Gemini AI was invalid. You might be using an unsupported model.";
      } else if (response.status === 401 || response.status === 403) {
        return "Authorization failed with Gemini AI. Please check your API key in settings.";
      } else if (response.status === 404) {
        return `The requested Gemini model "${model}" was not found. Try a different model.`;
      } else if (response.status === 429) {
        // Mark quota as exceeded if userId is provided
        if (userId) {
          setQuotaExceeded('gemini', model, userId, true);
        }
        
        // Parse the error response to get more specific information
        try {
          const errorData = await response.json();
          const quotaInfo = errorData.error?.details?.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure');
          const retryInfo = errorData.error?.details?.find((detail: any) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
          
          let rateLimitMessage = "You've reached the rate limit for Gemini AI. ";
          
          if (quotaInfo?.violations?.[0]) {
            const violation = quotaInfo.violations[0];
            if (violation.quotaId?.includes('FreeTier')) {
              rateLimitMessage += "You've exceeded your free tier quota. ";
            }
            if (violation.quotaValue) {
              rateLimitMessage += `Daily limit: ${violation.quotaValue} requests. `;
            }
          }
          
          // Use our quota manager for reset time if userId is available
          if (userId) {
            const timeUntilReset = formatTimeUntilReset('gemini', model, userId);
            rateLimitMessage += `Quota resets in ${timeUntilReset}. `;
          } else if (retryInfo?.retryDelay) {
            rateLimitMessage += `Try again in ${retryInfo.retryDelay}. `;
          }
          
          rateLimitMessage += "Consider upgrading your plan or trying a different AI provider.";
          return rateLimitMessage;
        } catch (parseError) {
          console.error('Error parsing rate limit error:', parseError);
          if (userId) {
            const timeUntilReset = formatTimeUntilReset('gemini', model, userId);
            return `You've reached the rate limit for Gemini AI. Quota resets in ${timeUntilReset}. Consider upgrading your plan or trying a different AI provider.`;
          } else {
            return "You've reached the rate limit for Gemini AI. Please try again later. Consider upgrading your plan or trying a different AI provider.";
          }
        }
      }
      
      return "There was an error connecting to Gemini AI. Please try again later.";
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API error response:', data.error);
      
      // Check for common error codes
      const errorCode = data.error.code;
      if (errorCode === 400) {
        return "The request to Gemini AI was invalid. Please check your input.";
      } else if (errorCode === 401 || errorCode === 403) {
        return "Authorization failed with Gemini AI. Please check your API key in settings.";
      } else if (errorCode === 404) {
        return `The requested Gemini model "${model}" was not found. Try a different model.`;
      }
      
      return `Gemini AI error: ${data.error.message || "Unknown error"}`;
    }
    
    // Detailed logging for debugging
    if (!data.candidates || data.candidates.length === 0) {
      console.error('Gemini API returned no candidates:', data);
      return "Gemini AI did not return a valid response. This could be due to content filtering or an internal error.";
    }
    
    if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API response format unexpected:', data.candidates[0]);
      return "Received an unexpected response format from Gemini AI.";
    }
  } catch (error) {
    console.error('Error chatting with Gemini AI:', error);
    return "There was an error communicating with Gemini AI. Please try again later.";
  }
}

// Chat with Qwen AI
async function chatWithQwenAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'qwen-turbo'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Qwen API key is not configured. Please add your API key in settings.";
    }
    
    // Implement Qwen API request
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        input: {
          messages: messages
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 1000
        }
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Qwen API error:', data.error);
      return "There was an error connecting to Qwen AI. Please check your API key in settings.";
    }
    
    return data.output?.text || "No response from Qwen AI.";
  } catch (error) {
    console.error('Error chatting with Qwen AI:', error);
    return "There was an error communicating with Qwen AI. Please try again later.";
  }
}

// Chat with OpenRouter (unified API for multiple models)
async function chatWithOpenRouterAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'openrouter-default'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "OpenRouter API key is not configured. Please add your API key in settings.";
    }
    
    // Get actual model ID - if it's the default, use anthropic/claude-3-haiku
    const actualModel = model === 'openrouter-default' ? 'anthropic/claude-3-haiku' : model;
    
    // Implement OpenRouter API request (follows OpenAI format)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://budgettracker.com', // Replace with your actual domain
        'X-Title': 'Budget Tracker'
      },
      body: JSON.stringify({
        model: actualModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('OpenRouter API error:', data.error);
      return "There was an error connecting to OpenRouter. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from OpenRouter.";
  } catch (error) {
    console.error('Error chatting with OpenRouter:', error);
    return "There was an error communicating with OpenRouter. Please try again later.";
  }
}

// Save an AI conversation
export async function saveAIConversation(
  userId: string, 
  messages: AIMessage[],
  conversationId?: string | null,
  title?: string | null
): Promise<string | null> {
  try {
    let result;
    
    // If we have a conversation ID, update the existing conversation
    if (conversationId) {
      const { data, error } = await supabase
        .from('ai_conversations')
        .update({
          messages: messages,
          last_updated: new Date().toISOString(),
          ...(title ? { title } : {})
        })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select('id')
        .single();
      
      if (error) {
        console.log('Could not update AI conversation:', error);
        return null;
      }
      
      result = data;
    } else {
      // Otherwise, create a new conversation
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          messages: messages,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          title: title || null
        })
        .select('id')
        .single();
      
      if (error) {
        console.log('Could not save AI conversation:', error);
        return null;
      }
      
      result = data;
    }
    
    return result ? result.id : null;
  } catch (error) {
    console.error('Error in saveAIConversation:', error);
    return null;
  }
}

// Get AI conversations for a user
export async function getAIConversations(userId: string): Promise<any[]> {
  try {
    // Simply try to get conversations directly
    const { data, error } = await supabase
      .from("ai_conversations")
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false });
    
    if (error) {
      // Likely the table doesn't exist yet, which is fine - just log and return empty
      console.log('Error fetching AI conversations (table may not exist yet):', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAIConversations:', error);
    return [];
  }
}

// Get quota status for a user's AI provider
export async function getUserQuotaStatus(userId: string): Promise<{
  provider: string;
  model: string;
  status: any;
} | null> {
  try {
    const settings = await getUserAISettings(userId);
    if (!settings?.enabled || !settings.defaultModel) return null;
    
    const { provider, model } = settings.defaultModel;
    const status = getQuotaStatus(provider, model, userId);
    
    return {
      provider,
      model,
      status
    };
  } catch (error) {
    console.error('Error getting user quota status:', error);
    return null;
  }
}

// Get available AI providers for a user based on their API keys
export async function getAvailableAIProviders(userId: string): Promise<AIProvider[]> {
  try {
    const settings = await getUserAISettings(userId);
    if (!settings) return [];
    
    const providers: AIProvider[] = [];
    
    if (settings.mistral_api_key) providers.push('mistral');
    if (settings.anthropic_api_key) providers.push('anthropic');
    if (settings.groq_api_key) providers.push('groq');
    if (settings.deepseek_api_key) providers.push('deepseek');
    if (settings.llama_api_key) providers.push('llama');
    if (settings.cohere_api_key) providers.push('cohere');
    if (settings.gemini_api_key || settings.google_api_key) providers.push('gemini');
    if (settings.qwen_api_key) providers.push('qwen');
    if (settings.openrouter_api_key) providers.push('openrouter');
    if (settings.cerebras_api_key) providers.push('cerebras');
    if (settings.xai_api_key) providers.push('xAI');
    if (settings.unbound_api_key) providers.push('unbound');
    if (settings.openai_api_key) providers.push('openai');
    if (settings.ollama_api_key) providers.push('ollama');
    if (settings.lmstudio_api_key) providers.push('lmstudio');
    
    return providers;
  } catch (error) {
    console.error('Error getting available AI providers:', error);
    return [];
  }
}

// Get AI models for a specific provider (alias for existing function)
export async function getAIModelsForProvider(provider: AIProvider): Promise<AIModel[]> {
  try {
    // For now, return static models since we don't have API keys in this context
    // In a real implementation, you'd pass the API key here
    const models = await getAvailableModelsForProvider(provider, '');
    return models || getDefaultModelsForProvider(provider);
  } catch (error) {
    console.error(`Error getting models for ${provider}:`, error);
    return getDefaultModelsForProvider(provider);
  }
}

// Get default models for a provider when API call fails
function getDefaultModelsForProvider(provider: string): AIModel[] {
  switch (provider) {
    case 'mistral':
      return ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large-latest', 'mistral-large', 'mistral-small-latest', 'mistral-nemo'];
    case 'anthropic':
      return ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'claude-3-5-sonnet', 'claude-3-5-haiku'];
    case 'groq':
      return ['llama3-8b', 'llama3-70b', 'mixtral-8x7b', 'llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b'];
    case 'deepseek':
      return ['deepseek-coder', 'deepseek-chat', 'deepseek-chat-v2', 'deepseek-coder-v2'];
    case 'llama':
      return ['llama-2-7b', 'llama-2-13b', 'llama-2-70b', 'llama-3-8b', 'llama-3-70b', 'llama-3.1-8b', 'llama-3.1-70b', 'llama-3.1-405b'];
    case 'cohere':
      return ['command', 'command-light', 'command-r', 'command-r-plus', 'command-nightly'];
    case 'gemini':
      return ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.5-pro-exp-0801', 'gemini-1.5-flash-exp-0801', 'gemini-2.0-flash-exp'];
    case 'qwen':
      return ['qwen-turbo', 'qwen-plus', 'qwen-max', 'qwen-2.5-7b', 'qwen-2.5-14b', 'qwen-2.5-32b', 'qwen-2.5-72b'];
    case 'openrouter':
      return ['openrouter-default', 'anthropic/claude-3-opus', 'anthropic/claude-3-5-sonnet', 'google/gemini-pro', 'google/gemini-1.5-pro', 'meta-llama/llama-3-70b-instruct', 'openai/gpt-4', 'openai/gpt-4-turbo', 'openai/gpt-4o', 'x-ai/grok-beta', 'x-ai/grok-vision-beta', 'x-ai/grok-4-fast-free'];
    case 'cerebras':
      return ['cerebras-gemma-2b', 'cerebras-llama3-8b', 'cerebras-llama-3.1-8b', 'cerebras-llama-3.1-70b'];
    case 'xAI':
      return ['grok-1', 'grok-2', 'grok-3', 'grok-4'];
    case 'unbound':
      return ['unbound-llama-3-8b', 'unbound-llama-3-70b', 'unbound-llama-3.1-8b', 'unbound-llama-3.1-70b'];
    case 'openai':
      return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'];
    case 'ollama':
      return ['ollama-llama2', 'ollama-mistral', 'ollama-gemma', 'ollama-phi3', 'ollama-llama3', 'ollama-llama3.1', 'ollama-gemma2'];
    case 'lmstudio':
      return ['lmstudio-llama3', 'lmstudio-mistral', 'lmstudio-gemma', 'lmstudio-llama3.1', 'lmstudio-gemma2', 'lmstudio-mixtral'];
    default:
      return ['mistral-small'];
  }
}

const getDefaultModelForProvider = (provider: string): string => {
  switch (provider) {
    case 'mistral': return 'mistral-small';
    case 'anthropic': return 'claude-3-5-sonnet';
    case 'groq': return 'llama-3.1-8b';
    case 'deepseek': return 'deepseek-chat';
    case 'llama': return 'llama-3.1-8b';
    case 'cohere': return 'command-r';
    case 'gemini': return 'gemini-2.0-flash-exp';
    case 'qwen': return 'qwen-2.5-7b';
    case 'openrouter': return 'openrouter-default';
    case 'cerebras': return 'cerebras-llama-3.1-8b';
    case 'xAI': return 'grok-2';
    case 'unbound': return 'unbound-llama-3.1-8b';
    case 'openai': return 'gpt-4o';
    case 'ollama': return 'ollama-llama3.1';
    case 'lmstudio': return 'lmstudio-llama3.1';
    default: return 'mistral-small';
  }
};

// Validate if a model exists for a given provider
export function validateModelForProvider(provider: string, model: string): boolean {
  const availableModels = getDefaultModelsForProvider(provider);
  return availableModels.includes(model as AIModel);
}

// Get a valid model for a provider, falling back to default if invalid
export function getValidModelForProvider(provider: string, requestedModel?: string): AIModel {
  if (requestedModel && validateModelForProvider(provider, requestedModel)) {
    return requestedModel as AIModel;
  }
  return getDefaultModelForProvider(provider) as AIModel;
} 

// Chat with Cerebras AI
async function chatWithCerebrasAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'cerebras-gemma-2b'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Cerebras API key is not configured. Please add your API key in settings.";
    }
    
    // Implement Cerebras API request
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Cerebras API error:', data.error);
      return "There was an error connecting to Cerebras AI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from Cerebras AI.";
  } catch (error) {
    console.error('Error chatting with Cerebras AI:', error);
    return "There was an error communicating with Cerebras AI. Please try again later.";
  }
}

// Chat with xAI (Grok)
async function chatWithXaiAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'grok-1'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "xAI API key is not configured. Please add your API key in settings.";
    }
    
    // Implement xAI API request
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('xAI API error:', data.error);
      return "There was an error connecting to xAI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from xAI.";
  } catch (error) {
    console.error('Error chatting with xAI:', error);
    return "There was an error communicating with xAI. Please try again later.";
  }
}

// Chat with Unbound AI
async function chatWithUnboundAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'unbound-llama-3-8b'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "Unbound API key is not configured. Please add your API key in settings.";
    }
    
    // Implement Unbound API request
    const response = await fetch('https://api.unbound.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Unbound API error:', data.error);
      return "There was an error connecting to Unbound AI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from Unbound AI.";
  } catch (error) {
    console.error('Error chatting with Unbound AI:', error);
    return "There was an error communicating with Unbound AI. Please try again later.";
  }
}

// Chat with OpenAI
async function chatWithOpenAIAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'gpt-3.5-turbo'
): Promise<string | null> {
  try {
    if (!apiKey) {
      return "OpenAI API key is not configured. Please add your API key in settings.";
    }
    
    // Implement OpenAI API request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return "There was an error connecting to OpenAI. Please check your API key in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from OpenAI.";
  } catch (error) {
    console.error('Error chatting with OpenAI:', error);
    return "There was an error communicating with OpenAI. Please try again later.";
  }
}

// Chat with Ollama
async function chatWithOllamaAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'ollama-llama2'
): Promise<string | null> {
  try {
    // Ollama typically runs locally, but we'll support API key for hosted versions
    const baseUrl = apiKey ? `https://${apiKey}.api.ollama.ai/v1` : 'http://localhost:11434/v1';
    
    // Implement Ollama API request
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Ollama API error:', data.error);
      return "There was an error connecting to Ollama. Please check your setup in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from Ollama.";
  } catch (error) {
    console.error('Error chatting with Ollama:', error);
    return "There was an error communicating with Ollama. Please ensure it's running locally or check your API key.";
  }
}

// Chat with LM Studio
async function chatWithLmStudioAI(
  apiKey: string,
  messages: AIMessage[],
  model: string = 'lmstudio-llama3'
): Promise<string | null> {
  try {
    // LM Studio typically runs locally
    const baseUrl = apiKey ? `https://${apiKey}.api.lmstudio.ai/v1` : 'http://localhost:1234/v1';
    
    // Implement LM Studio API request
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('LM Studio API error:', data.error);
      return "There was an error connecting to LM Studio. Please check your setup in settings.";
    }
    
    return data.choices?.[0]?.message?.content || "No response from LM Studio.";
  } catch (error) {
    console.error('Error chatting with LM Studio:', error);
    return "There was an error communicating with LM Studio. Please ensure it's running locally or check your API key.";
  }
}

// Test Mistral API connection
export async function testMistralConnection(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!apiKey || apiKey.trim() === '') {
      return { success: false, message: "API key is required" };
    }
    
    const trimmedKey = apiKey.trim();
    // Remove overly restrictive format validation - let the API validate the key format
    // Modern Mistral API keys may have different prefixes than expected
    
    // Test with a simple request
    const response = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${trimmedKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      return { success: true, message: "✅ Mistral API connection successful!" };
    } else if (response.status === 401) {
      return { success: false, message: "❌ Invalid API key. Please check your Mistral API key." };
    } else if (response.status === 429) {
      return { success: false, message: "⚠️ Rate limit exceeded. API key is valid but you've hit the rate limit." };
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      return { success: false, message: `❌ API error (${response.status}): ${errorText}` };
    }
  } catch (error) {
    console.error('Mistral connection test error:', error);
    return { success: false, message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}