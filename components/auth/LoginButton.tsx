"use client";

import { Button } from "@/components/ui/button";
import { LogIn, Loader2 } from "lucide-react";

interface LoginButtonProps {
  loading: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const LoginButton = ({ loading, isSubmitting, disabled }: LoginButtonProps) => {
  return (
    <div className="relative group w-full pt-4">
      <Button 
        type="submit" 
        className="w-full h-14 border-4 border-foreground bg-[#DFFF00] text-foreground hover:bg-foreground hover:text-[#DFFF00] shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-1.5 hover:translate-y-1.5 font-mono font-black uppercase tracking-widest transition-all rounded-none"
        disabled={loading || disabled}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin stroke-[3]" />
          ) : (
            <LogIn className="h-6 w-6 stroke-[3]" />
          )}
          <span className="text-base font-black">
            {loading ? "Signing in..." : "Sign in"}
          </span>
        </span>
      </Button>
    </div>
  );
};