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
      ctaText = 'START BUILDING',
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
        className={cn('relative min-h-[90vh] flex flex-col pt-32 lg:pt-40 overflow-hidden isolate border-b-2 border-foreground', className)}
        ref={ref}
        {...props}
      >
        {/* Architectural Background Grid */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: `40px 40px`,
            opacity: 0.08
          }}
        />

        <div className="container relative z-10 px-4 md:px-8 mx-auto flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 h-full">
            
            <div className="lg:col-span-8 flex flex-col justify-center items-start lg:pr-12 lg:border-r-2 lg:border-foreground/20 pb-12 lg:pb-0">
              <div className="inline-block bg-primary text-primary-foreground font-mono font-bold text-sm tracking-widest uppercase px-4 py-2 border-2 border-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] mb-8">
                {title}
              </div>
              
              <h1 className="font-display text-5xl md:text-7xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase text-foreground">
                <span className="block">{subtitle.regular}</span>
                <span className="block text-primary mix-blend-difference drop-shadow-[4px_4px_0px_hsl(var(--foreground))]">{subtitle.gradient}</span>
              </h1>
              
              <p className="mt-8 font-sans text-xl md:text-2xl max-w-2xl font-medium leading-relaxed bg-paper/50 inline-block p-2 border-2 border-transparent md:border-primary/20">
                {description}
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <Link
                  href={ctaHref}
                  className="group relative inline-flex items-center justify-center font-bold uppercase tracking-widest bg-foreground text-background px-8 py-5 text-lg shadow-[8px_8px_0px_hsl(var(--primary))] hover:shadow-[12px_12px_0px_hsl(var(--primary))] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-[0px_0px_0px_hsl(var(--primary))]"
                >
                  {ctaText}
                  <ArrowRight className="w-6 h-6 ml-4 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                </Link>
                
                <Link 
                  href="/demo" 
                  className="group inline-flex items-center justify-center font-bold uppercase tracking-widest bg-transparent text-foreground border-2 border-foreground px-8 py-5 text-lg hover:bg-foreground hover:text-background transition-all shadow-[8px_8px_0px_transparent] hover:-translate-y-1 hover:shadow-[12px_12px_0px_hsl(var(--foreground))] active:translate-y-1 active:shadow-[0px_0px_0px_hsl(var(--foreground))]"
                >
                  Live Demo
                </Link>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col lg:border-l-2 lg:border-foreground/20 lg:-ml-[2px] mt-8 lg:mt-0">
              {/* Info blocks in the sidebar */}
              <div className="h-full flex flex-col gap-4 lg:gap-0">
                <div className="flex-1 p-8 border-2 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b-2 border-foreground lg:border-foreground/20 flex flex-col justify-center bg-chartreuse/5 relative group cursor-pointer hover:bg-chartreuse transition-colors">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground mb-4 block">System Status</span>
                  <div className="font-display text-5xl font-bold tracking-tighter">100%</div>
                  <div className="font-sans font-bold mt-2 text-foreground">Operational Efficiency</div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-foreground transition-colors pointer-events-none" />
                </div>
                <div className="flex-1 p-8 border-2 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b-2 border-foreground lg:border-foreground/20 flex flex-col justify-center bg-int-blue/5 relative group cursor-pointer hover:bg-int-blue hover:text-white transition-colors">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-white/80 mb-4 block">Global Scale</span>
                  <div className="font-display text-5xl font-bold tracking-tighter group-hover:text-chartreuse">50K+</div>
                  <div className="font-sans font-bold mt-2 text-foreground group-hover:text-white">Active Workspaces</div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-foreground transition-colors pointer-events-none" />
                </div>
                <div className="flex-1 p-8 border-2 lg:border-t-0 lg:border-l-0 lg:border-r-0 lg:border-b-0 border-foreground flex flex-col justify-center bg-vermilion/5 relative group cursor-pointer hover:bg-vermilion hover:text-white transition-colors">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-white/80 mb-4 block">Security level</span>
                  <div className="font-display text-5xl font-bold tracking-tighter group-hover:text-background">AES-256</div>
                  <div className="font-sans font-bold mt-2 text-foreground group-hover:text-white">Military Grade Auth</div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-foreground transition-colors pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Placed with absolute structural intent */}
        <div className="relative w-full border-t-2 border-foreground bg-paper p-4 md:p-8 mt-12 lg:mt-0 z-20">
          <div className="container mx-auto">
            <div className="relative max-w-6xl mx-auto border-2 border-foreground bg-foreground p-1 shadow-[8px_8px_0px_hsl(var(--primary))] md:shadow-[16px_16px_0px_hsl(var(--primary))]">
              <div className="flex items-center gap-2 px-4 py-3 bg-paper border-b-2 border-foreground mb-1">
                <div className="w-3 h-3 rounded-full border-2 border-foreground" />
                <div className="w-3 h-3 rounded-full border-2 border-foreground" />
                <div className="w-3 h-3 rounded-full border-2 border-foreground bg-primary" />
                <span className="ml-4 font-mono text-xs text-foreground font-bold tracking-wider">TERMINAL // BUDGET-BUDDY</span>
              </div>
              <Image
                src={bottomImage.light}
                className="w-full h-auto dark:hidden filter contrast-125 saturate-50"
                alt="Dashboard preview"
                width={1200}
                height={600}
                priority
              />
              <Image
                src={bottomImage.dark}
                className="w-full h-auto hidden dark:block filter contrast-125 saturate-50"
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
