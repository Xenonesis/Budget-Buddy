"use client";

import dynamic from 'next/dynamic';
import { HeroSection } from "@/components/ui/hero-section-dark";
import { FeaturesSection } from "@/components/landing/features";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { PricingSection } from "@/components/landing/pricing";
import { CTASection } from "@/components/landing/cta";
import { AboutSection } from "@/components/landing/about";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

// Loading placeholders for animation components
const BubblePlaceholder = () => <div className="absolute inset-0 bg-primary/5 opacity-30 rounded-full"></div>;

const FeatureBubbles = dynamic(() => import('@/app/page-animations').then(mod => mod.FeatureBubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

const TestimonialBubbles = dynamic(() => import('@/app/page-animations').then(mod => mod.TestimonialBubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

const CTABubbles = dynamic(() => import('@/app/page-animations').then(mod => mod.CTABubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background relative overflow-x-hidden">
      <Header />
      
      {/* Hero section with mobile-optimized background */}
      <div className="relative">
        <HeroSection
          title="Welcome to Budget Buddy"
          subtitle={{
            regular: "Take control of your finances with ",
            gradient: "our intuitive budgeting tool",
          }}
          description="Track your expenses, set budgets, and achieve your financial goals with our easy-to-use platform designed for everyone."
          ctaText="Get Started"
          ctaHref="/auth/register"
          bottomImage={{
            light: "/hero-banner.png",
            dark: "/hero-banner.png",
          }}
          gridOptions={{
            angle: 65,
            opacity: 0.4,
            cellSize: 50,
            lightLineColor: "#4a4a4a",
            darkLineColor: "#2a2a2a",
          }}
        />
      </div>

      {/* Features section with contained background animations */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <FeatureBubbles />
        </div>
        <FeaturesSection />
      </div>

      {/* Testimonials section with mobile-optimized background */}
      <div className="relative">
        <div className="absolute inset-0 opacity-60 hidden sm:block">
          <TestimonialBubbles />
        </div>
        <TestimonialsSection />
      </div>

      {/* Pricing section */}
      <PricingSection />

      {/* CTA section with contained background */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <CTABubbles />
        </div>
        <CTASection />
      </div>

      {/* About Section */}
      <AboutSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}