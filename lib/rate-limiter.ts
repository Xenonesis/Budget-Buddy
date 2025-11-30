/**
 * Production-grade rate limiting utility
 * Uses a sliding window algorithm with in-memory storage
 * For production at scale, consider using Redis-based rate limiting
 */

import { logger } from './logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  requests: number[];
}

interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowSizeSeconds: number;
  /** Optional identifier prefix for the rate limit key */
  keyPrefix?: string;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
  }

  /**
   * Check if a request should be allowed based on rate limits
   */
  check(identifier: string, config: RateLimitConfig): RateLimitResult {
    const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
    const now = Date.now();
    const windowMs = config.windowSizeSeconds * 1000;
    const windowStart = now - windowMs;

    let entry = this.store.get(key);

    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
        requests: [],
      };
      this.store.set(key, entry);
    }

    // Filter out requests outside the current window (sliding window)
    entry.requests = entry.requests.filter((timestamp) => timestamp > windowStart);
    entry.count = entry.requests.length;

    // Update reset time
    if (entry.requests.length > 0) {
      entry.resetTime = entry.requests[0] + windowMs;
    } else {
      entry.resetTime = now + windowMs;
    }

    if (entry.count >= config.limit) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      logger.security('Rate limit exceeded', {
        identifier: this.hashIdentifier(identifier),
        limit: config.limit,
        window: config.windowSizeSeconds,
        retryAfter,
      });

      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Add current request
    entry.requests.push(now);
    entry.count++;

    return {
      success: true,
      remaining: config.limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Consume a rate limit token
   */
  consume(identifier: string, config: RateLimitConfig): RateLimitResult {
    return this.check(identifier, config);
  }

  /**
   * Reset rate limit for an identifier
   */
  reset(identifier: string, keyPrefix?: string): void {
    const key = keyPrefix ? `${keyPrefix}:${identifier}` : identifier;
    this.store.delete(key);
  }

  /**
   * Get current rate limit status without consuming a token
   */
  status(identifier: string, config: RateLimitConfig): RateLimitResult {
    const key = config.keyPrefix ? `${config.keyPrefix}:${identifier}` : identifier;
    const now = Date.now();
    const windowMs = config.windowSizeSeconds * 1000;
    const windowStart = now - windowMs;

    const entry = this.store.get(key);

    if (!entry) {
      return {
        success: true,
        remaining: config.limit,
        resetTime: now + windowMs,
      };
    }

    // Filter to current window
    const validRequests = entry.requests.filter((timestamp) => timestamp > windowStart);
    const count = validRequests.length;

    return {
      success: count < config.limit,
      remaining: Math.max(0, config.limit - count),
      resetTime: validRequests.length > 0 ? validRequests[0] + windowMs : now + windowMs,
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      // Remove entries that haven't been used in the last hour
      if (entry.requests.length === 0 || entry.requests[entry.requests.length - 1] < now - 3600000) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug('Rate limiter cleanup', { cleaned, remaining: this.store.size });
    }
  }

  /**
   * Hash identifier for logging (privacy)
   */
  private hashIdentifier(identifier: string): string {
    // Simple hash for logging - not cryptographic
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `hash:${Math.abs(hash).toString(16)}`;
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Pre-configured rate limit configs for common use cases
export const RATE_LIMITS = {
  // API routes - general
  api: {
    limit: parseInt(process.env.RATE_LIMIT_RPM || '60', 10),
    windowSizeSeconds: 60,
    keyPrefix: 'api',
  },
  
  // AI chat - more restrictive
  aiChat: {
    limit: 20,
    windowSizeSeconds: 60,
    keyPrefix: 'ai-chat',
  },
  
  // Auth endpoints - very restrictive to prevent brute force
  auth: {
    limit: 5,
    windowSizeSeconds: 60,
    keyPrefix: 'auth',
  },
  
  // File uploads
  upload: {
    limit: 10,
    windowSizeSeconds: 60,
    keyPrefix: 'upload',
  },
  
  // Search/query operations
  search: {
    limit: 30,
    windowSizeSeconds: 60,
    keyPrefix: 'search',
  },
} as const;

export { RateLimiter };
export type { RateLimitConfig, RateLimitResult };
