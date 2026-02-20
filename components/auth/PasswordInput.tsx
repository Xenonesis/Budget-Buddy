"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ValidatedInput } from "@/components/ui/validated-input";

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
  getStrengthColor
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleFocus = () => {
    setTouched(true);
    if (onFocus) onFocus();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="password"
          className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-foreground/5 py-1 px-2 inline-block border-2 border-transparent"
        >
          Password
        </label>
        {showPasswordStrength && passwordStrength && getStrengthText && getStrengthColor && (
          <div className="text-xs font-mono font-bold uppercase tracking-widest bg-foreground/10 px-2 py-1">
            {getStrengthText()}
          </div>
        )}
      </div>
      
      <div className="relative group">
        <ValidatedInput
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          required
          className="h-14 pl-4 pr-16 bg-background border-4 border-foreground rounded-none shadow-[4px_4px_0px_hsl(var(--foreground))] focus:shadow-[0px_0px_0px_transparent] focus:translate-x-1 focus:translate-y-1 transition-all duration-200 text-base font-mono font-bold outline-none w-full"
        />
        
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} strokeWidth={3} /> : <Eye size={20} strokeWidth={3} />}
        </button>
      </div>
      
      {showPasswordStrength && passwordStrength && getStrengthText && getStrengthColor && (
        <div className="pt-2">
          <div className="h-3 w-full bg-background border-2 border-foreground overflow-hidden">
            <div 
              className={`h-full ${getStrengthColor()}`}
              style={{ width: `${passwordStrength()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};