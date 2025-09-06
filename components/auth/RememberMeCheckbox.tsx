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
      className="flex items-center space-x-3 cursor-pointer group select-none"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        
        {/* Enhanced checkbox with glow effect */}
        <motion.div
          className={`w-5 h-5 rounded-md border-2 transition-all duration-300 relative overflow-hidden ${
            checked 
              ? 'bg-gradient-to-br from-primary to-violet-600 border-primary shadow-lg' 
              : 'border-muted-foreground/40 group-hover:border-primary/60 bg-background/50 backdrop-blur-sm'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Glow effect when checked */}
          {checked && (
            <motion.div
              className="absolute -inset-1 bg-primary/30 rounded-md blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Checkmark with enhanced animation */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{ 
              scale: checked ? 1 : 0, 
              opacity: checked ? 1 : 0,
              rotate: checked ? 0 : -180
            }}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              stiffness: 200,
              damping: 15
            }}
            className="flex items-center justify-center h-full relative z-10"
          >
            <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />
          </motion.div>
          
          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 bg-primary/20 rounded-md"
            initial={{ scale: 0, opacity: 0 }}
            animate={checked ? { scale: [0, 1.2, 0], opacity: [0, 0.5, 0] } : {}}
            transition={{ duration: 0.6 }}
          />
        </motion.div>
      </div>
      
      <motion.span 
        className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200"
        animate={{ color: checked ? 'rgb(124, 58, 237)' : undefined }}
        transition={{ duration: 0.2 }}
      >
        Remember me for 30 days
      </motion.span>
    </motion.label>
  );
};