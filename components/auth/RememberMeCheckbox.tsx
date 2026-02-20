'use client';

import { Check } from 'lucide-react';

interface RememberMeCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const RememberMeCheckbox = ({ checked, onChange }: RememberMeCheckboxProps) => {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group select-none">
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <div
          className={`w-4 h-4 rounded border-[1.5px] flex items-center justify-center transition-all duration-200 ${
            checked
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background border-border hover:border-primary/40'
          }`}
        >
          <Check
            strokeWidth={3}
            className={`w-2.5 h-2.5 ${checked ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          />
        </div>
      </div>
      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        Remember me
      </span>
    </label>
  );
};