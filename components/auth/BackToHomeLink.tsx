'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const BackToHomeLink = () => {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to home</span>
      </Link>
    </div>
  );
};
