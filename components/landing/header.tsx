"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "About", href: "#about" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 150], [0, -5]);

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
        behavior: "smooth"
      });
    }
  };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 bg-background/0"
      style={{
        backdropFilter: useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(8px)']),
        WebkitBackdropFilter: useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(8px)']),
        backgroundColor: useTransform(scrollY, [0, 100], ['rgba(var(--background-rgb), 0)', 'rgba(var(--background-rgb), 0.8)']),
        boxShadow: useTransform(scrollY, [0, 100], ['none', '0 4px 20px rgba(0,0,0,0.05)']),
        y: headerY
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="font-bold text-2xl flex items-center gap-2 flex"
          >
            <Link href="/" className="flex items-center gap-2 relative brand-link">
              <Logo size="md" withText textClassName="text-2xl" />
            </Link>
          </motion.div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <motion.a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(item.href.substring(1));
                }}
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </nav>

          {/* Sign in and Sign up buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                asChild
                className="relative overflow-hidden group"
              >
                <Link href="/auth/login">
                  <span className="relative z-10">Sign in</span>
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-md"
                    initial={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden rounded-md"
            >
              <Button
                asChild
                className="relative overflow-hidden"
              >
                <Link href="/auth/register" className="group">
                  <span className="relative z-10 flex items-center gap-1">
                    Get started
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </motion.div>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-primary-gradient"
                    animate={{
                      x: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 bg-primary/10 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              {mobileMenuOpen ? <X size={24} /> : <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Infinity, repeatType: "loop", duration: 5, repeatDelay: 3 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M4 6H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  />
                  <motion.path
                    d="M4 12H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  />
                  <motion.path
                    d="M4 18H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </svg>
              </motion.div>}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu (sliding panel) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-64 bg-background border-l z-50 flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
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
                {["Features", "Pricing", "Testimonials", "About", "Contact"].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-2 border-b border-muted/40"
                    onClick={() => setMobileMenuOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    whileHover={{ x: 5, color: "var(--primary)" }}
                  >
                    <ChevronRight size={16} className="text-primary" /> {item}
                  </motion.a>
                ))}
              </div>
              <div className="mt-auto p-4 space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/auth/login">
                    <motion.span
                      className="flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
                      Sign in
                    </motion.span>
                  </Link>
                </Button>
                <Button className="w-full justify-start" asChild>
                  <Link href="/auth/register">
                    <motion.span
                      className="flex items-center gap-2"
                      whileHover={{ x: 5 }}
                    >
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