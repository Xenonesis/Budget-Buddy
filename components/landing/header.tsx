'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { NAV_ITEMS } from './config/landing-config';
import { scrollToSection as scrollToSectionUtil } from './utils/scroll-utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  // Handle scroll effect for background changes only
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 100);
  });

  // Scroll to section smoothly
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    scrollToSectionUtil(id, 100);
  };

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        // Force solid background on mobile, conditional on desktop
        'bg-background md:bg-transparent',
        scrolled
          ? 'md:bg-background/80 md:backdrop-blur-xl border-b border-border/50 shadow-lg'
          : 'md:bg-gradient-to-r md:from-background/20 md:via-background/10 md:to-background/20 md:backdrop-blur-sm',
        // Always solid on mobile when menu is open
        mobileMenuOpen ? 'bg-background shadow-lg border-b' : ''
      )}
      initial={{ y: -100 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Professional and clean */}
          <motion.div
            className="flex items-center gap-3 relative z-50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative transition-transform duration-200 group-hover:scale-105">
                <Logo size="sm" />
              </div>
              <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
                Budget Buddy
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation - Clean and professional */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-1">
              {NAV_ITEMS.map((item, index) => (
                <motion.button
                  key={item.name}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-accent"
                  onClick={() => scrollToSection(item.href.substring(1))}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Button variant="ghost" asChild className="font-medium">
                <Link href="/auth/login" prefetch={true}>
                  Sign in
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Button asChild className="font-medium">
                <Link href="/auth/register" prefetch={true} className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2.5 rounded-lg border border-border hover:bg-accent transition-colors duration-200"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (sliding panel) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-64 bg-background border-l z-[70] flex flex-col shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'hsl(var(--background))' }} // Force solid background
            >
              <div className="p-4 border-b flex justify-between items-center">
                <div className="font-bold">Navigation</div>
                <motion.button
                  onClick={() => setMobileMenuOpen(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
              </div>
              <div className="flex flex-col p-4 space-y-4">
                {['Features', 'Pricing', 'Testimonials', 'About', 'Contact'].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-2 border-b border-muted/40"
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5, color: 'var(--primary)' }}
                  >
                    <ChevronRight size={16} className="text-primary" /> {item}
                  </motion.a>
                ))}
              </div>
              <div className="mt-auto p-4 pb-safe pb-16 space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/auth/login" prefetch={true}>
                    <motion.span className="flex items-center gap-2" whileHover={{ x: 5 }}>
                      Sign in
                    </motion.span>
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/auth/register" prefetch={true}>
                    <motion.span className="flex items-center gap-2" whileHover={{ x: 5 }}>
                      Get started
                    </motion.span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
