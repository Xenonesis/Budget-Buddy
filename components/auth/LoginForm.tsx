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

        if (parsed.lockedUntil && parsed.lockedUntil <= now) {
          localStorage.removeItem('login_rate_limit');
        } else if (parsed.firstAttemptTime + RATE_LIMIT_CONFIG.windowMs < now) {
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
      return null;
    }
    if (!EMAIL_REGEX.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  }, []);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailTouched) {
      setEmailError(validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const checkRateLimit = (): boolean => {
    const now = Date.now();

    if (rateLimitState.lockedUntil && rateLimitState.lockedUntil > now) {
      return false;
    }

    if (rateLimitState.firstAttemptTime + RATE_LIMIT_CONFIG.windowMs < now) {
      setRateLimitState({ attempts: 0, firstAttemptTime: 0, lockedUntil: null });
      return true;
    }

    if (rateLimitState.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      const lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
      const newState = { ...rateLimitState, lockedUntil };
      setRateLimitState(newState);
      localStorage.setItem('login_rate_limit', JSON.stringify(newState));
      return false;
    }

    return true;
  };

  const recordFailedAttempt = () => {
    const now = Date.now();
    const newState: RateLimitState = {
      attempts: rateLimitState.attempts + 1,
      firstAttemptTime: rateLimitState.firstAttemptTime || now,
      lockedUntil: null,
    };

    if (newState.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      newState.lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
    }

    setRateLimitState(newState);
    localStorage.setItem('login_rate_limit', JSON.stringify(newState));
  };

  const resetRateLimit = () => {
    setRateLimitState({ attempts: 0, firstAttemptTime: 0, lockedUntil: null });
    localStorage.removeItem('login_rate_limit');
  };

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

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailTouched(true);
      setEmailError(emailValidationError);
      return;
    }

    if (!checkRateLimit()) {
      onError(
        `Too many login attempts. Please try again in ${Math.ceil(countdown / 60)} minute(s).`
      );
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    onError('');
    onStart?.();

    try {
      console.log('[LoginForm] Attempting login with:', { email });
      console.log(
        '[LoginForm] Supabase URL:',
        process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'
      );
      console.log(
        '[LoginForm] Supabase Key:',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      );

      resetPreferences();

      console.log('[LoginForm] Calling supabase.auth.signInWithPassword...');

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[LoginForm] SignIn response:', { error });

      if (error) throw error;

      resetRateLimit();

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
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4 py-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Mail className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Check your email</h3>
          <p className="text-muted-foreground text-sm mt-1">
            We sent a magic link to <strong className="text-foreground">{email}</strong>
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Click the link in the email to sign in. Expires in 1 hour.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMagicLinkSent(false);
            setMagicLinkMode(false);
          }}
          className="mt-3 text-sm text-muted-foreground hover:text-foreground"
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
      transition={{ delay: 0.2, duration: 0.35 }}
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
            className="rounded-lg bg-destructive/8 border border-destructive/20 px-4 py-3"
            role="alert"
          >
            <div className="flex items-center gap-2 text-destructive text-sm">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
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
              className="rounded-lg bg-amber-500/8 border border-amber-500/20 px-4 py-3"
              role="alert"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
                </span>
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      <div className="space-y-4">
        <EmailInput
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          error={emailTouched ? emailError : null}
          inputRef={emailInputRef}
        />

        <AnimatePresence mode="wait">
          {!magicLinkMode && (
            <motion.div
              key="password-field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PasswordInput value={password} onChange={setPassword} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!magicLinkMode && (
          <motion.div
            key="remember-me"
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {magicLinkMode ? (
          <Button
            type="submit"
            className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200"
            disabled={loading || isLockedOut || !isEmailValid}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Sending…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Send magic link
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
      </div>

      {/* Toggle between magic link and password login */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setMagicLinkMode(!magicLinkMode)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
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
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      <SocialLoginButtons onError={onError} />
    </motion.form>
  );
};
