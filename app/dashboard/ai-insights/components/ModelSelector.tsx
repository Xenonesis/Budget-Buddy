"use client";

import { AIModel } from "@/lib/ai";

interface ModelSelectorProps {
  provider: string;
  model: string;
  availableModels: Record<string, AIModel[]>;
  loadingModels: Record<string, boolean>;
  onChange: (provider: string | undefined, model: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ModelSelector({ 
  provider, 
  model, 
  availableModels, 
  loadingModels, 
  onChange, 
  disabled = false,
  className = ""
}: ModelSelectorProps) {
  
  const renderModelOptions = (provider: string) => {
    // Get available models for this provider, or use defaults if not fetched
    const models = availableModels[provider] || [];
    const hasFetchedModels = models.length > 0;
    const isLoading = loadingModels[provider];
  
    // If we have fetched models, use them
    if (hasFetchedModels) {
      return (
        <>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </>
      );
    }
    
    // If we're loading, show loading indicator
    if (isLoading) {
      return <option value="">Loading models...</option>;
    }
    
    // Otherwise, show default models for each provider
    switch (provider) {
      case 'mistral':
        return (
          <>
            <option value="mistral-tiny">Mistral Tiny</option>
            <option value="mistral-small">Mistral Small</option>
            <option value="mistral-medium">Mistral Medium</option>
            <option value="mistral-large-latest">Mistral Large Latest</option>
            <option value="mistral-large">Mistral Large</option>
            <option value="mistral-small-latest">Mistral Small Latest</option>
            <option value="mistral-nemo">Mistral Nemo</option>
          </>
        );
      case 'anthropic':
        return (
          <>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            <option value="claude-3-5-haiku">Claude 3.5 Haiku</option>
          </>
        );
      case 'groq':
        return (
          <>
            <option value="llama3-8b">Llama 3 8B</option>
            <option value="llama3-70b">Llama 3 70B</option>
            <option value="mixtral-8x7b">Mixtral 8x7B</option>
            <option value="llama-3.1-8b">Llama 3.1 8B</option>
            <option value="llama-3.1-70b">Llama 3.1 70B</option>
            <option value="llama-3.1-405b">Llama 3.1 405B</option>
          </>
        );
      case 'deepseek':
        return (
          <>
            <option value="deepseek-coder">DeepSeek Coder</option>
            <option value="deepseek-chat">DeepSeek Chat</option>
            <option value="deepseek-chat-v2">DeepSeek Chat V2</option>
            <option value="deepseek-coder-v2">DeepSeek Coder V2</option>
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
            <option value="llama-3.1-8b">Llama 3.1 8B</option>
            <option value="llama-3.1-70b">Llama 3.1 70B</option>
            <option value="llama-3.1-405b">Llama 3.1 405B</option>
          </>
        );
      case 'cohere':
        return (
          <>
            <option value="command">Command</option>
            <option value="command-light">Command Light</option>
            <option value="command-r">Command R</option>
            <option value="command-r-plus">Command R Plus</option>
            <option value="command-nightly">Command Nightly</option>
          </>
        );
      case 'gemini':
        return (
          <>
            <option value="gemini-pro">Gemini Pro</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro-exp-0801">Gemini 1.5 Pro Exp</option>
            <option value="gemini-1.5-flash-exp-0801">Gemini 1.5 Flash Exp</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
          </>
        );
      case 'qwen':
        return (
          <>
            <option value="qwen-turbo">Qwen Turbo</option>
            <option value="qwen-plus">Qwen Plus</option>
            <option value="qwen-max">Qwen Max</option>
            <option value="qwen-2.5-7b">Qwen 2.5 7B</option>
            <option value="qwen-2.5-14b">Qwen 2.5 14B</option>
            <option value="qwen-2.5-32b">Qwen 2.5 32B</option>
            <option value="qwen-2.5-72b">Qwen 2.5 72B</option>
          </>
        );
      case 'openrouter':
        return (
          <>
            <option value="openrouter-default">OpenRouter Default</option>
            <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
            <option value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet</option>
            <option value="google/gemini-pro">Gemini Pro</option>
            <option value="google/gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
            <option value="openai/gpt-4">GPT-4</option>
            <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
            <option value="openai/gpt-4o">GPT-4o</option>
            <option value="x-ai/grok-beta">Grok Beta</option>
            <option value="x-ai/grok-vision-beta">Grok Vision Beta</option>
            <option value="x-ai/grok-4-fast-free">Grok 4 Fast (Free)</option>
          </>
        );
      case 'cerebras':
        return (
          <>
            <option value="cerebras-gemma-2b">Gemma 2B</option>
            <option value="cerebras-llama3-8b">Llama 3 8B</option>
            <option value="cerebras-llama-3.1-8b">Llama 3.1 8B</option>
            <option value="cerebras-llama-3.1-70b">Llama 3.1 70B</option>
          </>
        );
      case 'xAI':
        return (
          <>
            <option value="grok-1">Grok 1</option>
            <option value="grok-2">Grok 2</option>
            <option value="grok-3">Grok 3</option>
            <option value="grok-4">Grok 4</option>
          </>
        );
      case 'unbound':
        return (
          <>
            <option value="unbound-llama-3-8b">Llama 3 8B</option>
            <option value="unbound-llama-3-70b">Llama 3 70B</option>
            <option value="unbound-llama-3.1-8b">Llama 3.1 8B</option>
            <option value="unbound-llama-3.1-70b">Llama 3.1 70B</option>
          </>
        );
      case 'openai':
        return (
          <>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="o1-preview">O1 Preview</option>
            <option value="o1-mini">O1 Mini</option>
          </>
        );
      case 'ollama':
        return (
          <>
            <option value="ollama-llama2">Llama 2</option>
            <option value="ollama-mistral">Mistral</option>
            <option value="ollama-gemma">Gemma</option>
            <option value="ollama-phi3">Phi 3</option>
            <option value="ollama-llama3">Llama 3</option>
            <option value="ollama-llama3.1">Llama 3.1</option>
            <option value="ollama-gemma2">Gemma 2</option>
          </>
        );
      case 'lmstudio':
        return (
          <>
            <option value="lmstudio-llama3">Llama 3</option>
            <option value="lmstudio-mistral">Mistral</option>
            <option value="lmstudio-gemma">Gemma</option>
            <option value="lmstudio-llama3.1">Llama 3.1</option>
            <option value="lmstudio-gemma2">Gemma 2</option>
            <option value="lmstudio-mixtral">Mixtral</option>
          </>
        );
      default:
        return <option value="mistral-small">Mistral Small</option>;
    }
  };

  return (
    <select
      value={model}
      onChange={(e) => onChange(undefined, e.target.value)}
      className={`rounded-md border border-input bg-transparent px-1.5 py-0.5 md:px-2 md:py-1 text-[10px] md:text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      disabled={disabled}
      aria-label="Select AI model"
      title="Select AI model"
    >
      {renderModelOptions(provider)}
    </select>
  );
}