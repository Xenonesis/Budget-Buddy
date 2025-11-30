import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md bg-muted fast-skeleton', className)} {...props} />;
}

export { Skeleton };
