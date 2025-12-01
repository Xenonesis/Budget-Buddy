'use client';

import dynamic from 'next/dynamic';
import { memo, useCallback } from 'react';
import { HeroSection } from '@/components/ui/hero-section-dark';
import { LazySection } from '@/components/ui/lazy-components';

// Lazy load below-the-fold sections for faster initial paint
const FeaturesSection = dynamic(
  () => import('@/components/landing/features').then((mod) => mod.FeaturesSection),
  { ssr: true, loading: () => <SectionSkeleton /> }
);

const TestimonialsSection = dynamic(
  () => import('@/components/landing/testimonials').then((mod) => mod.TestimonialsSection),
  { ssr: true, loading: () => <SectionSkeleton /> }
);

const PricingSection = dynamic(
  () => import('@/components/landing/pricing').then((mod) => mod.PricingSection),
  { ssr: true, loading: () => <SectionSkeleton /> }
);

const CTASection = dynamic(() => import('@/components/landing/cta').then((mod) => mod.CTASection), {
  ssr: true,
  loading: () => <SectionSkeleton />,
});

const AboutSection = dynamic(
  () => import('@/components/landing/about').then((mod) => mod.AboutSection),
  { ssr: true, loading: () => <SectionSkeleton /> }
);

// Lightweight section skeleton for loading states - optimized with will-change
const SectionSkeleton = memo(function SectionSkeleton() {
  return (
    <div className="py-16 px-4 will-change-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-8 w-48 mx-auto rounded fast-skeleton" />
        <div className="h-4 w-96 mx-auto rounded fast-skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl fast-skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
});

// Loading placeholder for animations - memoized
const BubblePlaceholder = memo(function BubblePlaceholder() {
  return <div className="absolute inset-0 bg-primary/5 opacity-30 rounded-full" />;
});

// Optimized dynamic imports for animations - load only when visible
const FeatureBubbles = dynamic(
  () => import('@/app/page-animations').then((mod) => mod.FeatureBubbles),
  { ssr: false, loading: () => <BubblePlaceholder /> }
);

const TestimonialBubbles = dynamic(
  () => import('@/app/page-animations').then((mod) => mod.TestimonialBubbles),
  { ssr: false, loading: () => <BubblePlaceholder /> }
);

const CTABubbles = dynamic(() => import('@/app/page-animations').then((mod) => mod.CTABubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />,
});

// Hero section configuration
const HERO_CONFIG = {
  title: 'Welcome to Budget Buddy',
  subtitle: {
    regular: 'Take control of your finances with ',
    gradient: 'our intuitive budgeting tool',
  },
  description:
    'Track your expenses, set budgets, and achieve your financial goals with our easy-to-use platform designed for everyone.',
  ctaText: 'Get Started',
  ctaHref: '/auth/register',
  bottomImage: {
    light: '/hero-banner.png',
    dark: '/hero-banner.png',
  },
  gridOptions: {
    angle: 65,
    opacity: 0.4,
    cellSize: 50,
    lightLineColor: '#4a4a4a',
    darkLineColor: '#2a2a2a',
  },
} as const;

// Reusable section wrapper component with optimized rendering
const SectionWrapper = memo(function SectionWrapper({
  children,
  className = '',
  AnimationComponent,
  animationClassName = '',
  animationOpacity = 1,
}: {
  children: React.ReactNode;
  className?: string;
  AnimationComponent?: React.ComponentType;
  animationClassName?: string;
  animationOpacity?: number;
}) {
  return (
    <div className={`relative transform-gpu ${className}`}>
      {AnimationComponent && (
        <div
          className={`absolute inset-0 overflow-hidden pointer-events-none hidden sm:block ${animationClassName}`}
          style={{ opacity: animationOpacity, willChange: 'opacity' }}
        >
          <AnimationComponent />
        </div>
      )}
      {children}
    </div>
  );
});

// Individual section components with preserved functionality - memoized
export const HeroSectionWrapper = memo(function HeroSectionWrapper() {
  return (
    <SectionWrapper>
      <HeroSection {...HERO_CONFIG} />
    </SectionWrapper>
  );
});

export const FeaturesSectionWrapper = memo(function FeaturesSectionWrapper() {
  return (
    <LazySection id="features" animateIn>
      <SectionWrapper AnimationComponent={FeatureBubbles}>
        <FeaturesSection />
      </SectionWrapper>
    </LazySection>
  );
});

export const TestimonialsSectionWrapper = memo(function TestimonialsSectionWrapper() {
  return (
    <LazySection id="testimonials" animateIn>
      <SectionWrapper AnimationComponent={TestimonialBubbles} animationOpacity={0.6}>
        <TestimonialsSection />
      </SectionWrapper>
    </LazySection>
  );
});

export const PricingSectionWrapper = memo(function PricingSectionWrapper() {
  return (
    <LazySection id="pricing" animateIn>
      <SectionWrapper>
        <PricingSection />
      </SectionWrapper>
    </LazySection>
  );
});

export const CTASectionWrapper = memo(function CTASectionWrapper() {
  return (
    <LazySection id="cta" animateIn>
      <SectionWrapper AnimationComponent={CTABubbles}>
        <CTASection />
      </SectionWrapper>
    </LazySection>
  );
});

export const AboutSectionWrapper = memo(function AboutSectionWrapper() {
  return (
    <LazySection id="about" animateIn>
      <SectionWrapper>
        <AboutSection />
      </SectionWrapper>
    </LazySection>
  );
});

// Centralized list of landing section components to keep ordering in one place
export const LANDING_SECTION_COMPONENTS = [
  { Component: HeroSectionWrapper, key: 'hero' },
  { Component: FeaturesSectionWrapper, key: 'features' },
  { Component: TestimonialsSectionWrapper, key: 'testimonials' },
  { Component: PricingSectionWrapper, key: 'pricing' },
  { Component: CTASectionWrapper, key: 'cta' },
  { Component: AboutSectionWrapper, key: 'about' },
] as const;

// Render all landing sections with optimized scroll performance
export function LandingSections() {
  return (
    <>
      {LANDING_SECTION_COMPONENTS.map(({ Component, key }) => (
        <Component key={key} />
      ))}
    </>
  );
}
