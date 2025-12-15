/**
 * Enhanced Transactions Endpoint
 * Uses new serverless helpers for better functionality
 */

import { NextRequest } from 'next/server';
import {
  createNextHandler,
  successResponse,
  errorResponse,
  parseBody,
  getSupabaseClient,
} from '../../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const supabase = await getSupabaseClient();
  const user = (request as any).user;

  // GET: Fetch transactions with pagination
  if (request.method === 'GET') {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'income' or 'expense'
    const category = searchParams.get('category');

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      return errorResponse('Failed to fetch transactions', 500, error);
    }

    // Calculate summary
    const summary = data.reduce(
      (acc, transaction) => {
        const amount = parseFloat(transaction.amount);
        if (transaction.type === 'income') {
          acc.totalIncome += amount;
        } else {
          acc.totalExpenses += amount;
        }
        acc.count++;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, count: 0 }
    );

    return successResponse({
      transactions: data,
      summary: {
        ...summary,
        netBalance: summary.totalIncome - summary.totalExpenses,
      },
      pagination: {
        total: count,
        limit,
        offset,
        hasMore: offset + limit < (count || 0),
      },
    });
  }

  // POST: Create transaction
  if (request.method === 'POST') {
    const body = await parseBody(request);

    if (!body || !body.amount || !body.category || !body.type) {
      return errorResponse('Missing required fields: amount, category, type', 400);
    }

    // Validate amount
    if (isNaN(parseFloat(body.amount)) || parseFloat(body.amount) <= 0) {
      return errorResponse('Amount must be a positive number', 400);
    }

    // Validate type
    if (!['income', 'expense'].includes(body.type)) {
      return errorResponse('Type must be either "income" or "expense"', 400);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: body.amount,
        category: body.category,
        type: body.type,
        description: body.description || '',
        date: body.date || new Date().toISOString(),
        merchant: body.merchant || '',
        payment_method: body.payment_method || '',
      })
      .select()
      .single();

    if (error) {
      return errorResponse('Failed to create transaction', 500, error);
    }

    return successResponse({ transaction: data }, 201);
  }

  return errorResponse('Method not allowed', 405);
}

export const GET = createNextHandler(handler, {
  auth: true,
  cors: true,
});

export const POST = createNextHandler(handler, {
  auth: true,
  cors: true,
});
