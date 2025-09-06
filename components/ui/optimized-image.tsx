"use client";

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  lowQualitySrc?: string;
  loadingColor?: string;
}

/**
 * OptimizedImage component with progressive loading and performance optimizations
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackSrc,
  lowQualitySrc,
  loadingColor = 'rgba(var(--primary-rgb), 0.1)',
  className,
  style,
  ...props
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

  // Determine if the image should be lazy loaded based on viewport position
  const [shouldLoad, setShouldLoad] = useState(false);
  
  useEffect(() => {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' }
      );
      
      const element = document.getElementById(`image-${alt?.replace(/\s+/g, '-').toLowerCase()}`);
      if (element) {
        observer.observe(element);
      }
      
      return () => {
        if (element) {
          observer.unobserve(element);
        }
        observer.disconnect();
      };
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      setShouldLoad(true);
    }
  }, [alt]);

  return (
    <div 
      id={`image-${alt?.replace(/\s+/g, '-').toLowerCase()}`}
      className={`relative overflow-hidden ${className || ''}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: loading ? loadingColor : 'transparent',
        ...style
      }}
    >
      {shouldLoad && (
        <>
          {lowQualitySrc && loading && !error && (
            <Image
              src={lowQualitySrc}
              alt={alt}
              width={width}
              height={height}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}
              style={{ filter: 'blur(10px)' }}
              {...props}
            />
          )}
          
          <Image
            src={error ? (fallbackSrc || src) : src}
            alt={alt}
            width={width}
            height={height}
            className={`w-full h-full object-cover transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError(true);
              if (fallbackSrc) {
                setLoading(true);
              } else {
                setLoading(false);
              }
            }}
            {...props}
          />
        </>
      )}
    </div>
  );
}
