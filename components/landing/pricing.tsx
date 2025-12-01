'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, TrendingDown, DollarSign, Building, Mail, Phone, Minus } from 'lucide-react';

// Static data defined outside component
const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for individuals starting their financial journey',
    features: [
      'Track up to 3 accounts',
      'Basic expense categorization',
      'Monthly budget creation',
      'Simple reports and charts',
      'Mobile app access',
      'Email support',
    ],
    limitations: ['Limited to 100 transactions/month', 'Basic categories only'],
    cta: 'Get Started Free',
    popular: false,
    color: 'from-gray-400 to-gray-600',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'Advanced features for serious budgeters and savers',
    features: [
      'Unlimited accounts and transactions',
      'AI-powered categorization',
      'Advanced budget templates',
      'Goal tracking and milestones',
      'Bill reminders and alerts',
      'Custom reports and exports',
      'Investment tracking',
      'Priority email support',
      'Mobile and web access',
    ],
    limitations: [],
    cta: 'Start 14-Day Free Trial',
    popular: true,
    color: 'from-blue-500 to-purple-600',
    savings: 'Save $24 annually vs monthly billing',
  },
  {
    name: 'Family',
    price: '$19.99',
    period: 'per month',
    description: 'Comprehensive financial management for families',
    features: [
      'Everything in Pro',
      'Up to 6 family member accounts',
      'Shared budgets and goals',
      "Kids' allowance tracking",
      'Family spending insights',
      'Multiple currency support',
      'Advanced security controls',
      'Dedicated account manager',
      'Phone and chat support',
      'Financial planning consultation',
    ],
    limitations: [],
    cta: 'Start Family Trial',
    popular: false,
    color: 'from-emerald-500 to-teal-600',
    savings: 'Save $48 annually vs monthly billing',
  },
] as const;

// Memoized pricing card component
const PricingCard = memo(function PricingCard({
  plan,
  index,
}: {
  plan: (typeof pricingPlans)[number];
  index: number;
}) {
  return (
    <motion.div
      className={`relative rounded-2xl border bg-background/50 backdrop-blur-sm shadow-lg transition-all duration-300 transform-gpu hover:shadow-xl hover:-translate-y-1 ${
        plan.popular ? 'border-primary/50 scale-105' : 'border-border/50'
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-primary to-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-bold">{plan.price}</span>
            {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
          </div>
          <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
          {'savings' in plan && plan.savings && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
              <TrendingDown className="h-3 w-3" />
              {plan.savings}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-8">
          {plan.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 text-sm transition-transform duration-200 hover:translate-x-1"
            >
              <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary" />
              </div>
              <span>{feature}</span>
            </div>
          ))}

          {plan.limitations && plan.limitations.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              {plan.limitations.map((limitation, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-muted/20 flex items-center justify-center">
                    <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                  </div>
                  <span>{limitation}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          asChild
          className={`w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            plan.popular ? 'bg-primary hover:bg-primary/90' : ''
          }`}
          variant={plan.popular ? 'default' : 'outline'}
        >
          <Link href="/auth/register">{plan.cta}</Link>
        </Button>
      </div>
    </motion.div>
  );
});

export const PricingSection = memo(function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-20 md:py-28 bg-gradient-to-br from-muted/30 to-background relative overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary w-fit mb-6 mx-auto">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-semibold">Simple, Transparent Pricing</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose the perfect plan for your{' '}
            <span className="text-gradient-primary">financial journey</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and upgrade as your needs grow. All plans include our core features with no
            hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        <motion.div
          className="max-w-3xl mx-auto mt-16 p-6 bg-muted/30 rounded-xl text-center border border-border/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building className="h-5 w-5 text-primary" />
            <span className="font-semibold">Enterprise Solutions</span>
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            Need custom features, dedicated support, or enterprise-grade security? We offer tailored
            solutions for organizations of all sizes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Mail className="h-4 w-4" />
              Contact Sales
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Phone className="h-4 w-4" />
              Schedule Demo
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
