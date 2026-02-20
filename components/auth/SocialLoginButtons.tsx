'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Github, Mail } from 'lucide-react';

interface SocialLoginButtonsProps {
  onError: (error: string) => void;
}

export const SocialLoginButtons = ({ onError }: SocialLoginButtonsProps) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setLoadingProvider(provider);
    onError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      onError(error.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  const socialButtons = [
    {
      provider: 'github' as const,
      icon: Github,
      label: 'GitHub',
    },
    {
      provider: 'google' as const,
      icon: Mail,
      label: 'Google',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {socialButtons.map(({ provider, icon: Icon, label }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="h-11 rounded-lg border-border bg-background hover:bg-muted/50 text-foreground font-medium transition-all duration-200"
          onClick={() => handleSocialLogin(provider)}
          disabled={loadingProvider !== null}
        >
          <span className="flex items-center justify-center gap-2">
            {loadingProvider === provider ? (
              <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
            <span className="text-sm">{label}</span>
          </span>
        </Button>
      ))}
    </div>
  );
};