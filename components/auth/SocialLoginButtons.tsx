"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
          redirectTo: `${window.location.origin}/dashboard`
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
      className: 'bg-gray-900 hover:bg-gray-800 text-white'
    },
    {
      provider: 'google' as const,
      icon: Mail,
      label: 'Google',
      className: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {socialButtons.map(({ provider, icon: Icon, label, className }, index) => (
        <motion.div
          key={provider}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            variant="outline"
            className={`w-full h-11 relative overflow-hidden ${className}`}
            onClick={() => handleSocialLogin(provider)}
            disabled={loadingProvider !== null}
          >
            <motion.div
              className="flex items-center justify-center gap-2"
              animate={loadingProvider === provider ? { opacity: 0.5 } : { opacity: 1 }}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
            
            {loadingProvider === provider && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </motion.div>
            )}
          </Button>
        </motion.div>
      ))}
    </div>
  );
};