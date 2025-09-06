"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  error?: string | null;
  children: React.ReactNode;
  showBackLink?: boolean;
}

export const AuthCard = ({ 
  title, 
  subtitle, 
  error, 
  children,
  showBackLink = true
}: AuthCardProps) => {
  return (
    <div className="relative group">
      {/* Enhanced glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-violet-500/30 to-primary/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative bg-background/85 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 overflow-hidden">
        {/* Enhanced background animation with multiple layers */}
        <div className="absolute inset-0 -z-10">
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/8 via-violet-500/6 to-transparent rounded-2xl"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: '300% 300%'
            }}
          />
          
          {/* Additional animated layer */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tl from-transparent via-primary/4 to-violet-500/4 rounded-2xl"
            animate={{ 
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>
        
        {/* Subtle border animation */}
        <motion.div 
          className="absolute inset-0 rounded-2xl border border-primary/20"
          animate={{
            borderColor: ['rgba(124, 58, 237, 0.2)', 'rgba(139, 92, 246, 0.4)', 'rgba(124, 58, 237, 0.2)']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />

      <motion.div 
        className="space-y-3 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <motion.div
          className="mx-auto mb-6 relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2, 
            duration: 0.4, 
            type: "spring", 
            stiffness: 200 
          }}
        >
          {children}
        </motion.div>
        <motion.h1 
          className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            backgroundSize: '200% 200%'
          }}
        >
          {title}
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-sm leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {subtitle}
        </motion.p>
      </motion.div>

      {error && (
        <motion.div 
          className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm border border-destructive/20 flex items-center gap-2 text-destructive"
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}
      </div>
    </div>
  );
};