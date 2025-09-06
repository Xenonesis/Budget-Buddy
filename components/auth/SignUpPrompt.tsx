"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export const SignUpPrompt = () => {
  return (
    <motion.div 
      className="text-center text-sm bg-muted/30 rounded-lg p-4 border border-muted"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.3 }}
    >
      <p className="text-muted-foreground mb-2">
        Don&apos;t have an account?
      </p>
      <Link
        href="/auth/register"
        className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-2 group"
      >
        <UserPlus className="h-4 w-4 transition-transform group-hover:scale-110" />
        <motion.span 
          whileHover={{ x: 3 }}
          transition={{ duration: 0.2 }}
          className="inline-block"
        >
          Create your account
        </motion.span>
      </Link>
    </motion.div>
  );
};