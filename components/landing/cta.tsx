'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { CTA_STATS } from './config/landing-config';

const BrutalStatsCard = memo(function BrutalStatsCard() {
  return (
    <div className="md:col-span-2">
      <div className="bg-paper border-2 border-foreground p-8 shadow-[12px_12px_0px_hsl(var(--primary))] relative overflow-hidden h-full flex flex-col justify-center">
        {/* Decorative Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: `20px 20px`,
          }}
        />

        {/* Static brutalist decoration */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary border-4 border-foreground rounded-full flex items-center justify-center transform hover:scale-110 transition-transform">
          <Sparkles className="h-10 w-10 text-primary-foreground" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-8 mb-8 relative z-10">
          {CTA_STATS.map((stat, idx) => (
            <div key={idx} className="text-center bg-background border-2 border-foreground p-4">
              <div className="text-4xl font-display font-black tracking-tighter text-action-primary uppercase">{stat.value}</div>
              <div className="text-xs font-mono font-bold mt-2 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="flex items-center gap-4 bg-chartreuse/20 p-4 border-l-4 border-foreground relative z-10">
          <div className="flex-shrink-0 w-12 h-12 bg-foreground text-background font-display font-bold flex items-center justify-center text-xl border-2 border-transparent">
            JD
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider">Jamie Davis</div>
            <div className="text-xs font-mono font-bold text-muted-foreground uppercase">100% BRUTAL ROI</div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const CTASection = memo(function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden border-y-2 border-foreground">
      {/* Brutalist structural background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
      }}></div>
      
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0 border-b-2 border-foreground bg-foreground text-primary py-2">
        <div className="animate-marquee font-mono font-black text-2xl uppercase tracking-widest whitespace-nowrap">
          <span>TIME IS MONEY. MONEY IS POWER. TAKE CONTROL.</span>
          <span className="mx-8">•</span>
          <span>TIME IS MONEY. MONEY IS POWER. TAKE CONTROL.</span>
          <span className="mx-8">•</span>
          <span>TIME IS MONEY. MONEY IS POWER. TAKE CONTROL.</span>
          <span className="mx-8">•</span>
          <span>TIME IS MONEY. MONEY IS POWER. TAKE CONTROL.</span>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10 pt-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 lg:gap-16 items-center">
            <div className="md:col-span-3 text-center md:text-left">
              <div className="inline-block px-4 py-2 bg-background text-foreground border-2 border-foreground font-mono font-bold text-sm uppercase tracking-widest mb-8 shadow-[4px_4px_0px_hsl(var(--foreground))] hover:-translate-y-1 transition-transform">
                <span className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-action-primary" strokeWidth={3} /> INITIALIZE SEQUENCE
                </span>
              </div>

              <h2 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-8 leading-[0.9] tracking-tighter uppercase">
                DOMINATE YOUR <br/><span className="text-foreground bg-primary-foreground px-2 mix-blend-screen">FINANCIAL FUTURE</span>
              </h2>

              <p className="mb-12 text-xl font-medium max-w-xl mx-auto md:mx-0 p-4 border-l-4 border-background bg-background/10 font-mono">
                Budgeting shouldn&apos;t be soft. It&apos;s a strategic operation. Deploy our structural tools and execute your goals with absolute precision.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="rounded-none border-2 border-background bg-background text-foreground hover:bg-foreground hover:text-background font-bold uppercase tracking-widest text-lg py-8 px-10 shadow-[8px_8px_0px_hsl(var(--foreground))] hover:shadow-[4px_4px_0px_hsl(var(--foreground))] hover:translate-y-1 transition-all"
                >
                  <Link href="/auth/register">
                    <span className="flex items-center gap-3">
                      START OPERATION
                      <ArrowRight className="h-6 w-6" strokeWidth={3} />
                    </span>
                  </Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-none border-2 border-background bg-transparent text-background hover:bg-background hover:text-foreground font-bold uppercase tracking-widest text-lg py-8 px-10 shadow-[8px_8px_0px_transparent] hover:shadow-[8px_8px_0px_hsl(var(--foreground))] transition-all"
                >
                  <Link href="/demo">
                    <span className="flex items-center gap-3">
                      VIEW DEMO
                      <ArrowRight className="h-6 w-6" strokeWidth={3} />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>

            <BrutalStatsCard />
          </div>
        </div>
      </div>
    </section>
  );
});
