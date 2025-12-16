/**
 * Serverless Function: Budgets API
 * Handles budget management operations
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createServerlessHandler,
  AuthenticatedRequest,
  parseBody,
  successResponse,
  errorResponse,
  getSupabaseClient,
} from './_lib/serverless-helpers';

async function handler(req: AuthenticatedRequest, res: VercelResponse): Promise<void> {
  const supabase = getSupabaseClient(req);

  // GET: Fetch budgets
  if (req.method === 'GET') {
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const period = searchParams.get('period') || 'monthly';

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', req.user!.id)
      .eq('period', period)
      .order('created_at', { ascending: false });

    if (error) {
      errorResponse(res, 'Failed to fetch budgets', 500, error);
    }

    successResponse(res, { budgets: data });
  }

  // POST: Create budget
  if (req.method === 'POST') {
    const body = await parseBody(req);

    if (!body || !body.category || !body.amount || !body.period) {
      errorResponse(res, 'Missing required fields', 400);
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: req.user!.id,
        category: body.category,
        amount: body.amount,
        period: body.period,
        start_date: body.start_date || new Date().toISOString(),
        end_date: body.end_date,
        alert_threshold: body.alert_threshold || 80,
      })
      .select()
      .single();

    if (error) {
      errorResponse(res, 'Failed to create budget', 500, error);
    }

    successResponse(res, { budget: data }, 201);
  }

  // PUT: Update budget
  if (req.method === 'PUT') {
    const body = await parseBody(req);
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const id = searchParams.get('id');

    if (!id) {
      errorResponse(res, 'Budget ID required', 400);
    }

    const { data, error } = await supabase
      .from('budgets')
      .update(body)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      errorResponse(res, 'Failed to update budget', 500, error);
    }

    successResponse(res, { budget: data });
  }

  // DELETE: Delete budget
  if (req.method === 'DELETE') {
    const { searchParams } = new URL(req.url!, `http://${req.headers.host}`);
    const id = searchParams.get('id');

    if (!id) {
      errorResponse(res, 'Budget ID required', 400);
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      errorResponse(res, 'Failed to delete budget', 500, error);
    }

    successResponse(res, { message: 'Budget deleted' });
  }

  errorResponse(res, 'Method not allowed', 405);
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
