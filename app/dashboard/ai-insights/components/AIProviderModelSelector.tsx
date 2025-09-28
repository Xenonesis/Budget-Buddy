"use client";

import { useState } from "react";
import { AIProvider, AIModel } from "@/lib/ai";
import { Settings, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AIProviderModelSelectorProps {
  currentProvider: AIProvider;
  currentModel: string;
  availableProviders: AIProvider[];
  availableModels: Record<string, AIModel[]>;
  loadingModels: Record<string, boolean>;
  onChange: (provider: AIProvider, model: string) => void;
  disabled?: boolean;
  className?: string;
}

export function AIProviderModelSelector({
  currentProvider,
  currentModel,
  availableProviders,
  availableModels,
  loadingModels,
  onChange,
  disabled = false,
  className = ""
}: AIProviderModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getProviderDisplayName = (provider: AIProvider): string => {
    const providerNames: Record<AIProvider, string> = {
      'mistral': 'Mistral AI',
      'google': 'Google AI',
      'anthropic': 'Claude (Anthropic)',
      'groq': 'Groq',
      'deepseek': 'DeepSeek',
      'llama': 'Llama',
      'cohere': 'Cohere',
      'gemini': 'Gemini',
      'qwen': 'Qwen',
      'openrouter': 'OpenRouter',
      'cerebras': 'Cerebras',
      'xAI': 'xAI (Grok)',
      'unbound': 'Unbound',
      'openai': 'OpenAI',
      'ollama': 'Ollama',
      'lmstudio': 'LM Studio'
    };
    return providerNames[provider] || provider;
  };

  const getModelDisplayName = (model: string): string => {
    // Clean up model names for display
    return model
      .replace(/^(mistral-|claude-|llama|gpt-|gemini-|qwen-)/i, '')
      .replace(/(-latest|latest)$/i, '')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getDefaultModelsForProvider = (provider: AIProvider): AIModel[] => {
    const defaultModels: Record<AIProvider, AIModel[]> = {
      mistral: ['mistral-tiny', 'mistral-small', 'mistral-medium', 'mistral-large-latest'],
      anthropic: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus', 'claude-3-5-sonnet'],
      groq: ['llama3-8b', 'llama3-70b', 'mixtral-8x7b', 'llama-3.1-8b'],
      deepseek: ['deepseek-coder', 'deepseek-chat'],
      llama: ['llama-3-8b', 'llama-3-70b', 'llama-3.1-8b'],
      cohere: ['command', 'command-r', 'command-r-plus'],
      gemini: ['gemini-pro', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
      qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
      openrouter: ['openrouter-default', 'anthropic/claude-3-5-sonnet', 'openai/gpt-4o'],
      cerebras: ['cerebras-llama3-8b', 'cerebras-llama-3.1-8b'],
      xAI: ['grok-1', 'grok-2', 'grok-3', 'grok-4'],
      unbound: ['unbound-llama-3.1-8b'],
      openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      ollama: ['ollama-llama3.1', 'ollama-mistral'],
      lmstudio: ['lmstudio-llama3.1'],
      google: ['gemini-pro', 'gemini-1.5-pro']
    };
    return defaultModels[provider] || [];
  };

  const handleProviderModelChange = (provider: AIProvider, model: string) => {
    onChange(provider, model);
    setIsOpen(false);
  };

  const renderProviderSection = (provider: AIProvider) => {
    const models = availableModels[provider] || getDefaultModelsForProvider(provider);
    const isLoading = loadingModels[provider];
    const providerName = getProviderDisplayName(provider);

    return (
      <div key={provider}>
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          {providerName}
        </DropdownMenuLabel>
        {isLoading ? (
          <DropdownMenuItem disabled className="text-xs">
            Loading models...
          </DropdownMenuItem>
        ) : (
          models.map((model) => (
            <DropdownMenuItem
              key={`${provider}-${model}`}
              className="text-xs pl-4 flex items-center justify-between cursor-pointer"
              onClick={() => handleProviderModelChange(provider, model)}
            >
              <span>{getModelDisplayName(model)}</span>
              {currentProvider === provider && currentModel === model && (
                <Check className="h-3 w-3 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator className="my-1" />
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Settings className="h-3 w-3 text-muted-foreground flex-shrink-0" />
      
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            className="h-7 px-2 text-xs font-normal justify-between min-w-[140px] max-w-[200px]"
          >
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-[10px] text-muted-foreground leading-none">
                {getProviderDisplayName(currentProvider)}
              </span>
              <span className="text-xs leading-none truncate max-w-full">
                {getModelDisplayName(currentModel)}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-[220px] max-h-[300px] overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold">
            Select AI Provider & Model
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {availableProviders.length === 0 ? (
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              No AI providers configured. Please add API keys in Settings.
            </DropdownMenuItem>
          ) : (
            availableProviders.map(provider => renderProviderSection(provider))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <div 
        className="text-[10px] text-muted-foreground/80 hidden md:block flex-shrink-0" 
        title="Configure more providers in Settings"
      >
        (Settings)
      </div>
    </div>
  );
}