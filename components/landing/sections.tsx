"use client";

import dynamic from 'next/dynamic';
import { HeroSection } from "@/components/ui/hero-section-dark";
import { FeaturesSection } from "@/components/landing/features";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing";
import { CTASection } from "@/components/landing/cta";
import { AboutSection } from "@/components/landing/about";

// Loading placeholder for animations
const BubblePlaceholder = () => (
  <div className="absolute inset-0 bg-primary/5 opacity-30 rounded-full" />
);

// Optimized dynamic imports for animations
const FeatureBubbles = dynamic(
  () => import('@/app/page-animations').then(mod => mod.FeatureBubbles),
  { ssr: false, loading: () => <BubblePlaceholder /> }
);

const TestimonialBubbles = dynamic(
  () => import('@/app/page-animations').then(mod => mod.TestimonialBubbles),
  { ssr: false, loading: () => <BubblePlaceholder /> }
);

const CTABubbles = dynamic(
  () => import('@/app/page-animations').then(mod => mod.CTABubbles),
  { ssr: false, loading: () => <BubblePlaceholder /> }
);

// Hero section configuration
const HERO_CONFIG = {
  title: "Welcome to Budget Buddy",
  subtitle: {
    regular: "Take control of your finances with ",
    gradient: "our intuitive budgeting tool",
  },
  description: "Track your expenses, set budgets, and achieve your financial goals with our easy-to-use platform designed for everyone.",
  ctaText: "Get Started",
  ctaHref: "/auth/register",
  bottomImage: {
    light: "/hero-banner.png",
    dark: "/hero-banner.png",
  },
  gridOptions: {
    angle: 65,
    opacity: 0.4,
    cellSize: 50,
    lightLineColor: "#4a4a4a",
    darkLineColor: "#2a2a2a",
  },
} as const;

// Reusable section wrapper component
const SectionWrapper = ({ 
  children, 
  className = "",
  AnimationComponent,
  animationClassName = "",
  animationOpacity = 1
}: {
  children: React.ReactNode;
  className?: string;
  AnimationComponent?: React.ComponentType;
  animationClassName?: string;
  animationOpacity?: number;
}) => (
  <div className={`relative ${className}`}>
    {AnimationComponent && (
      <div 
        className={`absolute inset-0 overflow-hidden pointer-events-none hidden sm:block ${animationClassName}`}
        style={{ opacity: animationOpacity }}
      >
        <AnimationComponent />
      </div>
    )}
    {children}
  </div>
);

// Individual section components with preserved functionality
export const HeroSectionWrapper = () => (
  <SectionWrapper>
    <HeroSection {...HERO_CONFIG} />
  </SectionWrapper>
);

export const FeaturesSectionWrapper = () => (
  <SectionWrapper AnimationComponent={FeatureBubbles}>
    <FeaturesSection />
  </SectionWrapper>
);

export const TestimonialsSectionWrapper = () => (
  <SectionWrapper 
    AnimationComponent={TestimonialBubbles}
    animationOpacity={0.6}
  >
    <TestimonialsSection />
  </SectionWrapper>
);

export const PricingSectionWrapper = () => (
  <SectionWrapper>
    <PricingSection />
  </SectionWrapper>
);

export const CTASectionWrapper = () => (
  <SectionWrapper AnimationComponent={CTABubbles}>
    <CTASection />
  </SectionWrapper>
);

export const AboutSectionWrapper = () => (
  <SectionWrapper>
    <AboutSection />
  </SectionWrapper>
);
