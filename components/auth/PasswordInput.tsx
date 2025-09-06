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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <motion.label
          htmlFor="password"
          className="text-sm font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/90"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          Password
        </motion.label>
        {showPasswordStrength && passwordStrength && getStrengthText && getStrengthColor && (
          <motion.div 
            className="text-xs font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {getStrengthText()}
          </motion.div>
        )}
      </div>
      
      <div className="relative group">
        {/* Enhanced input container with glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          <ValidatedInput
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            required
            className="h-12 pl-4 pr-20 bg-background/50 backdrop-blur-sm border-2 border-muted/30 rounded-lg focus:border-primary/50 focus:bg-background/80 transition-all duration-300 text-base"
          />
          
          {/* Enhanced toggle button */}
          <motion.button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <motion.div
              animate={{ rotate: showPassword ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.div>
          </motion.button>
          
          {/* Enhanced animated underline */}
          <motion.div 
            className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-primary rounded-full"
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: touched ? (value ? "100%" : "0%") : "0%",
              opacity: touched ? (value ? 1 : 0) : 0
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
          
          {/* Enhanced success indicator */}
          {value.length > 0 && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-violet-500 shadow-lg" />
            </motion.div>
          )}
          
          {/* Floating label effect */}
          {value.length > 0 && (
            <motion.div
              className="absolute -top-2 left-3 px-2 bg-background text-xs font-medium text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              Password
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Enhanced password strength indicator */}
      {showPasswordStrength && passwordStrength && getStrengthText && getStrengthColor && (
        <motion.div 
          className="pt-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div 
              className={`h-full ${getStrengthColor()} shadow-sm`}
              initial={{ width: 0 }}
              animate={{ width: `${passwordStrength()}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <motion.div
            className="flex justify-between items-center mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-xs text-muted-foreground">Strength:</span>
            <span className={`text-xs font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
              {getStrengthText()}
            </span>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};