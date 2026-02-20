'use client';

import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';

interface LoginButtonProps {
  loading: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
}

export const LoginButton = ({ loading, isSubmitting, disabled }: LoginButtonProps) => {
  return (
    <div className="pt-1">
      <Button
        type="submit"
        className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
        disabled={loading || disabled}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          <span className="text-sm">
            {loading ? 'Signing in…' : 'Sign in'}
          </span>
        </span>
      </Button>
    </div>
  );
};