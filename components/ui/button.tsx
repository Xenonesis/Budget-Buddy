'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_hsl(var(--foreground))]',
        destructive: 'bg-destructive text-destructive-foreground border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_hsl(var(--foreground))]',
        outline:
          'border-2 border-foreground bg-background shadow-[2px_2px_0px_hsl(var(--foreground))] hover:bg-foreground hover:text-background hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_hsl(var(--foreground))] active:translate-y-0.5 active:shadow-[0px_0px_0px_hsl(var(--foreground))]',
        secondary: 'bg-secondary text-secondary-foreground border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_hsl(var(--foreground))]',
        ghost: 'hover:bg-accent hover:text-accent-foreground border-2 border-transparent hover:border-foreground',
        link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80',
        success:
          'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))] border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_hsl(var(--foreground))]',
        warning:
          'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))] border-2 border-foreground shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--foreground))] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0px_0px_0px_hsl(var(--foreground))]',
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
