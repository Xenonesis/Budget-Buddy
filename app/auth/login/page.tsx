'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LoginForm, ForgotPasswordLink, AuthLogo } from '@/components/auth';

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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Subtle grain texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Subtle gradient accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Success message from URL params */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full mx-4"
          >
            <div className="bg-card border border-border/60 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm text-foreground font-medium flex-1">{successMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 25 }}
              className="text-center space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center"
              >
                <CheckCircle2 className="w-7 h-7 text-primary" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-display font-semibold text-foreground">
                  Welcome back!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Redirecting to dashboard…
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[400px] relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        {/* Auth card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] p-8 sm:p-10">
          <div className="mb-8">
            <div className="mb-6">
              <AuthLogo />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to your financial headquarters
            </p>
          </div>

          {error && (
            <motion.div
              className="mb-6 rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm flex items-start gap-2.5 text-destructive"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <LoginForm
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
            onStart={handleLoginStart}
          />

          <div className="mt-6 pt-5 border-t border-border/60 flex justify-center">
            <ForgotPasswordLink />
          </div>

          <div className="text-center mt-5 pt-5 border-t border-border/60">
            <span className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
            </span>
            <Link
              href="/auth/register"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
