'use client';

import { useState, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ValidatedInput } from '@/components/ui/validated-input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  error?: string | null;
  inputRef?: RefObject<HTMLInputElement | null>;
}

export const EmailInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  inputRef,
}: EmailInputProps) => {
  const [touched, setTouched] = useState(false);

  const handleFocus = () => {
    setTouched(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  // Determine if email format is valid (basic check for indicator)
  const isValidFormat = value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const hasError = error && touched;
  const showSuccess = isValidFormat && !error && touched;

  return (
    <div className="space-y-3">
      <motion.label
        htmlFor="email"
        className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        Email Address
      </motion.label>
      <div className="relative group">
        {/* Enhanced input container with glow effect - changes color based on state */}
        <div
          className={`absolute -inset-0.5 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 ${
            hasError
              ? 'bg-gradient-to-r from-red-500/20 via-red-400/20 to-red-500/20'
              : showSuccess
                ? 'bg-gradient-to-r from-green-500/20 via-emerald-400/20 to-green-500/20'
                : 'bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20'
          }`}
        />

        <div className="relative">
          <ValidatedInput
            ref={inputRef}
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={hasError ? 'email-error' : undefined}
            className={`h-12 pl-4 pr-12 bg-background/50 backdrop-blur-sm border-2 rounded-lg focus:bg-background/80 transition-all duration-300 text-base ${
              hasError
                ? 'border-red-500/50 focus:border-red-500/70'
                : showSuccess
                  ? 'border-green-500/50 focus:border-green-500/70'
                  : 'border-muted/30 focus:border-primary/50'
            }`}
          />

          {/* Enhanced animated underline - changes color based on state */}
          <motion.div
            className={`absolute bottom-0 left-0 h-[3px] rounded-full ${
              hasError
                ? 'bg-gradient-to-r from-red-500 via-red-400 to-red-500'
                : showSuccess
                  ? 'bg-gradient-to-r from-green-500 via-emerald-400 to-green-500'
                  : 'bg-gradient-to-r from-primary via-violet-500 to-primary'
            }`}
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: touched ? (value ? '100%' : '0%') : '0%',
              opacity: touched ? (value ? 1 : 0) : 0,
            }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />

          {/* Status indicator */}
          <AnimatePresence mode="wait">
            {hasError ? (
              <motion.div
                key="error-icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
              >
                <AlertCircle className="w-5 h-5 text-red-500" />
              </motion.div>
            ) : showSuccess ? (
              <motion.div
                key="success-icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </motion.div>
            ) : value.length > 0 ? (
              <motion.div
                key="neutral-icon"
                className="absolute right-4 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-violet-500 shadow-lg" />
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Floating label effect */}
          {value.length > 0 && (
            <motion.div
              className={`absolute -top-2 left-3 px-2 bg-background text-xs font-medium ${
                hasError ? 'text-red-500' : showSuccess ? 'text-green-500' : 'text-primary'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              Email
            </motion.div>
          )}
        </div>
      </div>

      {/* Error message with accessibility */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            id="email-error"
            role="alert"
            aria-live="polite"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-red-500 text-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
