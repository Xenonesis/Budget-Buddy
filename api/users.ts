/**
 * Serverless Function: Users API
 * Handles user profile and settings operations
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

  // GET: Fetch user profile
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user!.id)
      .single();

    if (error) {
      errorResponse(res, 'Failed to fetch user profile', 500, error);
    }

    successResponse(res, { profile: data });
  }

  // PUT: Update user profile
  if (req.method === 'PUT') {
    const body = await parseBody(req);

    if (!body) {
      errorResponse(res, 'Invalid request body', 400);
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      'full_name',
      'preferred_currency',
      'timezone',
      'preferred_language',
      'notification_settings',
      'theme_preference',
    ];

    const updates: any = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      errorResponse(res, 'No valid fields to update', 400);
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user!.id)
      .select()
      .single();

    if (error) {
      errorResponse(res, 'Failed to update profile', 500, error);
    }

    successResponse(res, { profile: data });
  }

  // DELETE: Delete user account
  if (req.method === 'DELETE') {
    // This is a sensitive operation - require confirmation
    const body = await parseBody(req);

    if (!body || body.confirm !== true) {
      errorResponse(res, 'Account deletion requires confirmation', 400);
    }

    // Delete user data in order
    const tables = ['transactions', 'budgets', 'notifications', 'profiles'];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().eq('user_id', req.user!.id);

      if (error && table !== 'profiles') {
        console.error(`Failed to delete from ${table}:`, error);
      }
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(req.user!.id);

    if (authError) {
      errorResponse(res, 'Failed to delete user account', 500, authError);
    }

    successResponse(res, { message: 'Account deleted successfully' });
  }

  errorResponse(res, 'Method not allowed', 405);
}

export default createServerlessHandler(handler, {
  auth: true,
  cors: true,
});
