"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";

interface LoginButtonProps {
  loading: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const LoginButton = ({ loading, isSubmitting, disabled }: LoginButtonProps) => {
  return (
    <motion.div
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      <Button 
        type="submit" 
        className="w-full h-12 relative overflow-hidden group bg-primary-gradient hover:bg-primary-gradient/95 text-white font-medium"
        disabled={loading || disabled}
      >
        <motion.span 
          className="relative z-10 flex items-center justify-center gap-2"
          animate={isSubmitting ? { y: [0, -40] } : { y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LogIn className="h-4 w-4" />
          {loading ? "Signing in..." : "Sign in"}
        </motion.span>
        
        {isSubmitting && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: 40 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </motion.div>
        )}
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20"
          animate={{ 
            x: loading ? "0%" : ["-100%", "100%"],
          }}
          transition={{ 
            duration: loading ? 0 : 2, 
            repeat: loading ? 0 : Infinity,
            repeatType: "loop"
          }}
        />
      </Button>
    </motion.div>
  );
};