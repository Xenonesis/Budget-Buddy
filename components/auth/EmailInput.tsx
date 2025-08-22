"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ValidatedInput } from "@/components/ui/validated-input";

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export const EmailInput = ({ value, onChange, onFocus }: EmailInputProps) => {
  const [touched, setTouched] = useState(false);

  const handleFocus = () => {
    setTouched(true);
    if (onFocus) onFocus();
  };

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
        {/* Enhanced input container with glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          <ValidatedInput
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            required
            className="h-12 pl-4 pr-12 bg-background/50 backdrop-blur-sm border-2 border-muted/30 rounded-lg focus:border-primary/50 focus:bg-background/80 transition-all duration-300 text-base"
          />
          
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
              Email
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};