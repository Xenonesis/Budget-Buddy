'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { CTA_STATS } from './config/landing-config';

const StatsCard = memo(function StatsCard() {
  return (
    <div className="md:col-span-2">
      <div className="bg-card rounded-2xl border border-border/50 p-8 shadow-sm relative overflow-hidden h-full flex flex-col justify-center">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          {CTA_STATS.map((stat, idx) => (
            <div key={idx} className="text-center bg-muted/30 rounded-xl p-4">
              <div className="text-3xl font-display font-bold tracking-tight text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1.5 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="flex items-center gap-3 bg-primary/5 rounded-lg p-4 relative z-10">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full font-semibold flex items-center justify-center text-sm">
            JD
          </div>
          <div>
            <div className="text-sm font-medium">Jamie Davis</div>
            <div className="text-xs text-muted-foreground">Saved $2,400 in 3 months</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const CTASection = memo(function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background relative overflow-hidden">
      {/* Subtle texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 text-sm font-medium mb-8">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Ready to get started?</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight tracking-tight">
                Take control of your <span className="text-primary">financial future</span>
              </h2>

              <p className="mb-10 text-lg text-background/70 max-w-xl mx-auto md:mx-0">
                Smart budgeting tools designed to help you save more, spend wisely, and achieve your financial goals with precision.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-base py-6 px-8"
                >
                  <Link href="/auth/register">
                    <span className="flex items-center gap-2">
                      Get started free
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-background/20 text-background hover:bg-background/10 rounded-xl text-base py-6 px-8"
                >
                  <Link href="/demo">
                    <span className="flex items-center gap-2">
                      View demo
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            <StatsCard />
          </div>
        </div>
      </div>
    </section>
  );
});
