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
      className="relative group"
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      {/* Enhanced glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-violet-500 to-primary rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition-opacity duration-500" />
      
      <Button 
        type="submit" 
        className="relative w-full h-14 overflow-hidden bg-gradient-to-r from-primary via-violet-600 to-primary text-white font-semibold text-base shadow-xl border-0 rounded-xl"
        disabled={loading || disabled}
        style={{
          backgroundSize: '200% 100%'
        }}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/80 via-violet-500/80 to-primary/80"
          animate={{
            backgroundPosition: loading ? '0% 50%' : ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: loading ? 0 : 3,
            repeat: loading ? 0 : Infinity,
            ease: "easeInOut"
          }}
          style={{
            backgroundSize: '200% 100%'
          }}
        />
        
        {/* Button content */}
        <motion.span 
          className="relative z-10 flex items-center justify-center gap-3"
          animate={isSubmitting ? { y: [0, -50] } : { y: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: loading ? 1 : 0, repeat: loading ? Infinity : 0, ease: "linear" }}
          >
            {loading ? <Loader2 className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
          </motion.div>
          <span className="font-semibold">
            {loading ? "Signing in..." : "Sign in"}
          </span>
        </motion.span>
        
        {/* Success animation */}
        {isSubmitting && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center z-20"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin text-white" />
              <span className="font-semibold text-white">Processing...</span>
            </motion.div>
          </motion.div>
        )}
        
        {/* Shimmer effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
          animate={{ 
            x: disabled || loading ? "0%" : ["-100%", "100%"],
          }}
          transition={{ 
            duration: disabled || loading ? 0 : 2.5, 
            repeat: disabled || loading ? 0 : Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
        
        {/* Pulse effect when disabled */}
        {disabled && !loading && (
          <motion.div
            className="absolute inset-0 bg-muted/50"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </Button>
    </motion.div>
  );
};