'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield, ArrowRight } from 'lucide-react';

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
    // Check if there's a session when the component mounts
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
    if (strength >= 90) return 'bg-green-600';
    if (strength >= 70) return 'bg-green-500';
    if (strength >= 50) return 'bg-yellow-500';
    if (strength >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPasswordRequirements = () => {
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { label: 'Contains number', met: /[0-9]/.test(password) },
      { label: 'Contains special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden overflow-x-hidden">
      {/* Brutalist Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
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
                      Set new password
                    </h1>
                    <p className="text-foreground font-mono font-bold text-sm tracking-wide mt-4">
                      Choose a strong password to secure your account
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

                {!sessionValid && (
                  <div className="text-center">
                    <Button onClick={() => router.push('/auth/reset-password')}>
                      Request New Reset Link
                    </Button>
                  </div>
                )}

                {sessionValid && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    {/* Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          className="h-14 pl-4 pr-16 bg-background border-4 border-foreground rounded-none transition-all duration-200 text-base font-mono font-bold shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 outline-none w-full"
                          placeholder="Enter your new password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff size={20} strokeWidth={3} />
                          ) : (
                            <Eye size={20} strokeWidth={3} />
                          )}
                        </button>
                      </div>

                      {password && (
                        <div className="mt-4 p-4 border-4 border-foreground bg-foreground/5 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-foreground">
                              Strength
                            </div>
                            <div
                              className={`text-xs font-mono font-black uppercase tracking-widest ${
                                passwordStrength() >= 90
                                  ? 'text-green-600'
                                  : passwordStrength() >= 70
                                    ? 'text-green-500'
                                    : passwordStrength() >= 50
                                      ? 'text-yellow-600'
                                      : passwordStrength() >= 30
                                        ? 'text-orange-600'
                                        : 'text-red-600'
                              }`}
                            >
                              {getStrengthText()}
                            </div>
                          </div>
                          <div className="h-4 w-full bg-background border-2 border-foreground overflow-hidden">
                            <div
                              className={`h-full ${getStrengthColor()} transition-all duration-300`}
                              style={{ width: `${passwordStrength()}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t-2 border-foreground">
                            {getPasswordRequirements().map((req) => (
                              <div
                                key={req.label}
                                className={`flex items-center gap-3 text-xs font-mono font-bold uppercase tracking-wider ${
                                  req.met ? 'text-foreground' : 'text-muted-foreground opacity-50'
                                }`}
                              >
                                <div
                                  className={`w-3 h-3 border-2 border-foreground flex items-center justify-center ${
                                    req.met ? 'bg-foreground text-background' : 'bg-transparent'
                                  }`}
                                >
                                  {req.met && <div className="w-1.5 h-1.5 bg-background m-auto" />}
                                </div>
                                <span>{req.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`h-14 pl-4 pr-16 bg-background rounded-none transition-all duration-200 text-base font-mono font-bold outline-none w-full border-4 shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 ${
                            confirmPassword && password !== confirmPassword
                              ? 'border-red-500 focus:border-red-600 text-red-600 shadow-[4px_4px_0px_hsl(var(--red-500))]'
                              : confirmPassword && password === confirmPassword
                                ? 'border-green-500 focus:border-green-600 text-green-600 shadow-[4px_4px_0px_hsl(var(--green-500))]'
                                : 'border-foreground focus:border-foreground text-foreground'
                          }`}
                          placeholder="Confirm your new password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={20} strokeWidth={3} />
                          ) : (
                            <Eye size={20} strokeWidth={3} />
                          )}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <div className="mt-2 text-xs font-mono font-bold uppercase tracking-widest text-red-600 bg-red-600/10 border-2 border-red-600 p-2 flex items-center gap-2">
                          <AlertCircle size={16} strokeWidth={3} />
                          Passwords don&apos;t match
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-14 border-4 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-0.5 hover:translate-x-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none"
                        disabled={
                          loading ||
                          password !== confirmPassword ||
                          !password ||
                          passwordStrength() < 50
                        }
                      >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {loading ? (
                            <>
                              <Lock className="h-6 w-6 stroke-[3] animate-pulse" />
                              <span className="text-base text-inherit">Updating...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-6 w-6 stroke-[3]" />
                              <span className="text-base text-inherit">Update Password</span>
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
                    Password Updated Successfully!
                  </h2>
                  <p className="font-mono text-foreground font-bold text-sm bg-foreground/5 p-4 border-l-4 border-foreground text-left">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>

                <div className="bg-green-300 border-4 border-foreground p-4 shadow-[4px_4px_0px_hsl(var(--foreground))] text-left mt-8">
                  <div className="flex items-center gap-4">
                    <Shield className="h-8 w-8 text-foreground flex-shrink-0 stroke-[3]" />
                    <div className="text-sm text-left">
                      <p className="font-mono font-black uppercase tracking-widest text-foreground text-sm mb-1">
                        Your account is now secure
                      </p>
                      <p className="font-mono text-foreground font-bold text-xs">
                        Remember to use a unique password and enable two-factor authentication for
                        additional security.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={() =>
                      router.push(
                        '/auth/login?message=Password updated successfully! Please sign in.'
                      )
                    }
                    className="w-full h-14 border-4 border-foreground bg-foreground text-background hover:bg-primary hover:text-foreground shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-0.5 hover:translate-x-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none group"
                  >
                    <span className="text-base text-inherit">Continue to Login</span>
                    <ArrowRight className="ml-3 h-5 w-5 stroke-[3] transition-transform group-hover:translate-x-1" />
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
              Bank-level Password Security
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
