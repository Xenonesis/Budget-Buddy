'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Mail } from 'lucide-react';
import {
  AuthLogo,
  AuthCard,
  LoginForm,
  ForgotPasswordLink,
  SignUpPrompt,
  AnimatedBackground,
} from '@/components/auth';
import { BackToHomeLink } from '@/components/auth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Get initial message from URL params
  const initialMessage = useMemo(() => searchParams.get('message'), [searchParams]);
  const [successMessage, setSuccessMessage] = useState<string | null>(initialMessage);

  // Clear the message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLoginSuccess = () => {
    setShowSuccessAnimation(true);
    setIsLoading(true);

    // Add a slight delay for the success animation
    setTimeout(() => {
      router.push('/dashboard');
      router.refresh();
    }, 1500);
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleLoginStart = () => {
    setIsLoading(true);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden overflow-x-hidden">
      {/* Brutalist Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Success message from URL params */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-[#00FF66] border-4 border-foreground p-4 shadow-[8px_8px_0px_hsl(var(--foreground))]">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-foreground stroke-[3]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-mono font-bold uppercase tracking-widest text-foreground">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-background border-4 border-foreground p-8 shadow-[16px_16px_0px_hsl(var(--foreground))]"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-primary border-4 border-foreground flex items-center justify-center shadow-[4px_4px_0px_hsl(var(--foreground))]"
                >
                  <CheckCircle2 className="w-8 h-8 text-foreground stroke-[3]" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-2xl font-display font-black uppercase tracking-tight text-foreground bg-foreground/5 inline-block px-2">
                    Welcome back!
                  </h3>
                  <p className="font-mono font-bold text-sm tracking-widest text-foreground mt-2">
                    Redirecting to dashboard...
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <BackToHomeLink />

        <div className="relative">
          <AuthCard title="Welcome back" subtitle="Sign in to your account" error={error}>
            <AuthLogo />
          </AuthCard>
        </div>

        <div className="relative border-4 border-foreground bg-background shadow-[12px_12px_0px_hsl(var(--foreground))] p-8 mt-4 overflow-hidden transition-all duration-300">
          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            onStart={handleLoginStart}
          />

          <div className="mt-6 pt-4 border-t-4 border-foreground">
            <ForgotPasswordLink />
          </div>
        </div>

        <SignUpPrompt />
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
