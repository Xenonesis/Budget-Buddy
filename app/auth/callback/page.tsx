"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=Authentication failed');
          return;
        }

        if (data?.session) {
          // Successfully authenticated, redirect to dashboard
          router.push('/dashboard');
        } else {
          // No session found, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth/login?error=Authentication failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}