'use client';

import React, {
  memo,
  useMemo,
  useCallback,
  Suspense,
  useRef,
  useState,
  useEffect,
  startTransition,
} from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Check if IntersectionObserver is available (handles SSR)
const isIntersectionObserverAvailable =
  typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  onVisible?: () => void;
}

/**
 * LazyComponent - Renders children only when they enter the viewport
 * This dramatically improves scroll performance by deferring off-screen content
 */
export const LazyComponent = memo(function LazyComponent({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '200px 0px',
  onVisible,
}: LazyComponentProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  // Initialize as true if IntersectionObserver is not available
  const [hasLoaded, setHasLoaded] = useState(!isIntersectionObserverAvailable);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Skip if already loaded or no observer support
    if (hasLoaded) return;

    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startTransition(() => {
              setHasLoaded(true);
            });
            onVisible?.();
            observerRef.current?.unobserve(element);
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [threshold, rootMargin, onVisible, hasLoaded]);

  const defaultFallback = useMemo(
    () => (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="fast-skeleton h-32 w-full rounded-lg" />
      </div>
    ),
    []
  );

  return (
    <div
      ref={elementRef}
      className={cn('transform-gpu', className)}
      style={{
        contentVisibility: hasLoaded ? 'visible' : 'auto',
        containIntrinsicSize: hasLoaded ? 'none' : '0 300px',
      }}
    >
      {hasLoaded ? children : fallback || defaultFallback}
    </div>
  );
});

interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  aspectRatio?: string;
  priority?: boolean;
  className?: string;
}

/**
 * LazyImage - Optimized image component with lazy loading
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  fallbackSrc,
  aspectRatio = '16/9',
  className,
  priority = false,
}: LazyImageProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  // Initialize based on priority or lack of IntersectionObserver
  const [shouldLoad, setShouldLoad] = useState(priority || !isIntersectionObserverAvailable);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Skip if already should load
    if (shouldLoad) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startTransition(() => {
              setShouldLoad(true);
            });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1, rootMargin: '300px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [shouldLoad]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  return (
    <div
      ref={elementRef}
      className={cn('relative overflow-hidden bg-muted', className)}
      style={{ aspectRatio }}
    >
      {/* Placeholder skeleton */}
      {!isLoaded && <div className="absolute inset-0 fast-skeleton" />}

      {shouldLoad && !error && src && (
        <Image
          src={src}
          alt={alt}
          fill
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
        />
      )}

      {error && fallbackSrc && <Image src={fallbackSrc} alt={alt} fill className="object-cover" />}
    </div>
  );
});

interface LazySectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  fallback?: React.ReactNode;
  animateIn?: boolean;
}

/**
 * LazySection - Section component optimized for scroll performance
 */
export const LazySection = memo(function LazySection({
  children,
  className,
  id,
  fallback,
  animateIn = true,
}: LazySectionProps) {
  const elementRef = useRef<HTMLElement>(null);
  // Initialize as true if IntersectionObserver is not available
  const [hasLoaded, setHasLoaded] = useState(!isIntersectionObserverAvailable);

  useEffect(() => {
    // Skip if already loaded
    if (hasLoaded) return;

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startTransition(() => {
              setHasLoaded(true);
            });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.05, rootMargin: '100px 0px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasLoaded]);

  const sectionFallback = fallback || (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 mx-auto rounded fast-skeleton" />
        <div className="h-4 w-96 mx-auto rounded fast-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="h-48 rounded-xl fast-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section
      ref={elementRef}
      id={id}
      className={cn('transform-gpu', animateIn && hasLoaded && 'animate-fade-in', className)}
      style={{
        contentVisibility: hasLoaded ? 'visible' : 'auto',
        containIntrinsicSize: hasLoaded ? 'none' : '0 500px',
      }}
    >
      {hasLoaded ? children : sectionFallback}
    </section>
  );
});

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
  overscan?: number;
}

/**
 * VirtualList - Renders only visible items for optimal scroll performance
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  className,
  overscan = 5,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  const { startIndex, visibleItems, totalHeight, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end),
      totalHeight: items.length * itemHeight,
      offsetY: start * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn('overflow-auto will-change-scroll', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {visibleItems.map((item, index) => (
            <div key={keyExtractor(item, startIndex + index)} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to chunk array for batch rendering
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Wrapper for Suspense with default fallback
 */
export function LazyLoadWrapper({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="fast-skeleton h-32 w-full rounded-lg" />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}
