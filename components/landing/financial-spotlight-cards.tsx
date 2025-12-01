'use client';

import { memo } from 'react';
import { CardSpotlight } from '@/components/ui/card-spotlight';
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

// Memoized individual card component for better performance
const FeatureCard = memo(function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof financialFeatures)[number];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-full group transform-gpu"
    >
      <CardSpotlight
        className="h-full bg-background/95 border-border/50 backdrop-blur-sm hover:bg-background/98 transition-all duration-300 p-4 sm:p-6 hover:shadow-xl hover:shadow-primary/5 group-hover:border-primary/30"
        color={feature.color}
        radius={300}
      >
        {/* Highlight Badge - simplified animation */}
        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10 transform group-hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-500 rounded-full blur-sm opacity-70"></div>
            <div className="relative bg-gradient-to-r from-primary to-violet-500 text-white text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-lg border border-white/20">
              {feature.highlight}
            </div>
          </div>
        </div>

        {/* Icon with simplified hover effects */}
        <div
          className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl mb-4 sm:mb-6 relative overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{ backgroundColor: `${feature.color}15` }}
        >
          <div
            className="relative z-10 transition-colors duration-300 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6"
            style={{ color: feature.color }}
          >
            <Icon className="h-8 w-8" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-20">
          <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">
            {feature.title}
          </h3>

          <p className="text-muted-foreground mb-4 sm:mb-6 text-sm leading-relaxed">
            {feature.description}
          </p>

          {/* Steps List - simplified animations */}
          <div className="space-y-3">
            {feature.steps.map((step, stepIndex) => (
              <div
                key={stepIndex}
                className="flex items-start gap-3 group/step transition-transform duration-200 hover:translate-x-1"
              >
                <div
                  className="flex-shrink-0 rounded-full p-1 mt-0.5 transition-colors duration-200 group-hover/step:scale-110"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <Check
                    size={12}
                    className="transition-colors duration-200"
                    style={{ color: feature.color }}
                  />
                </div>
                <span className="text-sm text-muted-foreground group-hover/step:text-foreground transition-colors duration-200">
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom accent line - simplified */}
          <div
            className="mt-6 h-1 rounded-full w-full"
            style={{ backgroundColor: `${feature.color}30` }}
          >
            <div
              className="h-full rounded-full w-2/5 transition-all duration-300 group-hover:w-3/5"
              style={{ backgroundColor: feature.color }}
            />
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
});

export const FinancialSpotlightCards = memo(function FinancialSpotlightCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16">
      {financialFeatures.map((feature, index) => (
        <FeatureCard key={feature.title} feature={feature} index={index} />
      ))}
    </div>
  );
});
