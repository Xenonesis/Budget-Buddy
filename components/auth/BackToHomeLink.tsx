"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Home } from "lucide-react";

export const BackToHomeLink = () => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute -top-12 left-0 z-20"
    >
      <Link 
        href="/" 
        className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200 flex items-center gap-2 group bg-background/80 backdrop-blur-md rounded-full px-4 py-2.5 border border-muted/50 hover:border-primary/50 shadow-sm hover:shadow-md"
      >
        <motion.div
          className="flex items-center gap-1"
          whileHover={{ x: -2 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <Home className="h-4 w-4" />
        </motion.div>
        <span className="font-medium">Back to home</span>
      </Link>
    </motion.div>
  );
};