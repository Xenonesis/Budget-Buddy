"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

export const ForgotPasswordLink = () => {
  return (
    <div className="text-center mt-2">
      <Link
        href="/auth/reset-password"
        className="text-xs font-mono font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background px-2 py-1 border-2 border-transparent hover:border-foreground transition-all inline-flex items-center gap-2 group"
      >
        <KeyRound className="h-3 w-3 stroke-[3]" />
        <span>
          Forgot password?
        </span>
      </Link>
    </div>
  );
};