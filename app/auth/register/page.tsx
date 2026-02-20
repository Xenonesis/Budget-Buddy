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
  ChevronLeft,
  AlertCircle,
  Info,
  CheckCircle,
  Mail,
  Phone,
  CreditCard,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

// Custom Auth Logo component to ensure proper styling
const AuthLogo = () => (
  <div className="flex items-center gap-2">
    <motion.div
      className="relative"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 transition-all duration-300">
        <Image
          src="/logo.svg"
          alt="Budget Buddy Logo"
          width={56}
          height={56}
          className="h-14 w-14 sm:h-16 sm:w-16 transition-all duration-300"
          priority={true}
        />
      </div>
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/10 blur-sm -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
    </motion.div>
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <motion.span
        className="font-bold tracking-tight bg-gradient-to-r from-primary via-violet-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] text-2xl sm:text-3xl"
        whileHover={{
          textShadow: '0 0 8px rgba(124, 58, 237, 0.5)',
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
      >
        Budget Buddy
      </motion.span>
      <motion.div
        className="absolute -inset-1 bg-primary/5 blur-sm rounded-lg -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      ></motion.div>
    </motion.div>
  </div>
);

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
      // Reset preferences for a clean state
      resetPreferences();

      console.log('Starting registration process...');
      console.log('Email:', email);
      console.log('Name:', name);

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

      console.log('Signup response:', { data, error: signUpError });

      if (signUpError) {
        console.error('Signup error details:', {
          message: signUpError.message,
          status: signUpError.status,
          code: signUpError.code,
          details: signUpError,
        });
        throw signUpError;
      }

      console.log('User created successfully:', data.user?.id);

      if (data.user) {
        console.log('Attempting to create profile manually...');

        // Try to create the profile manually (in addition to any trigger)
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: email,
          name: name,
          currency: 'USD',
        });

        console.log('Profile creation result:', { error: profileError });

        // Handle profile creation errors
        if (profileError) {
          console.error('Profile creation error details:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint,
          });

          // If it's not a duplicate key error (23505), it might be a permissions issue
          if (profileError.code !== '23505') {
            // Try to handle the error gracefully
            console.warn(
              'Profile creation failed, but user account was created. Profile may be created by trigger.'
            );

            // Don't throw error here - the trigger might have handled it
            console.log('Continuing despite profile creation error...');
          }
        } else {
          console.log('Profile created successfully!');
        }
      }

      console.log('Registration completed successfully!');
      setShowSuccessMessage(true);
    } catch (error: any) {
      console.error('Registration failed:', {
        message: error.message,
        status: error.status,
        code: error.code,
        stack: error.stack,
      });
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;

    // Length check
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 20;
    else if (password.length >= 6) score += 10;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 20; // Has uppercase
    if (/[a-z]/.test(password)) score += 15; // Has lowercase
    if (/[0-9]/.test(password)) score += 15; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Has special char

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden overflow-x-hidden">
      {/* Brutalist Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Success Message Overlay */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-card/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-primary/20 max-w-md w-full mx-4"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                >
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-semibold text-foreground">Check your email!</h3>
                  <p className="text-muted-foreground text-sm">
                    We&apos;ve sent you a confirmation link at <br />
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Click the link in your email to activate your account
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-2"
                >
                  <Button onClick={() => router.push('/auth/login')} className="w-full">
                    Continue to Login
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md space-y-6 relative z-10">
        <Link
          href="/"
          className="absolute -top-12 left-0 text-sm font-mono font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors flex items-center gap-1 group border-2 border-transparent hover:border-foreground px-2 py-1"
        >
          <ChevronLeft className="h-4 w-4 stroke-[3]" />
          Back to home
        </Link>

        <div className="bg-background border-4 border-foreground shadow-[12px_12px_0px_hsl(var(--foreground))] p-8 relative overflow-hidden">
          <div className="space-y-4 text-center">
            <div className="mx-auto mb-8 border-b-4 border-foreground pb-4">
              <AuthLogo />
            </div>
            <h1 className="text-3xl font-display font-black uppercase tracking-tight text-foreground bg-foreground/5 inline-block px-2">
              Create your account
            </h1>
            <p className="text-foreground font-mono font-bold text-sm uppercase tracking-widest bg-foreground/5 p-2 border-2 border-transparent">
              Join thousands of users managing their finances with <br />
              <span className="font-black text-foreground">Budget Buddy</span>
            </p>
          </div>

          {error && (
            <motion.div
              className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm border border-destructive/20 flex items-center gap-2 text-destructive"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-6 mt-8">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="h-14 pl-4 pr-4 bg-background border-4 border-foreground rounded-none transition-all duration-200 text-base font-mono font-bold shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 outline-none w-full"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
              >
                Email
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

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="h-14 pl-4 pr-16 bg-background border-4 border-foreground rounded-none transition-all duration-200 text-base font-mono font-bold shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 outline-none w-full"
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
                          className={`w-3 h-3 border-2 border-foreground flexitems-center justify-center ${
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
                Confirm Password
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
                  placeholder="Confirm your password"
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

            {/* Terms and Conditions */}
            <div className="mt-6 flex items-start gap-4 p-4 border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
              <div className="relative flex items-center justify-center mt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="peer sr-only"
                />
                <div
                  className={`w-6 h-6 border-4 flex items-center justify-center transition-all duration-200 ${
                    acceptedTerms
                      ? 'bg-foreground border-foreground text-background'
                      : 'bg-background border-foreground text-transparent hover:bg-foreground/10'
                  } shadow-[2px_2px_0px_hsl(var(--foreground))]`}
                >
                  <div
                    className={`w-3 h-3 bg-background ${acceptedTerms ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                  />
                </div>
              </div>
              <label
                htmlFor="terms"
                className="text-sm font-mono font-bold uppercase tracking-widest leading-relaxed"
              >
                I agree to the{' '}
                <Link
                  href="/legal/terms-of-service"
                  className="text-foreground hover:bg-foreground hover:text-background border-b-2 border-foreground inline-block px-1"
                >
                  Terms
                </Link>{' '}
                and{' '}
                <Link
                  href="/legal/privacy-policy"
                  className="text-foreground hover:bg-foreground hover:text-background border-b-2 border-foreground inline-block px-1"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-14 border-4 border-foreground bg-foreground text-background hover:bg-[#DFFF00] hover:text-foreground shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:-translate-y-0.5 hover:translate-x-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none"
                disabled={
                  loading ||
                  !acceptedTerms ||
                  password !== confirmPassword ||
                  !password ||
                  !email ||
                  !name
                }
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <UserPlus className="h-6 w-6 stroke-[3]" />
                  <span className="text-base text-inherit">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </span>
                </span>
              </Button>
            </div>

            {/* Benefits highlight */}
            <div className="mt-8 pt-6 border-t-4 border-foreground">
              <div className="bg-[#DFFF00] p-6 border-4 border-foreground shadow-[6px_6px_0px_hsl(var(--foreground))]">
                <div className="flex items-center gap-3 mb-4 border-b-4 border-foreground pb-4">
                  <CreditCard className="h-8 w-8 stroke-[3]" />
                  <h3 className="font-display font-black uppercase text-xl text-foreground">
                    Start Managing Your Money Today
                  </h3>
                </div>
                <ul className="text-sm font-mono font-bold uppercase tracking-wider space-y-3">
                  <li className="flex gap-2">
                    <span className="text-foreground shrink-0 mt-0.5">●</span>
                    <span>Track expenses automatically</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground shrink-0 mt-0.5">●</span>
                    <span>Set budgets and savings goals</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground shrink-0 mt-0.5">●</span>
                    <span>Get personalized insights</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-foreground shrink-0 mt-0.5">●</span>
                    <span>Bank-level security protection</span>
                  </li>
                </ul>
              </div>
            </div>
          </form>

          <div className="text-center mt-8 pt-6 border-t-4 border-foreground">
            <span className="text-sm font-mono font-bold uppercase tracking-widest text-foreground">
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/login"
              className="text-sm font-mono font-black uppercase tracking-widest text-background bg-foreground px-3 py-1.5 hover:bg-[#00E5FF] hover:text-foreground border-2 border-transparent hover:border-foreground transition-colors inline-block mt-2 shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
