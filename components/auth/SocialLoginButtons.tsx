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
    <div className="grid grid-cols-2 gap-4">
      {socialButtons.map(({ provider, icon: Icon, label, className }, index) => (
        <motion.div
          key={provider}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 + (index * 0.1), duration: 0.3 }}
          className="relative group"
        >
          {/* Enhanced glow effect for social buttons */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-400/20 via-gray-300/20 to-gray-400/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <motion.div
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              type="button"
              variant="outline"
              className={`relative w-full h-12 overflow-hidden border-2 border-muted/30 hover:border-muted/50 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300 ${className}`}
              onClick={() => handleSocialLogin(provider)}
              disabled={loadingProvider !== null}
            >
              {/* Button content */}
              <motion.div
                className="flex items-center justify-center gap-3 relative z-10"
                animate={loadingProvider === provider ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{label}</span>
              </motion.div>
              
              {/* Loading state */}
              {loadingProvider === provider && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Connecting...</span>
                  </motion.div>
                </motion.div>
              )}
              
              {/* Shimmer effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                animate={{ 
                  x: loadingProvider === provider ? "0%" : ["-100%", "100%"],
                }}
                transition={{ 
                  duration: loadingProvider === provider ? 0 : 3, 
                  repeat: loadingProvider === provider ? 0 : Infinity,
                  repeatType: "loop",
                  ease: "easeInOut"
                }}
              />
            </Button>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};