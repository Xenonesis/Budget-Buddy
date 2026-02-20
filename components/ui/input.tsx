import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full border-2 border-foreground bg-background/50 px-3 py-2 text-sm font-mono shadow-[2px_2px_0px_hsl(var(--foreground))] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-bold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus-visible:shadow-[4px_4px_0px_hsl(var(--foreground))]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border-2 border-foreground bg-background/50 px-3 py-2 text-sm font-mono shadow-[2px_2px_0px_hsl(var(--foreground))] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all focus-visible:shadow-[4px_4px_0px_hsl(var(--foreground))]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
