'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'About', href: '#about' },
];

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
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
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
          {/* Logo with enhanced animation */}
          <motion.div
            className="flex items-center gap-3 relative z-50"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            whileHover={{ scale: 1.05 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-violet-500/20 blur-md group-hover:blur-lg transition-all duration-300" />
                <Logo size="sm" />
              </motion.div>
              <span className="font-bold text-xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hover:from-primary hover:to-violet-500 transition-all duration-300">
                Budget Buddy
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation with pill design */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-2 p-2 rounded-full bg-muted/30 backdrop-blur-sm border border-border/50">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300 rounded-full group"
                  onClick={() => scrollToSection(item.href.substring(1))}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10">{item.name}</span>
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100"
                    layoutId="navHover"
                    transition={{ duration: 0.2 }}
                  />
                </motion.button>
              ))}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                asChild
                className="relative border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                <Link href="/auth/login" prefetch={true}>
                  Sign in
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25"
              >
                <Link href="/auth/register" prefetch={true} className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2.5 rounded-xl bg-muted/50 backdrop-blur-sm border border-border/50 hover:bg-muted/70 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.div>
            </motion.button>
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
