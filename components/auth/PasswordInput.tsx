'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ValidatedInput } from '@/components/ui/validated-input';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  showPasswordStrength?: boolean;
  passwordStrength?: () => number;
  getStrengthText?: () => string;
  getStrengthColor?: () => string;
}

export const PasswordInput = ({
  value,
  onChange,
  onFocus,
  showPasswordStrength = false,
  passwordStrength,
  getStrengthText,
  getStrengthColor,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleFocus = () => {
    setTouched(true);
    if (onFocus) onFocus();
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="password"
          className="text-sm font-medium text-foreground/80"
        >
          Password
        </label>
        {showPasswordStrength && passwordStrength && getStrengthText && (
          <span className="text-xs font-medium text-muted-foreground">
            {getStrengthText()}
          </span>
        )}
      </div>

      <div className="relative">
        <ValidatedInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          required
          className="h-11 px-3.5 pr-11 bg-background border border-border rounded-lg transition-all duration-200 text-sm outline-none w-full placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showPasswordStrength && passwordStrength && getStrengthColor && (
        <div className="pt-1">
          <div className="h-1 w-full bg-border/40 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
              style={{ width: `${passwordStrength()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};