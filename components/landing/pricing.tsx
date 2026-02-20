'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check, TrendingDown, DollarSign, Building, Mail, Phone, Minus } from 'lucide-react';
import { PRICING_PLANS } from './config/landing-config';

// Brutalist Pricing Card component
const PricingCard = memo(function PricingCard({
  plan,
  index,
}: {
  plan: (typeof PRICING_PLANS)[number];
  index: number;
}) {
  return (
    <div
      className={`relative border-2 bg-paper transition-transform duration-200 hover:-translate-y-2 ${
        plan.popular 
          ? 'border-foreground shadow-[16px_16px_0px_hsl(var(--primary))] scale-100 md:scale-105 z-10' 
          : 'border-foreground/80 shadow-[8px_8px_0px_hsl(var(--foreground))] hover:shadow-[16px_16px_0px_hsl(var(--foreground))]'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-full flex justify-center z-20">
          <div className="bg-primary text-primary-foreground font-mono font-bold text-sm uppercase tracking-widest px-6 py-2 border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))]">
            MOST BRUTAL (POPULAR)
          </div>
        </div>
      )}

      <div className={`p-8 md:p-10 flex flex-col h-full ${plan.popular ? 'pt-12' : ''}`}>
        <div className="text-center mb-8 border-b-2 border-foreground pb-8">
          <h3 className="text-2xl font-bold font-display uppercase tracking-widest mb-4 bg-foreground text-background inline-block px-4 py-1">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-6xl font-display font-black tracking-tighter">{plan.price}</span>
            {plan.period && <span className="font-mono font-bold text-muted-foreground uppercase">/{plan.period}</span>}
          </div>
          <p className="text-base font-medium mb-4 p-2 bg-primary/10 border-l-4 border-primary text-left">
            {plan.description}
          </p>
          {'savings' in plan && plan.savings && (
            <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary bg-primary/20 text-primary font-bold font-mono tracking-widest">
              <TrendingDown className="h-5 w-5" strokeWidth={2.5} />
              {plan.savings}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-10 flex-grow font-mono">
          {plan.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 text-sm"
            >
              <div className="mt-0.5 flex-shrink-0 w-6 h-6 border-2 border-foreground bg-primary flex items-center justify-center text-primary-foreground shadow-[2px_2px_0px_hsl(var(--foreground))]">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
              <span className="font-bold uppercase tracking-tight mt-1">{feature}</span>
            </div>
          ))}

          {plan.limitations && plan.limitations.length > 0 && (
            <div className="pt-6 mt-6 border-t-2 border-foreground/20 space-y-4">
              {plan.limitations.map((limitation, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-foreground/50 line-through decoration-2">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 border-2 border-foreground/30 bg-foreground/10 flex items-center justify-center">
                    <Minus className="h-4 w-4 text-foreground/50" strokeWidth={3} />
                  </div>
                  <span className="font-bold uppercase tracking-tight mt-1">{limitation}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          asChild
          className={`w-full py-8 text-lg font-bold uppercase tracking-widest border-2 border-foreground rounded-none shadow-[6px_6px_0px_hsl(var(--foreground))] hover:shadow-[2px_2px_0px_hsl(var(--foreground))] hover:translate-y-1 transition-all ${
            plan.popular 
              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
              : 'bg-paper text-foreground hover:bg-foreground hover:text-background border-foreground shadow-[6px_6px_0px_hsl(var(--primary))] hover:shadow-[2px_2px_0px_hsl(var(--primary))]'
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
      className="py-24 md:py-32 bg-paper relative overflow-hidden border-t-2 border-foreground border-b-2"
    >
      {/* Brutalist Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 2px, transparent 2px), linear-gradient(to bottom, hsl(var(--foreground)) 2px, transparent 2px)`,
          backgroundSize: `80px 80px`,
          opacity: 0.05
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-20 bg-paper p-8 border-2 border-foreground shadow-[12px_12px_0px_hsl(var(--primary))]">
          <div className="inline-flex items-center justify-center gap-2 px-6 py-2 border-2 border-foreground bg-primary text-primary-foreground mb-8 font-mono font-bold uppercase tracking-widest shadow-[4px_4px_0px_hsl(var(--foreground))]">
            <DollarSign className="h-5 w-5" strokeWidth={3} />
            Simple, Transparent Pricing
          </div>

          <h2 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter mb-6">
            CHOOSE YOUR <span className="text-primary mix-blend-difference">FINANCIAL ARSENAL</span>
          </h2>
          <p className="text-xl font-bold bg-foreground text-background inline-block p-4 max-w-2xl mx-auto uppercase">
            Start free and scale. All plans include core architecture with zero hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto pl-4 pb-4">
          {PRICING_PLANS.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-24 p-8 md:p-12 bg-foreground text-background border-2 border-foreground shadow-[16px_16px_0px_hsl(var(--primary))] text-center relative">
          <div className="absolute -top-6 -left-6 bg-primary text-primary-foreground border-2 border-foreground w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_hsl(var(--foreground))]">
            <Building className="h-6 w-6" strokeWidth={2.5} />
          </div>
          
          <h3 className="text-3xl font-display font-bold uppercase tracking-wider mb-4 text-primary">Enterprise Solutions</h3>
          <p className="font-mono font-bold text-lg mb-8 max-w-2xl mx-auto p-4 border-l-4 border-primary bg-background/10">
            Need custom infrastructure, dedicated support, or enterprise-grade security architecture? We forge tailored solutions for organizations scaling relentlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              size="lg"
              className="rounded-none border-2 border-background bg-background text-foreground hover:bg-primary hover:text-primary-foreground hover:border-foreground gap-3 font-bold uppercase tracking-widest shadow-[6px_6px_0px_hsl(var(--primary))] hover:translate-y-1 hover:shadow-[2px_2px_0px_hsl(var(--primary))] transition-all py-8"
            >
              <Mail className="h-5 w-5" strokeWidth={3} />
              Contact Sales
            </Button>
            <Button
              size="lg"
              className="rounded-none border-2 border-transparent bg-primary text-primary-foreground hover:bg-background hover:text-foreground gap-3 font-bold uppercase tracking-widest shadow-[6px_6px_0px_hsl(var(--background))] hover:translate-y-1 hover:shadow-[2px_2px_0px_hsl(var(--background))] transition-all py-8"
            >
              <Phone className="h-5 w-5" strokeWidth={3} />
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
});
