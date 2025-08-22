"use client";

import { motion } from "framer-motion";

export const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Enhanced primary gradient orbs with more sophisticated animations */}
      <motion.div 
        className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] bg-gradient-to-br from-primary/12 via-primary/8 to-transparent rounded-full blur-3xl"
        animate={{ 
          x: [0, 30, -10, 0], 
          y: [0, 20, 35, 0],
          scale: [1, 1.2, 0.9, 1],
          rotate: [0, 120, 240, 360]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] bg-gradient-to-tl from-violet-500/12 via-purple-500/8 to-transparent rounded-full blur-3xl"
        animate={{ 
          x: [0, -25, 15, 0], 
          y: [0, -30, -10, 0],
          scale: [1, 0.8, 1.3, 1],
          rotate: [360, 240, 120, 0]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      />

      {/* Enhanced secondary accent orbs */}
      <motion.div 
        className="absolute top-[15%] right-[5%] w-[35%] h-[35%] bg-gradient-to-bl from-indigo-500/8 via-blue-500/6 to-transparent rounded-full blur-2xl"
        animate={{ 
          x: [0, -20, 10, 0], 
          y: [0, 25, -5, 0],
          scale: [1, 0.7, 1.1, 1],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute bottom-[25%] left-[10%] w-[30%] h-[30%] bg-gradient-to-tr from-purple-500/8 via-pink-500/6 to-transparent rounded-full blur-2xl"
        animate={{ 
          x: [0, 20, -10, 0], 
          y: [0, -20, 15, 0],
          scale: [1, 1.15, 0.85, 1],
          rotate: [0, -90, -180, -270, -360]
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut"
        }}
      />

      {/* Additional ambient orbs */}
      <motion.div 
        className="absolute top-[40%] left-[5%] w-[20%] h-[20%] bg-gradient-to-r from-emerald-500/6 to-transparent rounded-full blur-xl"
        animate={{ 
          x: [0, 15, 0], 
          y: [0, -10, 0],
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute top-[60%] right-[15%] w-[18%] h-[18%] bg-gradient-to-l from-amber-500/6 to-transparent rounded-full blur-xl"
        animate={{ 
          x: [0, -12, 0], 
          y: [0, 8, 0],
          scale: [1, 0.8, 1],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{ 
          duration: 14, 
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />

      {/* Enhanced floating particles with varied sizes and behaviors */}
      {Array.from({ length: 12 }).map((_, i) => {
        const size = i % 3 === 0 ? 'w-3 h-3' : i % 2 === 0 ? 'w-2 h-2' : 'w-1.5 h-1.5';
        const opacity = i % 4 === 0 ? 'bg-primary/25' : i % 3 === 0 ? 'bg-violet-500/20' : 'bg-indigo-500/15';
        
        return (
          <motion.div
            key={i}
            className={`absolute ${size} ${opacity} rounded-full blur-sm`}
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i * 6)}%`,
            }}
            animate={{
              y: [0, -30, 10, 0],
              x: [0, 15, -5, 0],
              opacity: [0.2, 0.9, 0.4, 0.2],
              scale: [1, 1.4, 0.8, 1]
            }}
            transition={{
              duration: 6 + (i * 0.7),
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        );
      })}

      {/* Enhanced grid pattern overlay with animation */}
      <motion.div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.12),transparent_60%)] opacity-40"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(120,119,198,0.6) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
        animate={{
          backgroundPosition: ['0px 0px', '24px 24px', '0px 0px']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Subtle mesh gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent via-transparent to-violet-500/5 opacity-60" />
      
      {/* Dynamic light rays */}
      <motion.div
        className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-primary/20 via-transparent to-transparent"
        animate={{
          opacity: [0, 0.6, 0],
          scaleY: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent"
        animate={{
          opacity: [0, 0.4, 0],
          scaleX: [0.3, 1, 0.3]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
};