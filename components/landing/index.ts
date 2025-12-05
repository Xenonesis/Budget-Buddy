/**
 * Central export point for landing page components
 * This makes imports cleaner throughout the application
 */

// Main sections
export { Header } from './header';
export { Footer } from './footer';
export { LandingSections } from './sections';

// Individual section components
export { FeaturesSection } from './features';
export { PricingSection } from './pricing';
export { CTASection } from './cta';
export { AboutSection } from './about';
export { TestimonialsSection } from './testimonials';

// Configuration and data
export * from './config/landing-config';
export * from './config/testimonials-data';

// Utilities
export * from './utils/scroll-utils';

// Shared components
export { SectionWrapper } from './shared/SectionWrapper';
export { SectionSkeleton } from './shared/SectionSkeleton';
