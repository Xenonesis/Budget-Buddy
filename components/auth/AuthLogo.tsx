'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export const AuthLogo = () => (
  <motion.div
    className="flex items-center gap-3"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <div className="relative flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 border border-primary/20">
      <Image
        src="/logo.svg"
        alt="Budget Buddy Logo"
        width={28}
        height={28}
        className="h-7 w-7"
        priority={true}
      />
    </div>
    <span className="font-display font-bold text-foreground text-[1.35rem] tracking-tight">
      Budget Buddy
    </span>
  </motion.div>
);