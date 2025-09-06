"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { OptimizedImage } from './optimized-image';

interface DashboardPreviewProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

/**
 * Performance-optimized dashboard preview component
 */
export function DashboardPreview({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false
}: DashboardPreviewProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);
    
    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  return (
    <div className={`relative rounded-xl overflow-hidden border shadow-2xl ${className}`}>
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="absolute -inset-1 bg-gradient-animated opacity-30 blur-sm rounded-2xl"
            animate={{
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 opacity-0"
            animate={{
              opacity: [0, 0.3, 0],
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 6,
              repeatDelay: 4,
              ease: "easeInOut"
            }}
          />
        </>
      )}
      
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto"
        loading={priority ? "eager" : "lazy"}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        quality={85}
        lowQualitySrc="/dashboard-preview-low.png"
        fallbackSrc="/dashboard-preview-fallback.png"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent pointer-events-none" />
    </div>
  );
}
