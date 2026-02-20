"use client";

import Image from "next/image";
import { Logo } from "@/components/ui/logo";

export const AuthLogo = () => (
  <div className="flex items-center gap-4">
    <div className="relative">
      <div className="relative flex items-center justify-center h-16 w-16 bg-[#00E5FF] border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
        <Image 
          src="/logo.svg" 
          alt="Budget Buddy Logo" 
          width={40} 
          height={40} 
          className="h-10 w-10 text-foreground"
          priority={true} 
        />
      </div>
    </div>
    <div className="relative">
      <span
        className="font-display font-black uppercase tracking-tight text-foreground text-2xl sm:text-3xl bg-foreground/5 px-2 py-1 border-4 border-transparent"
      >
        Budget Buddy
      </span>
    </div>
  </div>
);