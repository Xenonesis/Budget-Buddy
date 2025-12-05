'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { FinancialSpotlightCards } from './financial-spotlight-cards';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ANALYTICS_FEATURES } from './config/landing-config';

// Lazy load the heavy FinancialDataFlow component
const FinancialDataFlow = dynamic(() => import('@/components/ui/financial-data-flow'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 fast-skeleton rounded-lg flex items-center justify-center">
      <span className="text-muted-foreground text-sm">Loading visualization...</span>
    </div>
  ),
});

// Memoized feature section for better scroll performance
export const FeaturesSection = memo(function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden transform-gpu"
    >
      {/* Enhanced background with better visual depth */}
      <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-20"
        style={{ willChange: 'opacity' }}
      />

      {/* Floating orbs for visual interest - using CSS animations instead of motion */}
      <div
        className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: '0s' }}
      />
      <div
        className="absolute bottom-20 right-10 w-24 h-24 bg-violet-500/10 rounded-full blur-xl animate-float"
        style={{ animationDelay: '2s' }}
      />

      <div className="container mx-auto px-4 relative">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            {/* Enhanced badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Features</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl mb-4 sm:mb-6 relative px-2 sm:px-0">
              Everything you need to{' '}
              <span className="text-gradient-primary relative inline-block">
                <span className="block sm:inline">manage your money</span>
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-violet-500 to-primary rounded-full"
                  initial={{ width: 0, opacity: 0 }}
                  whileInView={{ width: '100%', opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
              </span>
            </h2>
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground px-2 sm:px-0 max-w-3xl mx-auto leading-relaxed">
            Powerful tools and intelligent insights to help you take control of your finances, track
            spending patterns, and achieve your financial goals with confidence.
          </p>
        </motion.div>

        <FinancialSpotlightCards />

        <AdvancedAnalyticsSection />
      </div>
    </section>
  );
});

// Memoized analytics section
const AdvancedAnalyticsSection = memo(function AdvancedAnalyticsSection() {
  return (
    <motion.div
      className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 transform-gpu"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      <div className="grid md:grid-cols-2">
        <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            <span className="text-gradient-primary">Advanced Budget Analytics</span>
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Get powerful insights into your spending patterns with our intuitive analytics
            dashboard. Identify trends, spot opportunities to save, and make data-driven financial
            decisions.
          </p>
          <div className="grid grid-cols-1 gap-3 mb-6 sm:mb-8">
            {ANALYTICS_FEATURES.map((item, idx) => (
              <motion.div
                key={idx}
                className="flex items-start gap-2 group"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
              >
                <div className="mt-1 flex-shrink-0 rounded-full p-1 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <Check size={12} />
                </div>
                <div>
                  <div className="font-medium text-sm group-hover:text-primary transition-colors">
                    {item.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="relative overflow-hidden rounded-md w-fit">
            <Button asChild variant="outline" className="group relative z-10 border-primary/30">
              <Link href="/auth/register">
                <span className="flex items-center gap-2 text-primary">
                  Try analytics now
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Button>
          </div>
        </div>
        <motion.div
          className="bg-muted/30 p-4 sm:p-6 flex items-center justify-center order-1 md:order-2 min-h-[300px] sm:min-h-[400px] transform-gpu"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">
                  Financial visualization temporarily unavailable
                </p>
              </div>
            }
          >
            <FinancialDataFlow
              title="Smart Financial Data Processing & AI Insights"
              circleText="AI"
              badgeTexts={{
                first: 'INCOME',
                second: 'BUDGET',
                third: 'ANALYTICS',
                fourth: 'INSIGHTS',
              }}
              buttonTexts={{
                first: 'Budget Buddy',
                second: 'Smart Analytics',
              }}
              lightColor="#22c55e"
              className="scale-75 sm:scale-90 md:scale-100"
            />
          </ErrorBoundary>
        </motion.div>
      </div>
    </motion.div>
  );
});
