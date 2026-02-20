"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";

export const ForgotPasswordLink = () => {
  return (
    <div className="text-center mt-2">
      <Link
        href="/auth/reset-password"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group hover:underline decoration-foreground/30 underline-offset-4"
      >
        <KeyRound className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
        <span>
          Forgot password?
        </span>
      </Link>
    </div>
  );
};