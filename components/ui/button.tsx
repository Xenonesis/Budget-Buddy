'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium rounded-lg ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-primary/90 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] active:scale-[0.98]',
        destructive: 'bg-destructive text-destructive-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-destructive/90 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] active:scale-[0.98]',
        outline:
          'border border-border bg-background hover:bg-muted/50 hover:text-foreground active:scale-[0.98]',
        secondary: 'bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-secondary/80 active:scale-[0.98]',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        success:
          'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:opacity-90 active:scale-[0.98]',
        warning:
          'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:opacity-90 active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-sm',
        lg: 'h-11 px-8 text-base',
        xl: 'h-12 px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      isTouchDevice: {
        true: 'touch-manipulation tap-highlight-transparent min-h-[44px]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      isTouchDevice: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isTouchDevice, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // Auto-detect touch device if not explicitly provided
    const [isTouch, setIsTouch] = React.useState(false);

    React.useEffect(() => {
      const isTouchDevice =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;

      setIsTouch(isTouchDevice);
    }, []);

    const actualIsTouchDevice = isTouchDevice !== undefined ? isTouchDevice : isTouch;

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant,
            size,
            isTouchDevice: actualIsTouchDevice,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
