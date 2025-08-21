"use client";

import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Primary gradient orbs */}
      <motion.div 
        className="absolute -top-[15%] -left-[15%] w-[50%] h-[50%] bg-primary/8 rounded-full blur-3xl"
        animate={{ 
          x: [0, 20, 0], 
          y: [0, 25, 0],
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-[15%] -right-[15%] w-[50%] h-[50%] bg-violet-500/8 rounded-full blur-3xl"
        animate={{ 
          x: [0, -20, 0], 
          y: [0, -25, 0],
          scale: [1, 1.1, 1],
          rotate: [360, 180, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Secondary accent orbs */}
      <motion.div 
        className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-indigo-500/6 rounded-full blur-2xl"
        animate={{ 
          x: [0, -15, 0], 
          y: [0, 20, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute bottom-[30%] left-[15%] w-[25%] h-[25%] bg-purple-500/6 rounded-full blur-2xl"
        animate={{ 
          x: [0, 15, 0], 
          y: [0, -15, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Floating particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full blur-sm"
          style={{
            left: `${20 + (i * 15)}%`,
            top: `${30 + (i * 10)}%`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 4 + (i * 0.5),
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.8,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)] opacity-30" />
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(120,119,198,0.5) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
};