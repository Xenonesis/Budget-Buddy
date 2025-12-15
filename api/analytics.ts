/**
 * Serverless Function: Analytics API
 * Provides financial analytics and insights
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  AuthenticatedRequest,
  successResponse,
  errorResponse,
  getSupabaseClient,
} from './_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return errorResponse(res, 'Method not allowed', 405);
  }

  const supabase = getSupabaseClient(req);
  const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
  const type = searchParams.get('type') || 'summary';
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  try {
    switch (type) {
      case 'summary':
        return await getSummaryAnalytics(req, res, supabase, startDate, endDate);

      case 'category':
        return await getCategoryAnalytics(req, res, supabase, startDate, endDate);

      case 'trend':
        return await getTrendAnalytics(req, res, supabase, startDate, endDate);

      default:
        return errorResponse(res, 'Invalid analytics type', 400);
    }
  } catch (error) {
    return errorResponse(res, 'Failed to fetch analytics', 500, error);
  }
}

async function getSummaryAnalytics(
  req: AuthenticatedRequest,
  res: VercelResponse,
  supabase: any,
  startDate: string | null,
  endDate: string | null
) {
  let query = supabase.from('transactions').select('amount, type').eq('user_id', req.user!.id);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;

  if (error) {
    return errorResponse(res, 'Failed to fetch summary', 500, error);
  }

  const summary = data.reduce(
    (acc: any, transaction: any) => {
      if (transaction.type === 'income') {
        acc.totalIncome += parseFloat(transaction.amount);
      } else if (transaction.type === 'expense') {
        acc.totalExpenses += parseFloat(transaction.amount);
      }
      acc.transactionCount++;
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }
  );

  summary.netSavings = summary.totalIncome - summary.totalExpenses;
  summary.savingsRate =
    summary.totalIncome > 0 ? ((summary.netSavings / summary.totalIncome) * 100).toFixed(2) : 0;

  return successResponse(res, { summary });
}

async function getCategoryAnalytics(
  req: AuthenticatedRequest,
  res: VercelResponse,
  supabase: any,
  startDate: string | null,
  endDate: string | null
) {
  let query = supabase
    .from('transactions')
    .select('category, amount, type')
    .eq('user_id', req.user!.id);

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;

  if (error) {
    return errorResponse(res, 'Failed to fetch category analytics', 500, error);
  }

  const categoryBreakdown = data.reduce((acc: any, transaction: any) => {
    const category = transaction.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {
        category,
        income: 0,
        expenses: 0,
        transactions: 0,
      };
    }

    if (transaction.type === 'income') {
      acc[category].income += parseFloat(transaction.amount);
    } else {
      acc[category].expenses += parseFloat(transaction.amount);
    }
    acc[category].transactions++;

    return acc;
  }, {});

  const categories = Object.values(categoryBreakdown);

  return successResponse(res, { categories });
}

async function getTrendAnalytics(
  req: AuthenticatedRequest,
  res: VercelResponse,
  supabase: any,
  startDate: string | null,
  endDate: string | null
) {
  let query = supabase
    .from('transactions')
    .select('date, amount, type')
    .eq('user_id', req.user!.id)
    .order('date', { ascending: true });

  if (startDate) query = query.gte('date', startDate);
  if (endDate) query = query.lte('date', endDate);

  const { data, error } = await query;

  if (error) {
    return errorResponse(res, 'Failed to fetch trend analytics', 500, error);
  }

  // Group by month
  const monthlyTrend = data.reduce((acc: any, transaction: any) => {
    const month = transaction.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = {
        month,
        income: 0,
        expenses: 0,
        net: 0,
      };
    }

    const amount = parseFloat(transaction.amount);
    if (transaction.type === 'income') {
      acc[month].income += amount;
    } else {
      acc[month].expenses += amount;
    }
    acc[month].net = acc[month].income - acc[month].expenses;

    return acc;
  }, {});

  const trend = Object.values(monthlyTrend);

  return successResponse(res, { trend });
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
