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

// Feature card component
const FeatureCard = memo(function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof financialFeatures)[number];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <div className="w-full group">
      <div
        className="h-full bg-card rounded-2xl border border-border p-6 sm:p-8 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      >
        {/* Highlight Badge */}
        <div className="absolute -top-3 right-4 z-10">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {feature.highlight}
          </div>
        </div>

        {/* Icon */}
        <div
          className="flex h-12 w-12 items-center justify-center mb-5 rounded-xl transition-colors duration-200"
          style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="relative z-20">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {feature.title}
          </h3>

          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            {feature.description}
          </p>

          {/* Steps List */}
          <div className="space-y-3 text-sm border-t border-border pt-5">
            {feature.steps.map((step, stepIndex) => (
              <div
                key={stepIndex}
                className="flex items-start gap-2.5"
              >
                <div
                  className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  <Check size={12} strokeWidth={2.5} />
                </div>
                <span className="text-foreground/80">
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 relative z-20">
      {financialFeatures.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}
    </div>
  );
});
