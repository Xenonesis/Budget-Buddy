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
    <div className="space-y-2">
      <label
        htmlFor="email"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Email
      </label>
      <div className="relative">
        <ValidatedInput
          id="email"
          type="email"
          placeholder="name@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          required
        />
        <motion.div 
          className="absolute bottom-0 left-0 h-[2px] bg-primary"
          initial={{ width: 0 }}
          animate={{ width: touched ? (value ? "100%" : "0%") : "0%" }}
          transition={{ duration: 0.3 }}
        />
        {value.length > 0 && (
          <motion.div
            className="absolute right-3 top-3 h-5 w-5 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
          </motion.div>
        )}
      </div>
    </div>
  );
};