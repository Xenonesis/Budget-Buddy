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
    <div className="space-y-2">
      <label
        htmlFor="email"
        className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
      >
        Email Address
      </label>
      <div className="relative group">
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
          className={`h-14 pl-4 pr-12 bg-background border-4 rounded-none transition-all duration-200 text-base font-mono font-bold shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 outline-none w-full ${
            hasError
              ? 'border-red-500 focus:border-red-600'
              : showSuccess
                ? 'border-green-500 focus:border-green-600'
                : 'border-foreground focus:border-foreground'
          }`}
        />

        {/* Status indicator */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {hasError ? (
            <AlertCircle className="w-6 h-6 text-red-500 stroke-[3]" />
          ) : showSuccess ? (
            <CheckCircle2 className="w-6 h-6 text-green-500 stroke-[3]" />
          ) : null}
        </div>
      </div>

      {hasError && (
        <div
          id="email-error"
          role="alert"
          aria-live="polite"
          className="flex items-center gap-1.5 text-red-500 text-xs font-mono font-bold uppercase tracking-widest mt-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
