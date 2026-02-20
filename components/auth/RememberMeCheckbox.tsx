"use client";

import { Check } from "lucide-react";

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RememberMeCheckbox = ({ checked, onChange }: RememberMeCheckboxProps) => {
  return (
    <label 
      className="flex items-center space-x-3 cursor-pointer group select-none"
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        
        <div
          className={`w-6 h-6 border-4 flex items-center justify-center transition-all duration-200 ${
            checked 
              ? 'bg-foreground border-foreground text-background' 
              : 'bg-background border-foreground text-transparent hover:bg-foreground/10'
          } shadow-[2px_2px_0px_hsl(var(--foreground))]`}
        >
          <Check strokeWidth={4} className={`w-4 h-4 ${checked ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
        </div>
      </div>
      
      <span 
        className="text-xs font-mono font-bold uppercase tracking-widest text-foreground"
      >
        Remember me
      </span>
    </label>
  );
};