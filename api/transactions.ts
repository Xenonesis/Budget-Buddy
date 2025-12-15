/**
 * Serverless Function: Transactions API
 * Handles CRUD operations for user transactions
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  AuthenticatedRequest,
  validateMethod,
  parseBody,
  successResponse,
  errorResponse,
  getSupabaseClient,
} from './_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse) {
  const supabase = getSupabaseClient(req);

  // GET: Fetch transactions
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'income' or 'expense'

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      return errorResponse(res, 'Failed to fetch transactions', 500, error);
    }

    return successResponse(res, {
      transactions: data,
      total: count,
      limit,
      offset,
    });
  }

  // POST: Create transaction
  if (req.method === 'POST') {
    const body = await parseBody(req);

    if (!body || !body.amount || !body.category || !body.type) {
      return errorResponse(res, 'Missing required fields', 400);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: req.user!.id,
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
      return errorResponse(res, 'Failed to create transaction', 500, error);
    }

    return successResponse(res, { transaction: data }, 201);
  }

  // PUT: Update transaction
  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse(res, 'Transaction ID required', 400);
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(body)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      return errorResponse(res, 'Failed to update transaction', 500, error);
    }

    return successResponse(res, { transaction: data });
  }

  // DELETE: Delete transaction
  if (req.method === 'DELETE') {
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse(res, 'Transaction ID required', 400);
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      return errorResponse(res, 'Failed to delete transaction', 500, error);
    }

    return successResponse(res, { message: 'Transaction deleted' });
  }

  return errorResponse(res, 'Method not allowed', 405);
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
