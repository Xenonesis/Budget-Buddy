"use client";

import React from "react";
import { motion } from "framer-motion";

// Safe wrapper for motion.div that handles React 19 compatibility issues
interface SafeMotionDivProps {
  children?: React.ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  transition?: any;
  whileHover?: any;
  whileInView?: any;
  viewport?: any;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
}

export function SafeMotionDiv({ 
  children, 
  fallback,
  className,
  initial,
  animate,
  transition,
  whileHover,
  whileInView,
  viewport,
  style,
  ...restProps
}: SafeMotionDivProps) {
  try {
    // Check if motion is properly initialized and available
    if (typeof window === 'undefined' || typeof motion === 'undefined' || !motion.div) {
      return <div className={className} style={style}>{children}</div>;
    }

    // Create a safe transition object
    const safeTransition = transition ? {
      ...transition,
      repeat: typeof transition.repeat === 'number' || transition.repeat === Infinity ? transition.repeat : undefined,
      repeatType: transition.repeatType || undefined
    } : undefined;

    return (
      <motion.div 
        className={className}
        style={style}
        initial={initial}
        animate={animate}
        transition={safeTransition}
        whileHover={whileHover}
        whileInView={whileInView}
        viewport={viewport}
        {...restProps}
      >
        {children}
      </motion.div>
    );
  } catch (error) {
    console.error('SafeMotionDiv error:', error);
    return fallback || <div className={className} style={style}>{children}</div>;
  }
}