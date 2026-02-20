import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg bg-muted/60 fast-skeleton', className)} {...props} />;
}

export { Skeleton };
