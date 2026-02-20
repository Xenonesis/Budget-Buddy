"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Github, Mail } from "lucide-react";

interface SocialLoginButtonsProps {
  onError: (error: string) => void;
}

export const SocialLoginButtons = ({ onError }: SocialLoginButtonsProps) => {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setLoadingProvider(provider);
    onError(""); // Clear previous errors

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
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
      className: 'bg-foreground text-background'
    },
    {
      provider: 'google' as const,
      icon: Mail,
      label: 'Google',
      className: 'bg-white text-black'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {socialButtons.map(({ provider, icon: Icon, label, className }) => (
        <div key={provider} className="relative group">
          <Button
            type="button"
            className={`w-full h-14 border-4 border-foreground font-mono font-bold uppercase tracking-widest transition-all rounded-none shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-1 hover:translate-y-1 ${className}`}
            onClick={() => handleSocialLogin(provider)}
            disabled={loadingProvider !== null}
          >
            <span className="flex items-center justify-center gap-2">
              <Icon className="h-5 w-5 stroke-[2.5]" />
              <span className="text-xs">{label}</span>
            </span>
            
            {loadingProvider === provider && (
              <div className="absolute inset-0 flex items-center justify-center bg-inherit z-20">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
};