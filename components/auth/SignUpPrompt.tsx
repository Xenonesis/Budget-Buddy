'use client';

import Link from 'next/link';

export const SignUpPrompt = () => {
  return (
    <div className="text-center text-sm text-muted-foreground">
      Don&apos;t have an account?{' '}
      <Link
        href="/auth/register"
        className="font-medium text-primary hover:text-primary/80 transition-colors"
      >
        Create one
      </Link>
    </div>
  );
};