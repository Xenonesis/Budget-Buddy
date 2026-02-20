'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Shield, Clock, RefreshCw } from 'lucide-react';

// AuthLogo component
const AuthLogo = () => (
  <div className="flex items-center justify-center">
    <div className="relative border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] bg-[#DFFF00] p-3 transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
      <Image
        src="/logo.svg"
        alt="Budget Buddy Logo"
        width={48}
        height={48}
        className="h-12 w-12"
        priority={true}
      />
    </div>
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessState, setShowSuccessState] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setShowSuccessState(true);
      setMessage('Check your email for a password reset link');
    } catch (error: any) {
      setError(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden overflow-x-hidden">
      {/* Brutalist Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Back to home link */}
        <div>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-mono font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors group border-2 border-transparent hover:border-foreground px-2 py-1"
          >
            <ArrowLeft className="h-4 w-4 stroke-[3]" />
            Back to login
          </Link>
        </div>

        <div className="bg-background border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))] p-8 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!showSuccessState ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="space-y-4 text-center mb-8 border-b-4 border-foreground pb-6">
                  <div className="mx-auto mb-6">
                    <AuthLogo />
                  </div>
                  <div>
                    <h1 className="text-2xl font-display font-black uppercase tracking-tight text-foreground bg-foreground/5 inline-block px-2">
                      Reset your password
                    </h1>
                    <p className="text-foreground font-mono font-bold text-sm tracking-wide mt-4">
                      Enter your email address and we&apos;ll send you a link to reset your password
                    </p>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <div className="mb-6 bg-red-600/10 p-4 text-sm font-mono font-bold uppercase border-4 border-red-600 flex items-center gap-3 shadow-[4px_4px_0px_hsl(var(--red-600))]">
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 stroke-[3]" />
                    <span className="text-red-700">{error}</span>
                  </div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="h-14 pl-4 pr-4 bg-background border-4 border-foreground rounded-none transition-all duration-200 text-base font-mono font-bold shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 outline-none w-full"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-14 border-4 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-0.5 hover:translate-x-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none"
                      disabled={loading || !email}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? (
                          <>
                            <RefreshCw className="h-6 w-6 animate-spin stroke-[3]" />
                            <span className="text-base text-inherit">Sending link...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-6 w-6 stroke-[3]" />
                            <span className="text-base text-inherit">Send Reset Link</span>
                          </>
                        )}
                      </span>
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-6"
              >
                <div className="mx-auto w-20 h-20 bg-green-500 border-4 border-foreground flex items-center justify-center shadow-[6px_6px_0px_hsl(var(--foreground))]">
                  <CheckCircle className="w-10 h-10 text-foreground stroke-[3]" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-display font-black uppercase tracking-tight text-foreground bg-foreground/5 inline-block px-2">
                    Check your email
                  </h2>
                  <div className="space-y-2 p-4 border-l-4 border-foreground bg-foreground/5 text-left font-mono font-bold text-sm">
                    <p className="text-foreground">We&apos;ve sent a password reset link to:</p>
                    <p className="text-primary bg-primary/10 px-2 py-1 inline-block border-2 border-primary">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-300 border-4 border-foreground p-4 shadow-[4px_4px_0px_hsl(var(--foreground))] text-left mt-8">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-foreground flex-shrink-0 stroke-[3]" />
                    <div>
                      <p className="font-mono font-black uppercase tracking-widest text-foreground text-sm mb-1">
                        Link expires in 60 minutes
                      </p>
                      <p className="font-mono text-foreground font-bold text-xs">
                        Didn&apos;t receive the email? Check your spam folder or request a new link.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <Button
                    onClick={() => setShowSuccessState(false)}
                    className="w-full h-14 border-4 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-0.5 hover:translate-x-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none"
                  >
                    Send Another Link
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/login')}
                    className="w-full h-14 border-4 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-0.5 hover:translate-x-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none"
                  >
                    Back to Login
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-3 px-4 py-3 bg-green-500 border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
            <Shield className="w-5 h-5 text-foreground stroke-[3]" />
            <span className="text-sm font-mono font-black uppercase tracking-widest text-foreground">
              Secure Password Reset
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
