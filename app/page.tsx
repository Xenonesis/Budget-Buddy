"use client";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import {
  HeroSectionWrapper,
  FeaturesSectionWrapper,
  TestimonialsSectionWrapper,
  PricingSectionWrapper,
  CTASectionWrapper,
  AboutSectionWrapper,
} from "@/components/landing/sections";

// Landing page sections configuration
const LANDING_SECTIONS = [
  { Component: HeroSectionWrapper, key: "hero" },
  { Component: FeaturesSectionWrapper, key: "features" },
  { Component: TestimonialsSectionWrapper, key: "testimonials" },
  { Component: PricingSectionWrapper, key: "pricing" },
  { Component: CTASectionWrapper, key: "cta" },
  { Component: AboutSectionWrapper, key: "about" },
] as const;

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background relative overflow-x-hidden">
      <Header />
      
      {/* Render all landing page sections */}
      {LANDING_SECTIONS.map(({ Component, key }) => (
        <Component key={key} />
      ))}

      <Footer />
    </main>
  );
}
