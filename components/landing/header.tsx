'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './config/landing-config';
import { scrollToSection as scrollToSectionUtil } from './utils/scroll-utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50);
  });

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    scrollToSectionUtil(id, 80);
  };

  return (
    <>
      {/* Top Marquee for Editorial feel */}
      <div className="bg-primary text-primary-foreground border-b-2 border-foreground py-1 overflow-hidden relative z-[60]">
        <div className="whitespace-nowrap animate-marquee flex items-center font-mono text-xs font-bold tracking-widest uppercase">
          <span className="mx-4">🔥 NEXT GEN FINTECH</span>
          <span className="mx-4">•</span>
          <span className="mx-4">ZERO SOFT SHADOWS</span>
          <span className="mx-4">•</span>
          <span className="mx-4">100% BRUTAL</span>
          <span className="mx-4">•</span>
          <span className="mx-4">OWN YOUR WEALTH</span>
          <span className="mx-4">•</span>
          <span className="mx-4">🔥 NEXT GEN FINTECH</span>
          <span className="mx-4">•</span>
          <span className="mx-4">ZERO SOFT SHADOWS</span>
          <span className="mx-4">•</span>
          <span className="mx-4">100% BRUTAL</span>
          <span className="mx-4">•</span>
          <span className="mx-4">OWN YOUR WEALTH</span>
        </div>
      </div>

      <motion.header
        className={cn(
          'fixed w-full z-50 transition-all duration-300 border-b-2 border-foreground bg-paper/90 backdrop-blur-md',
          scrolled ? 'top-0' : 'top-6'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-stretch justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center border-r-2 border-transparent md:border-foreground pr-8">
              <Link href="/" className="flex items-center group">
                <span className="font-display font-bold text-2xl uppercase tracking-tighter text-foreground group-hover:text-primary transition-colors bg-foreground text-background px-3 py-1 group-hover:bg-primary group-hover:text-primary-foreground">
                  Budget Buddy
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 items-stretch">
              {NAV_ITEMS.map((item, index) => (
                <button
                  key={item.name}
                  className="px-6 flex items-center text-sm font-bold uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-colors border-r-2 border-foreground"
                  onClick={() => scrollToSection(item.href.substring(1))}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center pl-6 gap-4 border-l-2 border-transparent md:border-foreground ml-auto">
              <Link href="/auth/login" className="text-sm font-bold uppercase hover:underline underline-offset-4 tracking-widest mr-4">
                Sign in
              </Link>
              <Button asChild className="rounded-none border-2 border-transparent md:border-l-foreground h-full shadow-none hover:translate-y-0 active:translate-y-0 active:shadow-none hover:shadow-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background border-y-0 border-r-0">
                <Link href="/auth/register" prefetch={true} className="flex flex-row items-center gap-2 h-full">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center border-l-2 border-foreground pl-4 ml-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border-2 border-foreground bg-primary text-primary-foreground focus:outline-none shadow-[2px_2px_0px_hsl(var(--foreground))]"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-x-0 top-full bg-paper border-b-2 border-foreground z-[60] flex flex-col md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col border-t-2 border-foreground">
                {NAV_ITEMS.map((item, i) => (
                  <button
                    key={item.name}
                    className="flex text-left p-4 border-b-2 border-foreground text-lg font-bold uppercase tracking-widest hover:bg-foreground hover:text-background"
                    onClick={() => scrollToSection(item.href.substring(1))}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="p-6 bg-primary flex flex-col gap-4">
                <Button variant="outline" className="w-full justify-center bg-background border-2 border-foreground" asChild>
                  <Link href="/auth/login" prefetch={true}>
                    Sign in
                  </Link>
                </Button>
                <Button className="w-full justify-center border-2 border-foreground bg-foreground text-background" asChild>
                  <Link href="/auth/register" prefetch={true}>
                    Get started
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
