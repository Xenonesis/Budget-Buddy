"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";

export const SignUpPrompt = () => {
  return (
    <div 
      className="text-center text-sm bg-paper p-4 border-4 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] mt-8"
    >
      <p className="text-foreground font-mono font-bold uppercase tracking-widest mb-4">
        Don&apos;t have an account?
      </p>
      <Link
        href="/auth/register"
        className="text-background bg-foreground hover:bg-[#00E5FF] hover:text-foreground border-4 border-transparent hover:border-foreground font-mono font-bold uppercase tracking-widest px-4 py-2 transition-colors inline-flex items-center gap-2 group shadow-[2px_2px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-x-0.5 hover:translate-y-0.5"
      >
        <UserPlus className="h-4 w-4 stroke-[3]" />
        <span className="inline-block mt-0.5">
          Create account
        </span>
      </Link>
    </div>
  );
};