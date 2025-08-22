/**
 * Image optimization utilities for cross-platform deployment
 * Handles Netlify, Vercel, and development environments
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  unoptimized?: boolean;
}

/**
 * Detect the current deployment environment
 */
export function getDeploymentEnvironment() {
  if (typeof window === 'undefined') {
    // Server-side detection
    return {
      isNetlify: process.env.NETLIFY === 'true',
      isVercel: process.env.VERCEL === 'true',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  }

  // Client-side detection
  const hostname = window.location.hostname;
  return {
    isNetlify: hostname.includes('netlify.app') || process.env.NETLIFY === 'true',
    isVercel: hostname.includes('vercel.app') || process.env.VERCEL === 'true',
    isDevelopment: hostname.includes('localhost') || hostname.includes('127.0.0.1'),
    isProduction: !hostname.includes('localhost') && !hostname.includes('127.0.0.1'),
  };
}

/**
 * Get optimized image configuration based on environment
 */
export function getOptimizedImageConfig(config: ImageConfig): ImageConfig {
  const env = getDeploymentEnvironment();
  
  // Base configuration
  const optimizedConfig: ImageConfig = {
    ...config,
    quality: config.quality ?? 75,
  };

  // Environment-specific optimizations
  if (env.isDevelopment) {
    // Development: Disable optimization for faster builds
    optimizedConfig.unoptimized = true;
    optimizedConfig.quality = 75;
  } else if (env.isNetlify) {
    // Netlify: Use static export, disable optimization
    optimizedConfig.unoptimized = true;
    optimizedConfig.quality = 85;
  } else if (env.isVercel) {
    // Vercel: Use full optimization
    optimizedConfig.unoptimized = false;
    optimizedConfig.quality = config.quality ?? 80;
  } else {
    // Production fallback
    optimizedConfig.unoptimized = false;
    optimizedConfig.quality = config.quality ?? 80;
  }

  // Generate responsive sizes if not provided
  if (!optimizedConfig.sizes) {
    if (config.width) {
      optimizedConfig.sizes = `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${config.width}px`;
    } else {
      optimizedConfig.sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    }
  }

  return optimizedConfig;
}

/**
 * Get image source with fallback handling
 */
export function getImageSrc(src: string): string {
  // Handle relative paths
  if (src.startsWith('/')) {
    const env = getDeploymentEnvironment();
    
    // For static exports (Netlify), ensure proper path
    if (env.isNetlify && typeof window !== 'undefined') {
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
      return `${basePath}${src}`;
    }
  }
  
  return src;
}

/**
 * Common image sizes for responsive images
 */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 300, height: 200 },
  medium: { width: 600, height: 400 },
  large: { width: 1200, height: 800 },
  hero: { width: 1920, height: 1080 },
  logo: { width: 200, height: 200 },
} as const;

/**
 * Generate srcSet for responsive images
 */
export function generateSrcSet(src: string, sizes: number[]): string {
  return sizes
    .map(size => `${src}?w=${size} ${size}w`)
    .join(', ');
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, priority: boolean = false): void {
  if (typeof window === 'undefined' || !priority) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getImageSrc(src);
  document.head.appendChild(link);
}

/**
 * Check if image exists
 */
export function checkImageExists(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = getImageSrc(src);
  });
}