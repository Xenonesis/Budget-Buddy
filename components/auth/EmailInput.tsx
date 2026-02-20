'use client';

import { useState, RefObject } from 'react';
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

  const isValidFormat = value.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const hasError = error && touched;
  const showSuccess = isValidFormat && !error && touched;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor="email"
        className="text-sm font-medium text-foreground/80 block"
      >
        Email address
      </label>
      <div className="relative">
        <ValidatedInput
          ref={inputRef}
          id="email"
          type="email"
          placeholder="you@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? 'email-error' : undefined}
          className={`h-11 px-3.5 pr-10 bg-background border rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 ${
            hasError
              ? 'border-destructive/60 focus:border-destructive focus:ring-2 focus:ring-destructive/15'
              : showSuccess
                ? 'border-success/60 focus:border-success focus:ring-2 focus:ring-success/15'
                : 'border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/10'
          }`}
        />

        {/* Status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {hasError ? (
            <AlertCircle className="w-4 h-4 text-destructive/70" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-success/70" />
          ) : null}
        </div>
      </div>

      {hasError && (
        <div
          id="email-error"
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-destructive text-xs mt-1"
        >
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
