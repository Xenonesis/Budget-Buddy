'use client';
import React, {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import Image from 'next/image';

interface Testimonial {
  id: number;
  quote: string;
  name: string;
  username: string;
  avatar: string;
}

const getVisibleCount = (width: number): number => {
  if (width >= 1280) return 3;
  if (width >= 768) return 2;
  return 1;
};

// Custom hook for window width using useSyncExternalStore
function useWindowWidth() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth,
    () => 1024 // Server-side default
  );
}

// Custom hook for mounted state
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
  title?: string;
  subtitle?: string;
  className?: string;
}

// Memoized testimonial card for better scroll performance
const TestimonialCard = memo(function TestimonialCard({
  testimonial,
  visibleCount,
  windowWidth,
}: {
  testimonial: Testimonial;
  visibleCount: number;
  windowWidth: number;
}) {
  return (
    <motion.div
      className={`flex-shrink-0 w-full ${
        visibleCount === 3 ? 'md:w-1/3' : visibleCount === 2 ? 'md:w-1/2' : 'w-full'
      } p-2 transform-gpu`}
      initial={{ opacity: 0.5, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      style={{ cursor: 'grab', willChange: 'transform' }}
    >
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 h-full bg-background border border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="absolute -top-4 -left-4 opacity-10">
          <Quote size={windowWidth < 640 ? 40 : 60} className="text-primary" />
        </div>

        <div className="relative z-10 h-full flex flex-col">
          <p className="text-sm sm:text-base text-foreground font-medium mb-4 sm:mb-6 leading-relaxed">
            &ldquo;{testimonial.quote}&rdquo;
          </p>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-border">
            <div className="flex items-center">
              <div className="relative flex-shrink-0">
                <Image
                  width={48}
                  height={48}
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-background shadow-sm"
                  loading="lazy"
                />
              </div>
              <div className="ml-3">
                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {testimonial.name}
                </h4>
                <p className="text-muted-foreground text-xs sm:text-sm">{testimonial.username}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

const TestimonialSlider: React.FC<TestimonialSliderProps> = memo(function TestimonialSlider({
  testimonials,
  title = 'Testimonials',
  subtitle = 'What our users say',
  className = '',
}) {
  const [rawCurrentIndex, setCurrentIndex] = useState(0);
  // Use useSyncExternalStore for window width - avoids hydration mismatch
  const windowWidth = useWindowWidth();
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  // Use useSyncExternalStore for mounted state
  const isMounted = useIsMounted();
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute visible count and max index
  const visibleCount = useMemo(() => getVisibleCount(windowWidth), [windowWidth]);
  const maxIndex = useMemo(
    () => testimonials.length - visibleCount,
    [testimonials.length, visibleCount]
  );

  // Clamp current index to valid range - this avoids needing setState in effect
  const currentIndex = useMemo(() => {
    return Math.min(Math.max(0, rawCurrentIndex), Math.max(0, maxIndex));
  }, [rawCurrentIndex, maxIndex]);

  // Memoized auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || !isMounted) return;

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        const visibleCount = getVisibleCount(windowWidth);
        const maxIndex = testimonials.length - visibleCount;

        setCurrentIndex((prev) => {
          if (prev >= maxIndex) {
            setDirection(-1);
            return prev - 1;
          } else if (prev <= 0) {
            setDirection(1);
            return prev + 1;
          } else {
            return prev + direction;
          }
        });
      }, 4000);
    };

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, windowWidth, direction, testimonials.length, isMounted]);

  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      setDirection(1);
      setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 8000);
    }
  }, [canGoNext, maxIndex]);

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      setDirection(-1);
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 8000);
    }
  }, [canGoPrev]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  }, []);

  // Memoized navigation dots
  const navigationDots = useMemo(() => {
    return Array.from({ length: testimonials.length - visibleCount + 1 }, (_, index) => (
      <button
        key={index}
        onClick={() => goToSlide(index)}
        className="relative mx-1 focus:outline-none p-1"
        aria-label={`Go to testimonial ${index + 1}`}
      >
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            index === currentIndex
              ? 'bg-primary'
              : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
          }`}
        />
      </button>
    ));
  }, [testimonials.length, visibleCount, currentIndex, goToSlide]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div
        className={`px-4 py-8 sm:py-16 bg-gradient-to-b from-background to-muted/20 overflow-hidden ${className}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gradient-primary">
              {title}
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
          <div className="relative">
            <div className="flex justify-center">
              <div className="w-full md:w-1/2 p-2">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 h-full bg-background border border-border shadow-lg">
                  <div className="h-32 fast-skeleton rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`px-4 py-8 sm:py-16 bg-gradient-to-b from-background to-muted/20 overflow-hidden transform-gpu ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mt-3 sm:mt-4 px-4">
            {subtitle}
          </h3>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-primary to-primary/70 mx-auto mt-4 sm:mt-6"></div>
        </motion.div>

        <div className="relative" ref={containerRef}>
          <div className="flex justify-center sm:justify-end sm:absolute sm:-top-16 right-0 space-x-2 mb-4 sm:mb-0">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              className={`p-2 rounded-full transition-all duration-200 ${
                canGoPrev
                  ? 'bg-background shadow-md hover:bg-muted text-primary hover:scale-105'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className={`p-2 rounded-full transition-all duration-200 ${
                canGoNext
                  ? 'bg-background shadow-md hover:bg-muted text-primary hover:scale-105'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
              aria-label="Next testimonial"
            >
              <ChevronRight size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="overflow-hidden relative px-2 sm:px-0">
            <motion.div
              className="flex transform-gpu"
              animate={{ x: `-${currentIndex * (100 / visibleCount)}%` }}
              transition={{
                type: 'spring',
                stiffness: 70,
                damping: 20,
              }}
              style={{ willChange: 'transform' }}
            >
              {testimonials.map((testimonial) => (
                <TestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  visibleCount={visibleCount}
                  windowWidth={windowWidth}
                />
              ))}
            </motion.div>
          </div>

          <div className="flex justify-center mt-6 sm:mt-8">{navigationDots}</div>
        </div>
      </div>
    </div>
  );
});

export default TestimonialSlider;
