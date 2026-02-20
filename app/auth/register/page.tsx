'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Mail,
  Check,
} from 'lucide-react';
import { AuthLogo } from '@/components/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { resetPreferences } = useUserPreferences();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      resetPreferences();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            preferred_currency: 'USD',
          },
          emailRedirectTo: `${window.location.origin}/auth/login?message=Account confirmed! Please sign in.`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          name: name,
          currency: 'USD',
        });

        if (profileError && profileError.code !== '23505') {
          console.warn('Profile creation failed, but user account was created.');
        }
      }

      setShowSuccessMessage(true);
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 20;
    else if (password.length >= 6) score += 10;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    return Math.min(100, score);
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    if (strength >= 90) return 'Excellent';
    if (strength >= 70) return 'Strong';
    if (strength >= 50) return 'Good';
    if (strength >= 30) return 'Fair';
    if (strength > 0) return 'Weak';
    return '';
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength >= 90) return 'bg-emerald-500';
    if (strength >= 70) return 'bg-emerald-400';
    if (strength >= 50) return 'bg-amber-400';
    if (strength >= 30) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const getStrengthTextColor = () => {
    const strength = passwordStrength();
    if (strength >= 70) return 'text-emerald-600 dark:text-emerald-400';
    if (strength >= 50) return 'text-amber-600 dark:text-amber-400';
    if (strength >= 30) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-500';
  };

  const getPasswordRequirements = () => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Number', met: /[0-9]/.test(password) },
      { label: 'Special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Subtle grain texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      {/* Success Message Overlay */}
      <AnimatePresence>
        {showSuccessMessage && (
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
              className="bg-card rounded-2xl border border-border/60 p-8 shadow-xl max-w-sm w-full mx-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4"
              >
                <Mail className="w-6 h-6 text-primary" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <h3 className="text-lg font-display font-semibold text-foreground">Check your email</h3>
                <p className="text-muted-foreground text-sm">
                  We&apos;ve sent a confirmation link to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Click the link in your email to activate your account
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="pt-5"
              >
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                >
                  Continue to login
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] p-8 sm:p-10">
          <div className="mb-8">
            <div className="mb-6">
              <AuthLogo />
            </div>
            <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Start managing your finances with Budget Buddy
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

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground/80 block">
                Full name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Your full name"
                className="h-11 px-3.5 bg-background border border-border rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground/80 block">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 px-3.5 bg-background border border-border rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Password
                </label>
                {password && (
                  <span className={`text-xs font-medium ${getStrengthTextColor()}`}>
                    {getStrengthText()}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="h-11 px-3.5 pr-11 bg-background border border-border rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <div className="space-y-3 pt-1">
                  {/* Strength bar */}
                  <div className="h-1 w-full bg-border/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${passwordStrength()}%` }}
                    />
                  </div>

                  {/* Requirements */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {getPasswordRequirements().map((req) => (
                      <div
                        key={req.label}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                          req.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground/50'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                            req.met
                              ? 'bg-emerald-500/15'
                              : 'bg-muted/30'
                          }`}
                        >
                          {req.met && <Check className="w-2 h-2" strokeWidth={3} />}
                        </div>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80 block">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`h-11 px-3.5 pr-11 bg-background rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 border ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-destructive/60 focus:border-destructive focus:ring-2 focus:ring-destructive/15'
                      : confirmPassword && password === confirmPassword
                        ? 'border-emerald-500/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15'
                        : 'border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/10'
                  }`}
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-1.5 text-destructive text-xs mt-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>Passwords don&apos;t match</span>
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all duration-200 ${
                      acceptedTerms
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'bg-background border-border hover:border-primary/40'
                    }`}
                  >
                    <Check
                      strokeWidth={3}
                      className={`w-2.5 h-2.5 ${acceptedTerms ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground leading-snug">
                  I agree to the{' '}
                  <Link href="/legal/terms-of-service" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/legal/privacy-policy" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                disabled={
                  loading ||
                  !acceptedTerms ||
                  password !== confirmPassword ||
                  !password ||
                  !email ||
                  !name
                }
              >
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span className="text-sm">
                    {loading ? 'Creating account…' : 'Create account'}
                  </span>
                </span>
              </Button>
            </div>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-6 pt-5 border-t border-border/60">
            <span className="text-sm text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
