import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-none bg-foreground/5 fast-skeleton border-2 border-foreground border-dashed', className)} {...props} />;
}

export { Skeleton };
