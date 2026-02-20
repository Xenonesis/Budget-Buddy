'use client';

import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import { SOCIAL_LINKS, FOOTER_SECTIONS, TRUST_INDICATORS } from './config/landing-config';
import { scrollToTop } from './utils/scroll-utils';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="relative bg-paper border-t-4 border-foreground overflow-hidden pt-20 pb-8">
      {/* Brutalist structural background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5 z-0"
        style={{
          backgroundImage: `linear-gradient(45deg, hsl(var(--foreground)) 25%, transparent 25%, transparent 75%, hsl(var(--foreground)) 75%, hsl(var(--foreground))), linear-gradient(45deg, hsl(var(--foreground)) 25%, transparent 25%, transparent 75%, hsl(var(--foreground)) 75%, hsl(var(--foreground)))`,
          backgroundSize: `20px 20px`,
          backgroundPosition: `0 0, 10px 10px`
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Newsletter section */}
        <div className="mb-16 border-4 border-foreground bg-primary text-primary-foreground p-8 md:p-12 shadow-[16px_16px_0px_hsl(var(--foreground))] relative">
          <div className="absolute top-0 right-0 bg-foreground text-background font-mono font-bold text-xs uppercase tracking-widest px-4 py-2 border-b-4 border-l-4 border-foreground">
            TRANSMISSION SECURE
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground bg-background text-foreground font-mono font-bold text-sm uppercase tracking-widest mb-6 shadow-[4px_4px_0px_hsl(var(--foreground))]">
            <Sparkles className="w-4 h-4 text-action-primary" strokeWidth={3} />
            Stay Updated
          </div>

          <h3 className="text-4xl md:text-5xl font-display font-black mb-4 uppercase tracking-tighter text-foreground bg-background inline-block px-4 py-1 border-2 border-foreground">INTELLIGENCE BRIEFING</h3>
          <p className="font-bold font-mono mb-8 max-w-xl text-lg relative z-10 text-primary-foreground">
            SUBSCRIBE TO OUR SECURE NETWORK FOR PRODUCT UPDATES, TACTICAL FINANCIAL INSIGHTS, AND EARLY ACCESS TO NEW CAPABILITIES.
          </p>

          <div className="flex flex-col sm:flex-row gap-0 max-w-2xl">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              className="flex-1 px-6 py-4 border-4 border-foreground bg-background text-foreground font-mono font-bold uppercase placeholder:text-muted-foreground focus:outline-none focus:bg-paper transition-colors"
            />
            <button
              className="px-8 py-4 bg-foreground text-background font-display font-black uppercase text-xl border-y-4 border-r-4 border-l-4 sm:border-l-0 border-foreground hover:bg-background hover:text-foreground transition-all flex items-center justify-center gap-3"
            >
              SUBSCRIBE
              <ArrowUpRight className="w-6 h-6" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Footer top section with logo and quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 border-t-4 border-foreground pt-12">
          {/* Brand column */}
          <div className="lg:col-span-4 lg:pr-8 lg:border-r-4 border-foreground">
            <div className="flex flex-col items-start gap-4 mb-8">
              <div className="flex items-center gap-3 bg-foreground text-background px-4 py-2 border-2 border-foreground">
                <Logo size="sm" />
                <span className="font-display font-black text-2xl uppercase tracking-widest">
                  BUDGET BUDDY
                </span>
              </div>
            </div>

            <p className="font-mono font-bold text-foreground mb-8 text-sm uppercase border-l-4 border-primary pl-4 bg-foreground/5 py-2">
              THE FINANCIAL ARCHITECTURE FOR VISIONARIES WHO DEMAND ABSOLUTE CONTROL OVER THEIR CAPITAL DEPLOYMENT.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap gap-4 mb-10">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border-2 border-foreground bg-paper flex items-center justify-center text-foreground hover:bg-foreground hover:text-background shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_hsl(var(--foreground))] hover:translate-y-1 hover:translate-x-1 transition-all"
                  aria-label={social.label}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold uppercase">
              {TRUST_INDICATORS.map((indicator, idx) => (
                <div key={idx} className="flex items-center gap-2 border-2 border-foreground bg-background px-3 py-1">
                  {indicator.icon === 'pulse' ? (
                    <div className="w-3 h-3 bg-action-primary border border-foreground" />
                  ) : (
                    <Heart className="w-3 h-3 text-vermilion" strokeWidth={3} />
                  )}
                  <span>{indicator.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {FOOTER_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="space-y-6"
              >
                <h3 className="font-display font-black text-lg uppercase tracking-widest text-foreground border-b-4 border-foreground pb-2 inline-block">
                  {section.title}
                </h3>
                <ul className="space-y-4 font-mono font-bold text-sm uppercase">
                  {section.links.map((item) => (
                    <li key={item}>
                      <a
                        href={`/${section.title.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-muted-foreground hover:text-foreground hover:bg-foreground hover:text-background px-2 py-1 -ml-2 transition-colors inline-block"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-16 pt-8 border-t-4 border-foreground flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <p className="font-mono font-bold text-sm uppercase flex items-center gap-2 flex-wrap justify-center">
              © 2025 BUDGET BUDDY. FORGED WITH
              <Heart className="w-4 h-4 text-vermilion fill-vermilion" strokeWidth={2} />
              FOR ABSOLUTE DOMINANCE.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 md:border-l-4 border-foreground md:pl-6 text-xs font-mono font-bold uppercase">
              {[
                { href: '/legal/privacy-policy', text: 'PRIVACY' },
                { href: '/legal/terms-of-service', text: 'TERMS' },
                { href: '/legal/cookie-policy', text: 'COOKIES' },
              ].map((link) => (
                <a
                  key={link.text}
                  href={link.href}
                  className="bg-foreground text-background px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {link.text}
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <div className="border-2 border-foreground bg-paper p-1 shadow-[4px_4px_0px_hsl(var(--foreground))]">
              <ThemeToggle iconOnly />
            </div>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="h-12 w-12 border-2 border-foreground bg-primary text-primary-foreground flex items-center justify-center hover:bg-foreground hover:text-background transition-colors shadow-[4px_4px_0px_hsl(var(--foreground))] hover:shadow-[0px_0px_0px_transparent] hover:translate-y-1 hover:translate-x-1"
            >
              <ArrowUpRight className="w-6 h-6 -rotate-45" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
