"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getOptimizedImageConfig, getImageSrc, type ImageConfig } from "@/lib/image-utils";

interface SafeImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fallback?: React.ReactNode;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  unoptimized?: boolean;
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fallback,
  fill = false,
  sizes,
  quality = 75,
  unoptimized,
  ...props
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Get optimized configuration for current environment
  const optimizedConfig = getOptimizedImageConfig({
    src,
    alt,
    width,
    height,
    priority,
    quality,
    sizes,
    // SVG files should be unoptimized
    unoptimized: unoptimized || src.endsWith('.svg'),
  });

  // Get the proper image source
  const imageSrc = getImageSrc(src);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [imageSrc]);

  // Retry logic for failed images
  const handleRetry = () => {
    if (retryCount < 2) {
      setImageError(false);
      setIsLoading(true);
      setRetryCount(prev => prev + 1);
    }
  };

  // Default fallback if none provided
  const defaultFallback = (
    <div 
      className={cn(
        "bg-muted flex items-center justify-center text-muted-foreground border border-border rounded",
        className
      )}
      style={{ width: optimizedConfig.width, height: optimizedConfig.height }}
    >
      <div className="text-center">
        <span className="text-xs block mb-1">Image unavailable</span>
        {retryCount < 2 && (
          <button 
            onClick={handleRetry}
            className="text-xs text-primary hover:underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  if (imageError) {
    return fallback || defaultFallback;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-muted animate-pulse rounded",
            className
          )}
          style={{ width: optimizedConfig.width, height: optimizedConfig.height }}
        />
      )}
      <Image
        src={imageSrc}
        alt={optimizedConfig.alt}
        width={optimizedConfig.width}
        height={optimizedConfig.height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        priority={optimizedConfig.priority}
        fill={fill}
        sizes={optimizedConfig.sizes}
        quality={optimizedConfig.quality}
        unoptimized={optimizedConfig.unoptimized}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}