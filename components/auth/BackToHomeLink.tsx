"use client";

import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export const BackToHomeLink = () => {
  return (
    <div className="absolute -top-16 left-0 z-20">
      <Link 
        href="/" 
        className="text-xs font-mono font-bold uppercase tracking-widest text-foreground bg-paper hover:bg-foreground hover:text-background transition-all flex items-center gap-2 group border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-1 hover:translate-y-1 px-4 py-2"
      >
        <div className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4 stroke-[3]" />
          <Home className="h-4 w-4 stroke-[3]" />
        </div>
        <span>Back to home</span>
      </Link>
    </div>
  );
};