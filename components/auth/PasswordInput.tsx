"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Password
        </label>
        {showPasswordStrength && passwordStrength && getStrengthText && getStrengthColor && (
          <div className="text-xs text-muted-foreground">
            {getStrengthText()}
          </div>
        )}
      </div>
      <div className="relative">
        <ValidatedInput
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          required
        />
        <motion.button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </motion.button>
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px] bg-primary"
          initial={{ width: 0 }}
          animate={{ width: touched ? (value ? "100%" : "0%") : "0%" }}
          transition={{ duration: 0.3 }}
        />
        {value.length > 0 && (
          <motion.div
            className="absolute right-10 top-3 h-5 w-5 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
          </motion.div>
        )}
      </div>
      
      {showPasswordStrength && passwordStrength && getStrengthText && getStrengthColor && (
        <div className="pt-1">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${getStrengthColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${passwordStrength()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};