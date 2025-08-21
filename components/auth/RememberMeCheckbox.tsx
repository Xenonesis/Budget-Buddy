"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RememberMeCheckbox = ({ checked, onChange }: RememberMeCheckboxProps) => {
  return (
    <motion.label 
      className="flex items-center space-x-2 cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <motion.div
          className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
            checked 
              ? 'bg-primary border-primary' 
              : 'border-muted-foreground/30 group-hover:border-primary/50'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: checked ? 1 : 0, 
              opacity: checked ? 1 : 0 
            }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center h-full"
          >
            <Check className="h-3 w-3 text-white" />
          </motion.div>
        </motion.div>
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        Remember me
      </span>
    </motion.label>
  );
};