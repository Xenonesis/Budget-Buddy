'use client';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export default function ThemeProviderShell({ children }: { children: ReactNode }) {
  // Always render ThemeProvider - next-themes handles SSR internally
  return <ThemeProvider>{children}</ThemeProvider>;
}
