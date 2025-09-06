"use client";

import TestimonialSlider from "@/components/ui/testimonial-slider";
import { generateUserAvatar } from "@/components/ui/avatar-generator";

interface FinancialTestimonial {
  id: number;
  quote: string;
  name: string;
  username: string;
  avatar: string;
}

const financialTestimonials: FinancialTestimonial[] = [
  {
    id: 1,
    quote: "Budget Buddy transformed my financial life! I've saved over $3,000 in just 6 months by tracking my expenses and following the AI-powered recommendations. The automated categorization is incredibly accurate.",
    name: "Sarah Chen",
    username: "@sarahchen_finance",
    avatar: generateUserAvatar("Sarah Chen", 1)
  },
  {
    id: 2,
    quote: "As a freelancer with irregular income, budgeting was always a nightmare. Budget Buddy's smart analytics help me plan for lean months and maximize my savings during good ones. Game changer!",
    name: "Marcus Rodriguez",
    username: "@marcus_freelance",
    avatar: generateUserAvatar("Marcus Rodriguez", 2)
  },
  {
    id: 3,
    quote: "The AI insights are spot-on! It identified subscription services I forgot about, saving me $200/month. The goal tracking feature helped me save for my dream vacation in record time.",
    name: "Emily Johnson",
    username: "@emily_saves",
    avatar: generateUserAvatar("Emily Johnson", 3)
  },
  {
    id: 4,
    quote: "Finally, a budgeting app that actually works! The bank-level security gives me peace of mind, and the real-time notifications keep me on track. My financial stress has completely disappeared.",
    name: "David Park",
    username: "@davidpark_money",
    avatar: generateUserAvatar("David Park", 4)
  },
  {
    id: 5,
    quote: "Budget Buddy's analytics revealed spending patterns I never noticed. I've reduced my food expenses by 30% and increased my emergency fund by 400%. The visual reports are incredibly helpful!",
    name: "Jessica Williams",
    username: "@jess_budgets",
    avatar: generateUserAvatar("Jessica Williams", 5)
  },
  {
    id: 6,
    quote: "The automated bill tracking saved me from late fees multiple times. The predictive insights help me plan major purchases better. This app pays for itself within the first month!",
    name: "Robert Thompson",
    username: "@rob_finances",
    avatar: generateUserAvatar("Robert Thompson", 6)
  },
  {
    id: 7,
    quote: "As a small business owner, tracking personal and business expenses was chaotic. Budget Buddy's categorization and reporting features have streamlined everything. Highly recommend!",
    name: "Lisa Anderson",
    username: "@lisa_entrepreneur",
    avatar: generateUserAvatar("Lisa Anderson", 7)
  },
  {
    id: 8,
    quote: "The goal achievement system is motivating! I've hit my savings targets 3 months ahead of schedule. The community features and milestone celebrations keep me engaged and accountable.",
    name: "Michael Chang",
    username: "@mike_goals",
    avatar: generateUserAvatar("Michael Chang", 8)
  }
];

export function FinancialTestimonials() {
  return (
    <TestimonialSlider
      testimonials={financialTestimonials}
      title="Success Stories"
      subtitle="Real Results from Real Users"
      className="bg-gradient-to-b from-background via-muted/10 to-background"
    />
  );
}