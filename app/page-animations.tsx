"use client";

import { motion } from "framer-motion";
import { useId, useEffect, useState } from "react";

// Reduce the number of bubbles for better performance
const BUBBLE_POSITIONS = [
  { width: 135, height: 73, top: "30%", left: "15%" },
  { width: 220, height: 162, top: "79%", left: "28%" },
  { width: 165, height: 154, top: "14%", left: "42%" },
];

const FEATURE_BUBBLES = [
  { width: 325, height: 52, top: "53%", left: "12%", blur: "24px", radius: "24%" },
  { width: 227, height: 172, top: "37%", left: "0%", blur: "29px", radius: "47%" },
  { width: 285, height: 290, top: "21%", left: "86%", blur: "31px", radius: "16%" },
];

const TESTIMONIAL_BUBBLES = [
  { width: 253, height: 268, top: "35%", left: "64%", blur: "34px" },
  { width: 368, height: 273, top: "83%", left: "26%", blur: "39px" },
  { width: 363, height: 396, top: "10%", left: "70%", blur: "13px" },
];

// Reduce CTA bubbles for better performance
const CTA_BUBBLES = [
  { width: 270, height: 144, top: "12%", left: "71%", blur: "27px" },
  { width: 231, height: 342, top: "81%", left: "69%", blur: "14px" },
  { width: 308, height: 256, top: "74%", left: "23%", blur: "18px" },
];

// Custom hook to detect if reduced motion is preferred
function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', onChange);

    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);

  return prefersReducedMotion;
}

// Optimized bubble component that respects reduced motion preferences
function OptimizedBubble({
  bubble,
  index,
  id,
  type,
  prefersReducedMotion
}: {
  bubble: any;
  index: number;
  id: string;
  type: 'hero' | 'feature' | 'testimonial' | 'cta';
  prefersReducedMotion: boolean;
}) {
  // Define animation properties based on bubble type
  const getAnimationProps = () => {
    if (prefersReducedMotion) {
      return {
        animate: {}, // No animation if reduced motion is preferred
        transition: {}
      };
    }

    switch (type) {
      case 'hero':
        return {
          animate: {
            x: [0, 5, 0, -5, 0],
            y: [0, -5, 0, 5, 0],
          },
          transition: {
            duration: 30,
            repeat: Infinity,
            repeatType: "loop" as const,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            delay: index * 0.3,
          }
        };
      case 'feature':
        return {
          animate: {
            x: [0, 8, 0, -8, 0],
            y: [0, -8, 0, 8, 0],
          },
          transition: {
            duration: 35,
            repeat: Infinity,
            repeatType: "loop" as const,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            delay: index * 0.4,
          }
        };
      case 'testimonial':
        return {
          animate: {
            x: [0, 10, 0, -10, 0],
            y: [0, -10, 0, 10, 0],
          },
          transition: {
            duration: 40,
            repeat: Infinity,
            repeatType: "loop" as const,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            delay: index * 0.5,
          }
        };
      case 'cta':
        return {
          animate: {
            x: [0, 8, 0, -8, 0],
            y: [0, -8, 0, 8, 0],
          },
          transition: {
            duration: 30,
            repeat: Infinity,
            repeatType: "loop" as const,
            times: [0, 0.25, 0.5, 0.75, 1],
            ease: "easeInOut",
            delay: index * 0.3,
          }
        };
      default:
        return {
          animate: {},
          transition: {}
        };
    }
  };

  const { animate, transition } = getAnimationProps();

  // Common styles for all bubbles
  const bubbleStyle = {
    width: bubble.width,
    height: bubble.height,
    top: bubble.top,
    left: bubble.left,
  };

  // Inner div styles based on type
  const getInnerDivProps = () => {
    const baseStyle = {
      width: `${bubble.width}px`,
      height: `${bubble.height}px`,
      top: bubble.top,
      left: bubble.left,
    };

    switch (type) {
      case 'hero':
        return {
          className: "absolute rounded-full bg-primary/10",
          style: baseStyle
        };
      case 'feature':
        return {
          className: "absolute rounded-full bg-primary/5",
          style: {
            ...baseStyle,
            borderRadius: bubble.radius,
            filter: `blur(${bubble.blur})`,
          }
        };
      case 'testimonial':
      case 'cta':
        return {
          className: "absolute bg-white/5 rounded-full",
          style: {
            ...baseStyle,
            transform: "translate(-50%, -50%)",
            filter: `blur(${bubble.blur})`,
          }
        };
      default:
        return {
          className: "absolute rounded-full bg-primary/10",
          style: baseStyle
        };
    }
  };

  const innerDivProps = getInnerDivProps();

  return (
    <motion.div
      key={`${id}-${type}-bubble-${index}`}
      className={`absolute rounded-full ${type === 'testimonial' || type === 'cta' ? 'blur-bubble' : ''}`}
      animate={animate}
      transition={transition}
      style={bubbleStyle}
    >
      <div
        className={innerDivProps.className}
        style={innerDivProps.style}
      />
    </motion.div>
  );
}

export function HeroBubbles() {
  const id = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {BUBBLE_POSITIONS.map((bubble, index) => (
        <OptimizedBubble
          key={index}
          bubble={bubble}
          index={index}
          id={id}
          type="hero"
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </>
  );
}

export function FeatureBubbles() {
  const id = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {FEATURE_BUBBLES.map((bubble, index) => (
        <OptimizedBubble
          key={index}
          bubble={bubble}
          index={index}
          id={id}
          type="feature"
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </>
  );
}

export function TestimonialBubbles() {
  const id = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {TESTIMONIAL_BUBBLES.map((bubble, index) => (
        <OptimizedBubble
          key={index}
          bubble={bubble}
          index={index}
          id={id}
          type="testimonial"
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </>
  );
}

export function CTABubbles() {
  const id = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      {CTA_BUBBLES.map((bubble, index) => (
        <OptimizedBubble
          key={index}
          bubble={bubble}
          index={index}
          id={id}
          type="cta"
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </>
  );
}