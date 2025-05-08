import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withText?: boolean;
  withCaption?: boolean;
  textClassName?: string;
  className?: string;
  animated?: boolean;
}

export function Logo({
  size = 'md',
  withText = false,
  withCaption = false,
  textClassName = '',
  className = '',
  animated = false
}: LogoProps) {
  // Enhanced size mappings with more options and responsive classes
  const sizeMap = {
    xs: {
      container: 'h-6 w-6 sm:h-7 sm:w-7',
      logo: 'h-4 w-4 sm:h-5 sm:w-5',
      text: 'text-sm sm:text-base',
      caption: 'text-[8px] sm:text-[9px]'
    },
    sm: {
      container: 'h-8 w-8 sm:h-9 sm:w-9',
      logo: 'h-5 w-5 sm:h-6 sm:w-6',
      text: 'text-base sm:text-lg',
      caption: 'text-[9px] sm:text-xs'
    },
    md: {
      container: 'h-10 w-10 sm:h-12 sm:w-12',
      logo: 'h-7 w-7 sm:h-8 sm:w-8',
      text: 'text-lg sm:text-xl',
      caption: 'text-xs sm:text-sm'
    },
    lg: {
      container: 'h-14 w-14 sm:h-16 sm:w-16',
      logo: 'h-9 w-9 sm:h-10 sm:w-10',
      text: 'text-xl sm:text-2xl',
      caption: 'text-sm sm:text-base'
    },
    xl: {
      container: 'h-20 w-20 sm:h-24 sm:w-24',
      logo: 'h-12 w-12 sm:h-14 sm:w-14',
      text: 'text-2xl sm:text-3xl',
      caption: 'text-base sm:text-lg'
    },
    '2xl': {
      container: 'h-24 w-24 sm:h-28 sm:w-28',
      logo: 'h-14 w-14 sm:h-16 sm:w-16',
      text: 'text-3xl sm:text-4xl',
      caption: 'text-lg sm:text-xl'
    }
  };

  // Enhanced fallback image dimensions with responsive sizes
  const getImageDimension = (logoSize: string) => {
    const sizes = {
      'h-16 w-16': 64,
      'h-14 w-14': 56,
      'h-12 w-12': 48,
      'h-10 w-10': 40,
      'h-9 w-9': 36,
      'h-8 w-8': 32,
      'h-7 w-7': 28,
      'h-6 w-6': 24,
      'h-5 w-5': 20,
      'h-4 w-4': 16
    };

    // Find the closest matching size
    const sizeKey = Object.keys(sizes).find(key => logoSize.includes(key)) || 'h-7 w-7';
    return sizes[sizeKey as keyof typeof sizes];
  };

  // Animation variants - simplified for better performance
  const containerVariants = {
    initial: { 
      scale: 0.95,
      opacity: 0
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.3,
      }
    },
    hover: {
      scale: 1.03,
      transition: {
        duration: 0.2,
        ease: 'easeInOut'
      }
    }
  };

  const ringVariants = {
    initial: {
      scale: 0.9,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.1,
        duration: 0.3
      }
    },
    hover: {
      scale: 1.05,
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };

  const glowVariants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      opacity: 0.8, // Reduced opacity for better performance
      transition: {
        duration: 0.3
      }
    }
  };

  const textVariants = {
    initial: {
      opacity: 0,
      x: -5 // Reduced animation distance
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.2,
        duration: 0.3
      }
    }
  };

  // Check if window is defined (for SSR) and respect user's motion preferences
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Disable animations if reduced motion is preferred
  const shouldAnimate = animated && !prefersReducedMotion;

  // Base component with responsive container
  const LogoContent = () => (
    <div className={`relative flex items-center justify-center ${sizeMap[size].container} transition-all duration-300`}>
      <Image 
        src="/logo.svg" 
        alt="Budget Buddy Logo" 
        width={getImageDimension(sizeMap[size].logo)} 
        height={getImageDimension(sizeMap[size].logo)} 
        className={`${sizeMap[size].logo} transition-all duration-300`}
        priority={size === 'lg' || size === 'xl' || size === '2xl'} 
        onError={(e) => {
          // Fallback to a colored div if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement('div');
            fallback.className = `${sizeMap[size].logo} bg-primary/80 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300`;
            fallback.innerText = 'BB';
            parent.appendChild(fallback);
          }
        }}
      />
    </div>
  );

  // Render static version if animations are disabled
  if (!shouldAnimate) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <LogoContent />
      </div>
    );
  }

  // Animated version
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className="relative"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
      >
        <LogoContent />
      </motion.div>
    </div>
  );
}

export default Logo; 