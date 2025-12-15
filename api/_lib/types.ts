/**
 * TypeScript Types for Serverless Functions
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Extended Request with user info
export interface AuthenticatedRequest extends VercelRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

// Configuration for serverless handlers
export interface ServerlessConfig {
  cors?: boolean;
  auth?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  methods?: string[];
}

// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
}

// Pagination parameters
export interface PaginationParams {
  limit: number;
  offset: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Transaction types
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  merchant?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionInput {
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description?: string;
  date?: string;
  merchant?: string;
  payment_method?: string;
}

// Budget types
export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  category: string;
  amount: number;
  period: 'weekly' | 'monthly' | 'yearly';
  start_date?: string;
  end_date?: string;
  alert_threshold?: number;
}

// Analytics types
export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  transactionCount: number;
}

export interface CategoryAnalytics {
  category: string;
  income: number;
  expenses: number;
  transactions: number;
}

export interface TrendData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

// User profile types
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  preferred_currency?: string;
  timezone?: string;
  preferred_language?: string;
  notification_settings?: Record<string, any>;
  theme_preference?: 'light' | 'dark' | 'system';
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  full_name?: string;
  preferred_currency?: string;
  timezone?: string;
  preferred_language?: string;
  notification_settings?: Record<string, any>;
  theme_preference?: 'light' | 'dark' | 'system';
}

// Error types
export interface ApiError {
  error: string;
  details?: any;
  timestamp: string;
  statusCode: number;
}

// Rate limit info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

// Webhook types
export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  signature?: string;
}

// Export handler type
export type ServerlessHandler = (req: AuthenticatedRequest, res: VercelResponse) => Promise<void>;
