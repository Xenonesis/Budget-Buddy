"use client";
import { useEffect, useState, ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

export default function ThemeProviderShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    // During SSR/prerender, avoid injecting next-themes context to prevent build errors
    return <>{children}</>;
  }
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}
