import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  animated = true
}: LogoProps) {
  // Size mappings
  const sizeMap = {
    sm: {
      container: 'h-8 w-8',
      logo: 'h-5 w-5',
      text: 'text-base',
      caption: 'text-[9px]'
    },
    md: {
      container: 'h-10 w-10',
      logo: 'h-7 w-7',
      text: 'text-lg',
      caption: 'text-xs'
    },
    lg: {
      container: 'h-14 w-14',
      logo: 'h-9 w-9',
      text: 'text-xl',
      caption: 'text-sm'
    },
    xl: {
      container: 'h-20 w-20',
      logo: 'h-12 w-12',
      text: 'text-2xl',
      caption: 'text-base'
    }
  };

  // Animation variants
  const containerVariants = {
    initial: { 
      scale: 0.9,
      opacity: 0
    },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.4,
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  const ringVariants = {
    initial: {
      scale: 0.8,
      opacity: 0
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 0.4
      }
    },
    hover: {
      scale: 1.1,
      opacity: 1,
      transition: {
        duration: 0.3
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
        duration: 0.3
      }
    },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  const textVariants = {
    initial: {
      opacity: 0,
      x: -10
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.3,
        duration: 0.4
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`logo-badge relative flex items-center justify-center ${sizeMap[size].container}`}
        variants={animated ? containerVariants : undefined}
        initial={animated ? "initial" : undefined}
        animate={animated ? "animate" : undefined}
        whileHover={animated ? "hover" : undefined}
      >
        <motion.div 
          className="logo-glow"
          variants={animated ? glowVariants : undefined}
          initial={animated ? "initial" : undefined}
          animate={animated ? "animate" : undefined}
          whileHover={animated ? "hover" : undefined}
        />
        <motion.div 
          className="logo-ring"
          variants={animated ? ringVariants : undefined}
          initial={animated ? "initial" : undefined}
          animate={animated ? "animate" : undefined}
          whileHover={animated ? "hover" : undefined}
        />
        <Image 
          src="/logo.svg" 
          alt="Budget Buddy Logo" 
          width={sizeMap[size].logo === 'h-12 w-12' ? 48 : sizeMap[size].logo === 'h-9 w-9' ? 36 : sizeMap[size].logo === 'h-7 w-7' ? 28 : 20} 
          height={sizeMap[size].logo === 'h-12 w-12' ? 48 : sizeMap[size].logo === 'h-9 w-9' ? 36 : sizeMap[size].logo === 'h-7 w-7' ? 28 : 20} 
          className={`${sizeMap[size].logo} ${animated ? 'logo-pulse' : ''}`}
        />
      </motion.div>

      {withText && (
        <div className="flex flex-col">
          <motion.span 
            className={`brand-text font-bold ${sizeMap[size].text} ${textClassName}`}
            variants={animated ? textVariants : undefined}
            initial={animated ? "initial" : undefined}
            animate={animated ? "animate" : undefined}
          >
            Budget Buddy
          </motion.span>
          
          {withCaption && (
            <motion.span 
              className={`brand-caption ${sizeMap[size].caption}`}
              variants={animated ? { ...textVariants, initial: { ...textVariants.initial, opacity: 0, x: -5 } } : undefined}
              initial={animated ? "initial" : undefined}
              animate={animated ? "animate" : undefined}
            >
              Smart Money Management
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo; 