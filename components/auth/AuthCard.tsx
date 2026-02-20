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
    <div className="relative group w-full max-w-md mx-auto">
      <div className="bg-paper border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))] p-8 overflow-hidden transition-all duration-300">
        <div className="space-y-4 text-center">
          <div className="mx-auto mb-8 border-b-4 border-foreground pb-4">
            {children}
          </div>
          <h1 className="text-4xl font-display font-black uppercase tracking-tight text-foreground bg-foreground/5 inline-block px-2">
            {title}
          </h1>
          <p className="text-foreground font-mono font-bold text-sm uppercase tracking-widest bg-foreground/5 p-2 border-2 border-transparent">
            {subtitle}
          </p>
        </div>

        {error && (
          <div className="mt-6 border-4 border-red-500 bg-red-500/10 p-4 text-sm font-mono font-bold uppercase tracking-widest flex items-center gap-3 text-red-600 shadow-[4px_4px_0px_hsl(var(--red-500))]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};