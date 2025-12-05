'use client';

import dynamic from 'next/dynamic';
import { memo } from 'react';
import { HeroSection } from '@/components/ui/hero-section-dark';
import { LazySection } from '@/components/ui/lazy-components';
import { SectionWrapper } from './shared/SectionWrapper';
import { SectionSkeleton } from './shared/SectionSkeleton';
import { HERO_CONFIG } from './config/landing-config';

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
