import * as React from 'react';

import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <div
        ref={ref}
        className={cn(
          'border-2 border-foreground bg-card text-card-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] transition-all duration-200 hover:shadow-[8px_8px_0px_hsl(var(--foreground))] hover:-translate-y-1',
          className
        )}
        {...rest}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, ...rest } = props;
    return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...rest} />;
  }
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <h3
        ref={ref}
        className={cn('text-xl sm:text-2xl font-semibold leading-tight tracking-tight', className)}
        {...rest}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>((props, ref) => {
  const { className, ...rest } = props;
  return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...rest} />;
});
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, ...rest } = props;
    return <div ref={ref} className={cn('p-6 pt-0', className)} {...rest} />;
  }
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const { className, ...rest } = props;
    return <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...rest} />;
  }
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
