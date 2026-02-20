'use client';

import { memo } from 'react';
import {
  Wallet,
  PieChart,
  LineChart,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Memoize static feature data outside component
const financialFeatures = [
  {
    title: 'Smart Expense Tracking',
    description:
      'Automatically categorize and track all your expenses with AI-powered recognition.',
    icon: Wallet,
    color: '#22c55e',
    steps: [
      'Connect your bank accounts securely',
      'Auto-categorize transactions with AI',
      'Track spending across multiple accounts',
      'Get real-time expense notifications',
    ],
    highlight: 'Save 5+ hours weekly',
  },
  {
    title: 'Intelligent Budget Planning',
    description: 'Create dynamic budgets that adapt to your lifestyle and financial goals.',
    icon: PieChart,
    color: '#3b82f6',
    steps: [
      'Set personalized budget categories',
      'Get smart spending recommendations',
      'Receive overspending alerts',
      'Track budget performance metrics',
    ],
    highlight: 'Reduce overspending by 40%',
  },
  {
    title: 'Advanced Analytics',
    description: 'Discover spending patterns with machine learning insights and forecasting.',
    icon: LineChart,
    color: '#8b5cf6',
    steps: [
      'View detailed spending analytics',
      'Get predictive financial forecasts',
      'Export custom financial reports',
      'Identify saving opportunities',
    ],
    highlight: 'Find 15+ saving opportunities',
  },
  {
    title: 'Goal Achievement',
    description: 'Set and achieve financial milestones with our proven goal-setting framework.',
    icon: TrendingUp,
    color: '#f59e0b',
    steps: [
      'Create SMART financial goals',
      'Track progress with visual metrics',
      'Get milestone achievement rewards',
      'Join goal-focused communities',
    ],
    highlight: '3x higher success rate',
  },
  {
    title: 'Bill Management',
    description: 'Never miss a payment with intelligent bill tracking and reminders.',
    icon: Calendar,
    color: '#ef4444',
    steps: [
      'Set up automatic bill reminders',
      'Track subscription services',
      'Monitor price changes',
      'Get cancellation suggestions',
    ],
    highlight: 'Prevent $200+ in late fees',
  },
  {
    title: 'Bank-Level Security',
    description: 'Your data is protected with enterprise-grade security and encryption.',
    icon: ShieldCheck,
    color: '#06b6d4',
    steps: [
      '256-bit encryption protection',
      'Multi-factor authentication',
      'SOC 2 compliance certified',
      'Zero data selling policy',
    ],
    highlight: 'Trusted by 50,000+ users',
  },
] as const;

// Brutalist individual card component for maximum impact
const FeatureCard = memo(function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof financialFeatures)[number];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <div
      className="w-full group"
    >
      <div
        className="h-full bg-paper border-2 border-foreground p-6 sm:p-8 relative transition-transform duration-200 hover:-translate-y-1 shadow-[8px_8px_0px_hsl(var(--foreground))] hover:shadow-[12px_12px_0px_hsl(var(--foreground))] active:translate-y-1 active:shadow-[0px_0px_0px_hsl(var(--foreground))]"
      >
        {/* Highlight Badge */}
        <div className="absolute -top-3 -right-3 z-10 transition-transform duration-200 group-hover:scale-105">
          <div className="bg-primary text-primary-foreground font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
            {feature.highlight}
          </div>
        </div>

        {/* Brutalist Icon Block */}
        <div
          className="flex h-16 w-16 items-center justify-center mb-6 border-2 border-foreground bg-foreground text-background shadow-[4px_4px_0px_hsl(var(--primary))] group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200"
        >
          <Icon className="h-8 w-8" strokeWidth={2} />
        </div>

        {/* Content */}
        <div className="relative z-20">
          <h3 className="text-xl font-bold mb-3 text-foreground font-display uppercase tracking-wider">
            {feature.title}
          </h3>

          <p className="text-foreground font-medium mb-6 text-sm leading-relaxed border-l-4 border-primary pl-4 bg-primary/5 py-2">
            {feature.description}
          </p>

          {/* Steps List */}
          <div className="space-y-4 font-mono text-sm border-t-2 border-foreground/20 pt-6">
            {feature.steps.map((step, stepIndex) => (
              <div
                key={stepIndex}
                className="flex items-start gap-3 group/step"
              >
                <div
                  className="flex-shrink-0 border-2 border-foreground bg-paper group-hover/step:bg-primary group-hover/step:text-primary-foreground transition-colors duration-200"
                >
                  <Check
                    size={16}
                    strokeWidth={3}
                  />
                </div>
                <span className="text-foreground font-semibold uppercase tracking-tight">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export const FinancialSpotlightCards = memo(function FinancialSpotlightCards() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12 mt-12 sm:mt-16 relative z-20">
      {financialFeatures.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}
    </div>
  );
});
