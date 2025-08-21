"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";

export const ForgotPasswordLink = () => {
  return (
    <div className="text-right">
      <Link
        href="/auth/reset-password"
        className="text-xs text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline inline-flex items-center gap-1 group"
      >
        <KeyRound className="h-3 w-3 transition-transform group-hover:rotate-12" />
        <motion.span 
          whileHover={{ x: 2 }}
          transition={{ duration: 0.2 }}
        >
          Forgot password?
        </motion.span>
      </Link>
    </div>
  );
};