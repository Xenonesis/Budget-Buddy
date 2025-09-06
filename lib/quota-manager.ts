// Quota management for AI providers
export interface QuotaInfo {
  provider: string;
  model: string;
  dailyLimit: number;
  currentUsage: number;
  resetTime: Date;
  lastRequestTime?: Date;
  isExceeded: boolean;
}

export interface QuotaStorage {
  [key: string]: QuotaInfo; // key format: "provider:model:userId"
}

// In-memory quota tracking (in production, this should be in a database)
const quotaTracker: QuotaStorage = {};

export function getQuotaKey(provider: string, model: string, userId: string): string {
  return `${provider}:${model}:${userId}`;
}

export function getQuotaInfo(provider: string, model: string, userId: string): QuotaInfo {
  const key = getQuotaKey(provider, model, userId);
  const now = new Date();
  
  // Get existing quota info or create new one
  let quota = quotaTracker[key];
  
  if (!quota) {
    quota = {
      provider,
      model,
      dailyLimit: getDefaultDailyLimit(provider, model),
      currentUsage: 0,
      resetTime: getNextResetTime(),
      isExceeded: false
    };
    quotaTracker[key] = quota;
  }
  
  // Check if we need to reset the quota (new day)
  if (now >= quota.resetTime) {
    quota.currentUsage = 0;
    quota.resetTime = getNextResetTime();
    quota.isExceeded = false;
  }
  
  return quota;
}

export function incrementQuotaUsage(provider: string, model: string, userId: string): QuotaInfo {
  const quota = getQuotaInfo(provider, model, userId);
  quota.currentUsage += 1;
  quota.lastRequestTime = new Date();
  quota.isExceeded = quota.currentUsage >= quota.dailyLimit;
  
  return quota;
}

export function setQuotaExceeded(provider: string, model: string, userId: string, exceeded: boolean = true): QuotaInfo {
  const quota = getQuotaInfo(provider, model, userId);
  quota.isExceeded = exceeded;
  
  return quota;
}

export function canMakeRequest(provider: string, model: string, userId: string): boolean {
  const quota = getQuotaInfo(provider, model, userId);
  return !quota.isExceeded && quota.currentUsage < quota.dailyLimit;
}

export function getTimeUntilReset(provider: string, model: string, userId: string): number {
  const quota = getQuotaInfo(provider, model, userId);
  return Math.max(0, quota.resetTime.getTime() - Date.now());
}

export function formatTimeUntilReset(provider: string, model: string, userId: string): string {
  const ms = getTimeUntilReset(provider, model, userId);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

function getDefaultDailyLimit(provider: string, model: string): number {
  // Default daily limits for free tiers
  switch (provider) {
    case 'gemini':
    case 'google':
      return 50; // Gemini free tier limit
    case 'anthropic':
      return 100; // Claude free tier (approximate)
    case 'openai':
      return 200; // OpenAI free tier (approximate)
    case 'groq':
      return 100; // Groq free tier
    case 'mistral':
      return 100; // Mistral free tier
    default:
      return 50; // Conservative default
  }
}

function getNextResetTime(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

export function getQuotaStatus(provider: string, model: string, userId: string): {
  canMakeRequest: boolean;
  usage: string;
  timeUntilReset: string;
  message?: string;
} {
  const quota = getQuotaInfo(provider, model, userId);
  const canRequest = canMakeRequest(provider, model, userId);
  
  return {
    canMakeRequest: canRequest,
    usage: `${quota.currentUsage}/${quota.dailyLimit}`,
    timeUntilReset: formatTimeUntilReset(provider, model, userId),
    message: quota.isExceeded 
      ? `Daily quota exceeded. Resets in ${formatTimeUntilReset(provider, model, userId)}.`
      : undefined
  };
}