import * as React from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: {
    regular: string;
    gradient: string;
  };
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  bottomImage?: {
    light: string;
    dark: string;
  };
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = 'Take absolute control',
      subtitle = {
        regular: 'budgeting for ',
        gradient: 'visionaries.',
      },
      description = 'Uncompromising financial clarity. No fluff. No soft edges. Just the raw truth about your money, presented in high-fidelity precision.',
      ctaText = 'Start building',
      ctaHref = '/auth/register',
      bottomImage = {
        light: '/dashboard.png',
        dark: '/dashboard.png',
      },
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn('relative min-h-[90vh] flex flex-col pt-32 lg:pt-40 overflow-hidden isolate', className)}
        ref={ref}
        {...props}
      >
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: `32px 32px`,
            opacity: 0.04
          }}
        />

        <div className="container relative z-10 px-4 md:px-8 mx-auto flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 h-full">
            
            <div className="lg:col-span-8 flex flex-col justify-center items-start lg:pr-12 lg:border-r lg:border-border pb-12 lg:pb-0">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary-foreground font-medium text-sm tracking-wide px-4 py-2 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-foreground">{title}</span>
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-[6rem] font-black leading-[0.9] tracking-tight text-foreground">
                <span className="block">{subtitle.regular}</span>
                <span className="block text-primary">{subtitle.gradient}</span>
              </h1>
              
              <p className="mt-8 text-xl md:text-2xl max-w-2xl text-muted-foreground leading-relaxed">
                {description}
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href={ctaHref}
                  className="group relative inline-flex items-center justify-center font-semibold bg-primary text-primary-foreground px-8 py-4 text-lg rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  {ctaText}
                  <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  href="/demo" 
                  className="group inline-flex items-center justify-center font-semibold bg-transparent text-foreground border border-border px-8 py-4 text-lg rounded-xl hover:bg-muted/50 transition-all active:scale-[0.98]"
                >
                  Live Demo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col lg:border-l lg:border-border lg:-ml-px mt-8 lg:mt-0">
              {/* Info blocks in the sidebar */}
              <div className="h-full flex flex-col gap-4 lg:gap-0">
                <div className="flex-1 p-8 lg:border-b lg:border-border flex flex-col justify-center rounded-xl lg:rounded-none bg-primary/5 relative group cursor-pointer hover:bg-primary/10 transition-colors">
                  <span className="text-xs tracking-wider text-muted-foreground mb-3 block">System Status</span>
                  <div className="font-display text-5xl font-bold tracking-tighter">100%</div>
                  <div className="font-medium mt-2 text-foreground">Operational Efficiency</div>
                </div>
                <div className="flex-1 p-8 lg:border-b lg:border-border flex flex-col justify-center rounded-xl lg:rounded-none bg-blue-500/5 relative group cursor-pointer hover:bg-blue-500/10 transition-colors">
                  <span className="text-xs tracking-wider text-muted-foreground mb-3 block">Global Scale</span>
                  <div className="font-display text-5xl font-bold tracking-tighter text-blue-500">50K+</div>
                  <div className="font-medium mt-2 text-foreground">Active Workspaces</div>
                </div>
                <div className="flex-1 p-8 flex flex-col justify-center rounded-xl lg:rounded-none bg-emerald-500/5 relative group cursor-pointer hover:bg-emerald-500/10 transition-colors">
                  <span className="text-xs tracking-wider text-muted-foreground mb-3 block">Security level</span>
                  <div className="font-display text-5xl font-bold tracking-tighter text-emerald-500">AES-256</div>
                  <div className="font-medium mt-2 text-foreground">Military Grade Auth</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative w-full bg-muted/30 p-4 md:p-8 mt-12 lg:mt-0 z-20">
          <div className="container mx-auto">
            <div className="relative max-w-6xl mx-auto rounded-xl border border-border bg-card overflow-hidden shadow-xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                <span className="ml-4 text-xs text-muted-foreground font-medium">Budget Buddy Dashboard</span>
              </div>
              <Image
                src={bottomImage.light}
                className="w-full h-auto dark:hidden"
                alt="Dashboard preview"
                width={1200}
                height={600}
                priority
              />
              <Image
                src={bottomImage.dark}
                className="w-full h-auto hidden dark:block"
                alt="Dashboard preview"
                width={1200}
                height={600}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
HeroSection.displayName = 'HeroSection';

export { HeroSection };
