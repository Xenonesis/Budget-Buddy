'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield, ArrowRight, Check, Loader2 } from 'lucide-react';
import { AuthLogo } from '@/components/auth';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Invalid or expired reset link. Please try again.');
        setSessionValid(false);
      }
    };

    checkSession();
  }, []);

  // Password strength calculation
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

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      setShowSuccessState(true);
    } catch (error: any) {
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Subtle grain texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[400px] relative z-10">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {!showSuccessState ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="mb-6">
                    <AuthLogo />
                  </div>
                  <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">
                    Set new password
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Choose a strong password to secure your account
                  </p>
                </div>

                {/* Error display */}
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

                {!sessionValid && (
                  <div className="text-center">
                    <Button
                      onClick={() => router.push('/auth/reset-password')}
                      className="h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                    >
                      Request new reset link
                    </Button>
                  </div>
                )}

                {sessionValid && (
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium text-foreground/80">
                          New password
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
                          className="h-11 px-3.5 pr-11 bg-background border border-border rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
                          placeholder="Create a strong password"
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
                                    req.met ? 'bg-emerald-500/15' : 'bg-muted/30'
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

                    {/* Confirm Password Field */}
                    <div className="space-y-1.5">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80 block">
                        Confirm new password
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
                          placeholder="Confirm your new password"
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

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                        disabled={
                          loading ||
                          password !== confirmPassword ||
                          !password ||
                          passwordStrength() < 50
                        }
                      >
                        <span className="flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-sm">Updating…</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              <span className="text-sm">Update password</span>
                            </>
                          )}
                        </span>
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 20 }}
                  className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-5"
                >
                  <CheckCircle className="w-7 h-7 text-emerald-500" />
                </motion.div>

                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  Password updated
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>

                <div className="rounded-lg bg-muted/30 border border-border/40 px-4 py-3 mb-6">
                  <div className="flex items-start gap-3 text-left">
                    <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p className="font-medium text-foreground/80">Your account is secure</p>
                      <p>Consider enabling two-factor authentication for additional security.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    router.push(
                      '/auth/login?message=Password updated successfully! Please sign in.'
                    )
                  }
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-sm">Continue to login</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
