'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, TrendingDown, DollarSign, Building, Mail, Phone, Minus } from 'lucide-react';
import { PRICING_PLANS } from './config/landing-config';

// Pricing Card component
const PricingCard = memo(function PricingCard({
  plan,
  index,
}: {
  plan: (typeof PRICING_PLANS)[number];
  index: number;
}) {
  return (
    <div
      className={`relative rounded-2xl border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        plan.popular
          ? 'border-primary shadow-md scale-100 md:scale-[1.03] z-10'
          : 'border-border shadow-sm'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm">
            Most Popular
          </div>
        </div>
      )}

      <div className={`p-8 md:p-10 flex flex-col h-full ${plan.popular ? 'pt-12' : ''}`}>
        <div className="text-center mb-8 border-b border-border pb-8">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {plan.name}
          </h3>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-5xl font-display font-bold tracking-tight">{plan.price}</span>
            {plan.period && (
              <span className="text-muted-foreground text-sm font-medium">
                /{plan.period}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {plan.description}
          </p>
          {'savings' in plan && plan.savings && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
              <TrendingDown className="h-3.5 w-3.5" />
              {plan.savings}
            </div>
          )}
        </div>

        <div className="space-y-3.5 mb-8 flex-grow">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm">
              <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </div>
              <span className="text-foreground/80">{feature}</span>
            </div>
          ))}

          {plan.limitations && plan.limitations.length > 0 && (
            <div className="pt-4 mt-4 border-t border-border space-y-3.5">
              {plan.limitations.map((limitation, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 text-sm text-muted-foreground/60 line-through decoration-1"
                >
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-muted/50 flex items-center justify-center">
                    <Minus className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                  <span>{limitation}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          asChild
          className={`w-full py-6 text-base font-semibold rounded-xl transition-all ${
            plan.popular
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          <Link href="/auth/register">{plan.cta}</Link>
        </Button>
      </div>
    </div>
  );
});

export const PricingSection = memo(function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-24 md:py-32 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium mb-6">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
            <span>Simple pricing</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">
            Choose the right plan <span className="text-primary">for you</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as you grow. All plans include core features with zero hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {PRICING_PLANS.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-20 p-8 md:p-12 bg-card rounded-2xl border border-border shadow-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building className="h-5 w-5" />
            </div>
          </div>

          <h3 className="text-2xl font-display font-bold mb-3 text-foreground">
            Enterprise Solutions
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Need custom infrastructure, dedicated support, or enterprise-grade security?
            We build tailored solutions for growing organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="rounded-xl gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Sales
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl gap-2"
            >
              <Phone className="h-4 w-4" />
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});
