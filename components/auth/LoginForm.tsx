'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useUserPreferences } from '@/lib/store';
import { EmailInput } from './EmailInput';
import { PasswordInput } from './PasswordInput';
import { LoginButton } from './LoginButton';
import { RememberMeCheckbox } from './RememberMeCheckbox';
import { SocialLoginButtons } from './SocialLoginButtons';
import { Mail, Wand2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 60000, // 1 minute
  lockoutMs: 300000, // 5 minutes after max attempts
};

interface RateLimitState {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil: number | null;
}

interface LoginFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onStart?: () => void;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginForm = ({ onSuccess, onError, onStart }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPreferences } = useUserPreferences();

  // New state for enhanced features
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    attempts: 0,
    firstAttemptTime: 0,
    lockedUntil: null,
  });
  const [countdown, setCountdown] = useState(0);

  // Refs for accessibility
  const emailInputRef = useRef<HTMLInputElement>(null);
  const errorAnnouncerRef = useRef<HTMLOutputElement>(null);

  // Auto-focus email field on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      emailInputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Load rate limit state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('login_rate_limit');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RateLimitState;
        const now = Date.now();

        // Check if lockout has expired
        if (parsed.lockedUntil && parsed.lockedUntil <= now) {
          // Reset if lockout expired
          localStorage.removeItem('login_rate_limit');
        } else if (parsed.firstAttemptTime + RATE_LIMIT_CONFIG.windowMs < now) {
          // Reset if window expired
          localStorage.removeItem('login_rate_limit');
        } else {
          setRateLimitState(parsed);
        }
      } catch {
        localStorage.removeItem('login_rate_limit');
      }
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (rateLimitState.lockedUntil) {
      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil((rateLimitState.lockedUntil! - Date.now()) / 1000));
        setCountdown(remaining);

        if (remaining <= 0) {
          // Reset rate limit state after lockout expires
          setRateLimitState({ attempts: 0, firstAttemptTime: 0, lockedUntil: null });
          localStorage.removeItem('login_rate_limit');
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [rateLimitState.lockedUntil]);

  // Email validation
  const validateEmail = useCallback((value: string) => {
    if (!value) {
      return null; // Don't show error for empty field
    }
    if (!EMAIL_REGEX.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }, []);

  // Handle email change with validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  // Handle email blur for validation
  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  // Check rate limit before submission
  const checkRateLimit = (): boolean => {
    const now = Date.now();

    // Check if currently locked out
    if (rateLimitState.lockedUntil && rateLimitState.lockedUntil > now) {
      return false;
    }

    // Check if window has expired, reset if so
    if (rateLimitState.firstAttemptTime + RATE_LIMIT_CONFIG.windowMs < now) {
      setRateLimitState({ attempts: 0, firstAttemptTime: 0, lockedUntil: null });
      return true;
    }

    // Check if max attempts reached
    if (rateLimitState.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      const lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
      const newState = { ...rateLimitState, lockedUntil };
      setRateLimitState(newState);
      localStorage.setItem('login_rate_limit', JSON.stringify(newState));
      return false;
    }

    return true;
  };

  // Record failed attempt
  const recordFailedAttempt = () => {
    const now = Date.now();
    const newState: RateLimitState = {
      attempts: rateLimitState.attempts + 1,
      firstAttemptTime: rateLimitState.firstAttemptTime || now,
      lockedUntil: null,
    };

    // Check if this attempt triggers lockout
    if (newState.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      newState.lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
    }

    setRateLimitState(newState);
    localStorage.setItem('login_rate_limit', JSON.stringify(newState));
  };

  // Reset rate limit on successful login
  const resetRateLimit = () => {
    setRateLimitState({ attempts: 0, firstAttemptTime: 0, lockedUntil: null });
    localStorage.removeItem('login_rate_limit');
  };

  // Magic link login handler
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || emailError) {
      setEmailTouched(true);
      setEmailError(validateEmail(email) || 'Email is required');
      return;
    }

    if (!checkRateLimit()) {
      return;
    }

    setLoading(true);
    onStart?.();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${globalThis.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      setMagicLinkSent(true);
      resetRateLimit();
    } catch (error: any) {
      recordFailedAttempt();
      onError(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email before submission
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailTouched(true);
      setEmailError(emailValidationError);
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      onError(
        `Too many login attempts. Please try again in ${Math.ceil(countdown / 60)} minute(s).`
      );
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    onError(''); // Clear previous errors
    onStart?.(); // Notify parent component that login has started

    try {
      // Reset preferences to ensure a clean state
      resetPreferences();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Reset rate limit on success
      resetRateLimit();

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('lastEmail', email);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('lastEmail');
      }

      onSuccess();
    } catch (error: any) {
      recordFailedAttempt();
      onError(error.message || 'Failed to sign in');
      setIsSubmitting(false);
    } finally {
      setLoading(false);
    }
  };

  const remainingAttempts = RATE_LIMIT_CONFIG.maxAttempts - rateLimitState.attempts;
  const isLockedOut = rateLimitState.lockedUntil && rateLimitState.lockedUntil > Date.now();
  const isEmailValid = email.length > 0 && !emailError;

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem('rememberMe');
    const lastEmail = localStorage.getItem('lastEmail');
    if (remembered === 'true' && lastEmail) {
      setEmail(lastEmail);
      setRememberMe(true);
    }
  }, []);

  const isFormValid = magicLinkMode ? isEmailValid : isEmailValid && password.length > 0;

  // Magic link success screen
  if (magicLinkSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
        >
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </motion.div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-muted-foreground text-sm">
          We sent a magic link to <strong className="text-foreground">{email}</strong>
        </p>
        <p className="text-muted-foreground text-xs">
          Click the link in the email to sign in. The link will expire in 1 hour.
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMagicLinkSent(false);
            setMagicLinkMode(false);
          }}
          className="mt-4"
        >
          Back to login
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={magicLinkMode ? handleMagicLinkLogin : handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      aria-describedby="form-instructions"
    >
      {/* Screen reader announcements */}
      <output ref={errorAnnouncerRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      <span id="form-instructions" className="sr-only">
        {magicLinkMode
          ? 'Enter your email to receive a magic link for passwordless login'
          : 'Enter your email and password to sign in'}
      </span>

      {/* Rate limit warning */}
      <AnimatePresence>
        {isLockedOut && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
            role="alert"
          >
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                Too many attempts. Try again in {Math.floor(countdown / 60)}:
                {String(countdown % 60).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempts remaining warning */}
      <AnimatePresence>
        {!isLockedOut &&
          remainingAttempts <= 2 &&
          remainingAttempts > 0 &&
          rateLimitState.attempts > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3"
              role="alert"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
                </span>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <EmailInput
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={emailTouched ? emailError : null}
          inputRef={emailInputRef}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {!magicLinkMode && (
          <motion.div
            key="password-field"
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <PasswordInput value={password} onChange={setPassword} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!magicLinkMode && (
          <motion.div
            key="remember-me"
            className="flex items-center justify-between"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
      >
        {magicLinkMode ? (
          <Button
            type="submit"
            className="w-full h-12 relative overflow-hidden group"
            disabled={loading || isLockedOut || !isEmailValid}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending magic link...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Send Magic Link
              </span>
            )}
          </Button>
        ) : (
          <LoginButton
            loading={loading}
            isSubmitting={isSubmitting}
            disabled={!isFormValid || !!isLockedOut}
          />
        )}
      </motion.div>

      {/* Toggle between magic link and password login */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75, duration: 0.3 }}
        className="text-center"
      >
        <button
          type="button"
          onClick={() => setMagicLinkMode(!magicLinkMode)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5"
        >
          {magicLinkMode ? (
            <span>Use password instead</span>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Sign in with magic link</span>
            </>
          )}
        </button>
      </motion.div>

      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.3 }}
      >
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <SocialLoginButtons onError={onError} />
      </motion.div>
    </motion.form>
  );
};
