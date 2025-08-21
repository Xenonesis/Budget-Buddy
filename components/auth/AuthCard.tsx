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
    <div className="bg-background/80 backdrop-blur-lg rounded-2xl border shadow-lg p-8 relative overflow-hidden">
      {/* Subtle background animation */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-2xl"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: "mirror" 
          }}
          style={{
            backgroundSize: '200% 200%'
          }}
        />
      </div>

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
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent drop-shadow-sm">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {subtitle}
        </p>
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
  );
};