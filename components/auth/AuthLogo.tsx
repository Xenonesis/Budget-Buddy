"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export const AuthLogo = () => (
  <div className="flex items-center gap-2">
    <motion.div
      className="relative"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 transition-all duration-300">
        <Image 
          src="/logo.svg" 
          alt="Budget Buddy Logo" 
          width={56} 
          height={56} 
          className="h-14 w-14 sm:h-16 sm:w-16 transition-all duration-300"
          priority={true} 
        />
      </div>
      <motion.div 
        className="absolute inset-0 rounded-full bg-primary/10 blur-sm -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
    </motion.div>
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <motion.span
        className="font-bold tracking-tight bg-gradient-to-r from-primary via-violet-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] text-2xl sm:text-3xl"
        whileHover={{ 
          textShadow: "0 0 8px rgba(124, 58, 237, 0.5)",
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        Budget Buddy
      </motion.span>
      <motion.div 
        className="absolute -inset-1 bg-primary/5 blur-sm rounded-lg -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      ></motion.div>
    </motion.div>
  </div>
);