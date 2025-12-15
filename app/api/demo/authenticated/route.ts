/**
 * Demo Authenticated Endpoint
 * Shows authentication middleware in action
 */

import { NextRequest } from 'next/server';
import { createNextHandler, successResponse, getSupabaseClient } from '../../_lib/nextjs-adapter';

async function handler(request: NextRequest) {
  const user = (request as any).user;
  const supabase = await getSupabaseClient();

  // Get user profile from database
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, email, created_at')
    .eq('id', user.id)
    .single();

  return successResponse({
    message: 'You are authenticated!',
    user: {
      id: user.id,
      email: user.email,
    },
    profile: profile || null,
    timestamp: new Date().toISOString(),
  });
}

export const GET = createNextHandler(handler, {
  auth: true, // Requires authentication
  cors: true,
});
