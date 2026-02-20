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
      {/* Refined top banner */}
      <div className="bg-primary text-primary-foreground border-b border-primary/20 py-1.5 overflow-hidden relative z-[60]">
        <div className="whitespace-nowrap animate-marquee flex items-center text-xs font-medium tracking-wide">
          <span className="mx-4">✨ Smart budgeting for everyone</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">AI-powered insights</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">Bank-grade security</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">Real-time tracking</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">✨ Smart budgeting for everyone</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">AI-powered insights</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">Bank-grade security</span>
          <span className="mx-4 opacity-40">·</span>
          <span className="mx-4">Real-time tracking</span>
        </div>
      </div>

      <motion.header
        className={cn(
          'fixed w-full z-50 transition-all duration-300 border-b border-border bg-background/80 backdrop-blur-xl',
          scrolled ? 'top-0' : 'top-[30px]'
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center group">
                <span className="font-display font-bold text-xl tracking-tight text-foreground">
                  Budget Buddy
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.name}
                  className="px-4 py-2 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                  onClick={() => scrollToSection(item.href.substring(1))}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign in
              </Link>
              <Button asChild size="sm" className="rounded-lg">
                <Link href="/auth/register" prefetch={true} className="flex flex-row items-center gap-1.5">
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-foreground hover:bg-muted/50 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-x-0 top-full bg-background/95 backdrop-blur-xl border-b border-border z-[60] flex flex-col md:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col py-2">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.name}
                    className="flex text-left px-6 py-3 text-base font-medium text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => scrollToSection(item.href.substring(1))}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-border flex flex-col gap-3">
                <Button variant="outline" className="w-full justify-center" asChild>
                  <Link href="/auth/login" prefetch={true}>
                    Sign in
                  </Link>
                </Button>
                <Button className="w-full justify-center" asChild>
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
