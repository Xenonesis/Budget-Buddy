'use client';

import { motion } from 'framer-motion';

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
  showBackLink = true,
}: AuthCardProps) => {
  return (
    <motion.div
      className="relative w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] p-8 sm:p-10 overflow-hidden">
        <div className="space-y-2 text-center mb-8">
          <div className="mb-6">{children}</div>
          <h1 className="text-2xl sm:text-[1.75rem] font-display font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {subtitle}
          </p>
        </div>

        {error && (
          <motion.div
            className="mb-6 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm flex items-start gap-2.5 text-destructive"
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 flex-shrink-0 mt-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
