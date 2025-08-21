"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, useScroll, useTransform, useInView, useAnimation, AnimatePresence, useMotionValueEvent } from "framer-motion";
import {
  PieChart,
  LineChart,
  Wallet,
  TrendingUp,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  Star,
  Check,
  Sparkles,
  MousePointer,
  CreditCard,
  BarChart,
  Bell,
  Lock,
  CheckCircle,
  BadgeDollarSign,
  Users,
  Building,
  Lightbulb,
  Heart,
  Clock,
  Gift,
  BarChart2,
  ChevronDown,
  FileText,
  Settings,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  Zap,
  Target,
  Shield,
  DollarSign,
  TrendingDown,
  Plus,
  Minus,
  HelpCircle
} from "lucide-react";
import dynamic from 'next/dynamic';
import { supabase } from "@/lib/supabase";
import { useUserPreferences } from "@/lib/store";
import { Logo } from "@/components/ui/logo";

// Loading placeholders for animation components
const BubblePlaceholder = () => <div className="absolute inset-0 bg-primary/5 opacity-30 rounded-full"></div>;

// Dynamically import animation components for better performance
const HeroBubbles = dynamic(() => import('./page-animations').then(mod => mod.HeroBubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

const FeatureBubbles = dynamic(() => import('./page-animations').then(mod => mod.FeatureBubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

const TestimonialBubbles = dynamic(() => import('./page-animations').then(mod => mod.TestimonialBubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

const CTABubbles = dynamic(() => import('./page-animations').then(mod => mod.CTABubbles), {
  ssr: false,
  loading: () => <BubblePlaceholder />
});

// Parallax wrapper component
const ParallaxWrapper: React.FC<{ children: React.ReactNode; speed?: number }> = ({ children, speed = 0.05 }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <motion.div
      ref={ref}
      style={{ y }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 50], [1, 0.98]);
  const headerBlur = useTransform(scrollY, [0, 50], ['0px', '8px']);
  const headerY = useTransform(scrollY, [0, 150], [0, -5]);
  const headerScale = useTransform(scrollY, [0, 150], [1, 0.98]);
  const heroRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  useEffect(() => {
    // Throttle scroll events for better performance
    let lastScrollUpdate = 0;
    const scrollThrottleDelay = 50; // Only update every 50ms

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollUpdate < scrollThrottleDelay) return;

      lastScrollUpdate = now;
      setIsScrolled(window.scrollY > 10);
    };

    // Use passive event listener for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Throttle mouse move events for better performance
    let lastUpdate = 0;
    const throttleDelay = 50; // Only update every 50ms

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdate < throttleDelay) return;

      lastUpdate = now;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) - 0.5;
      const y = (clientY / window.innerHeight) - 0.5;
      setMousePosition({ x, y });
    };

    // Use passive event listener for better performance
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header with scroll-based animation */}
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
              className={`font-bold text-2xl flex items-center gap-2 ${mobileMenuOpen ? 'md:flex hidden' : 'flex'}`}
              onHoverStart={() => setIsLogoHovered(true)}
              onHoverEnd={() => setIsLogoHovered(false)}
            >
              <Link href="/" className="flex items-center gap-2 relative brand-link">
                <Logo size="md" withText textClassName="text-2xl" />
              </Link>
            </motion.div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "Features", href: "#features" },
                { name: "Pricing", href: "#pricing" },
                { name: "Testimonials", href: "#testimonials" },
                { name: "About", href: "#about" },
              ].map((item) => (
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
                        <ArrowRight className="h-4 w-4 ml-1" />
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
      </motion.header>

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

      {/* Hero section */}
      <section className="relative overflow-hidden border-b bg-gradient-hero pt-24 md:pt-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-30">
            {/* Replace random bubbles with client component */}
            <HeroBubbles />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 hidden md:flex flex-col items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
        >
          <motion.span
            className="text-xs text-muted-foreground mb-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Scroll to explore
          </motion.span>
          <motion.div
            className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-center justify-center p-1"
            animate={{ boxShadow: ["0 0 0 rgba(var(--primary-rgb), 0)", "0 0 10px rgba(var(--primary-rgb), 0.3)", "0 0 0 rgba(var(--primary-rgb), 0)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1.5 h-1.5 bg-primary rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>

        <div className="container mx-auto relative">
          <div className="flex flex-col lg:flex-row items-center py-12 md:py-20 lg:py-32 gap-12 px-4">
            <motion.div
              className="flex-1 max-w-2xl text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-glass text-primary w-fit mb-6 border-animated shadow-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(var(--primary-rgb), 0.15)" }}
              >
                <span className="text-xs font-semibold">New Feature</span>
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <span className="text-xs">AI-Powered Budget Recommendations</span>
                <motion.div
                  className="ml-1 animate-float"
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 2,
                    repeatDelay: 2
                  }}
                >
                  <Sparkles className="h-3 w-3 text-primary" />
                </motion.div>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="block mb-2">Smart financial tracking for</span>
                <span className="text-gradient-hero relative inline-block">
                  modern living
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-[3px] bg-primary/40 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                  />
                </span>
              </motion.h1>

              <motion.p
                className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Effortlessly manage your finances, track expenses, and reach your savings goals with our <span className="text-foreground font-medium">intuitive budget tracking platform</span>. Take control of your financial future today.
              </motion.p>

              <motion.div
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative"
                >
                  <motion.div
                    className="absolute -inset-1 bg-primary/20 blur-md rounded-lg opacity-0"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop",
                      repeatDelay: 3
                    }}
                  />
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-6 text-base font-semibold group relative overflow-hidden btn-gradient glow-on-hover shadow-lg"
                  >
                    <Link href="/auth/register">
                      <span className="relative z-10 flex items-center">
                        Get Started — Free
                        <motion.div
                          animate={{
                            x: [0, 3, 0],
                            opacity: [1, 0.8, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                          className="ml-2"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-primary/10"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "100%" }}
                        transition={{ duration: 0.5 }}
                      />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="gap-2 px-8 py-6 text-base font-semibold group border-animated backdrop-blur-sm"
                  >
                    <Link href="#features">
                      See all features
                      <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-8 pt-4 border-t flex flex-col sm:flex-row sm:items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <div className="flex -space-x-3 relative">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className={`w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br ${
                        i === 1 ? 'from-violet-400 to-indigo-500' :
                        i === 2 ? 'from-blue-400 to-violet-500' :
                        i === 3 ? 'from-indigo-400 to-purple-500' :
                        'from-purple-400 to-violet-500'
                      } flex items-center justify-center text-white text-xs font-medium shadow-md`}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9 + (i * 0.1), duration: 0.3 }}
                      whileHover={{ y: -3, scale: 1.1, zIndex: 10 }}
                    >
                      {['JD', 'AK', 'MR', 'SL'][i-1]}
                      <span className="sr-only">User Avatar</span>
                    </motion.div>
                  ))}
                  <motion.div
                    className="w-10 h-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-primary text-xs font-medium -ml-3 shadow-md"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.3 }}
                    whileHover={{ y: -3, scale: 1.1, zIndex: 10 }}
                  >
                    +950
                  </motion.div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">1,000+</span> people have signed up this month
                  <motion.div
                    className="h-1 w-0 bg-primary/20 rounded-full mt-1"
                    animate={{ width: "100%" }}
                    transition={{ delay: 1.5, duration: 1 }}
                  />
                </div>
                <motion.div
                  className="ml-auto hidden sm:flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                >
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-medium">4.9/5 rating</span>
                  <span className="text-muted-foreground">(230+ reviews)</span>
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex-1 w-full max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="relative rounded-2xl shadow-2xl">
                <motion.div
                  className="absolute -inset-1 bg-gradient-animated opacity-30 blur-sm rounded-2xl"
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 opacity-0"
                  animate={{
                    opacity: [0, 0.5, 0],
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 5,
                    repeatDelay: 3,
                    ease: "easeInOut"
                  }}
                />
                <div className="relative rounded-2xl overflow-hidden border bg-glass backdrop-blur-sm">
                  <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
                    <div className="font-semibold flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
                        className="bg-primary/10 rounded-full p-1.5"
                      >
                        <PieChart className="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                      <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                        Monthly Budget Overview
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm"
                        whileHover={{ scale: 1.5 }}
                      />
                      <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm"
                        whileHover={{ scale: 1.5 }}
                      />
                      <motion.div
                        className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"
                        whileHover={{ scale: 1.5 }}
                      />
                    </div>
                  </div>
                  <div className="p-6 relative">
                    <motion.div
                      className="absolute top-2 right-2 opacity-10 text-primary"
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 20,
                        ease: "linear"
                      }}
                    >
                      <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM50 90C27.9 90 10 72.1 10 50C10 27.9 27.9 10 50 10C72.1 10 90 27.9 90 50C90 72.1 72.1 90 50 90Z" fill="currentColor"/>
                        <path d="M50 20C33.5 20 20 33.5 20 50C20 66.5 33.5 80 50 80C66.5 80 80 66.5 80 50C80 33.5 66.5 20 50 20ZM50 70C39 70 30 61 30 50C30 39 39 30 50 30C61 30 70 39 70 50C70 61 61 70 50 70Z" fill="currentColor"/>
                      </svg>
                    </motion.div>
                    <div className="flex flex-col sm:flex-row justify-between mb-10 border border-primary/10 bg-card/60 p-5 rounded-xl shadow-sm backdrop-blur-sm">
                      <motion.div
                        className="relative overflow-hidden p-3 rounded-lg bg-background/30 mb-4 sm:mb-0"
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--background-rgb), 0.5)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-primary/10 p-1 rounded-full">
                            <Wallet className="h-3 w-3 text-primary" />
                          </div>
                          <div className="text-sm font-medium">Total Budget</div>
                        </div>
                        <motion.div
                          className="text-2xl font-bold flex items-baseline gap-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.4 }}
                        >
                          <span className="text-gradient-primary">$4,250</span>
                          <span className="text-xs text-muted-foreground">.00</span>
                        </motion.div>
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-full"
                          animate={{
                            scaleX: [0, 1],
                            opacity: [0, 1]
                          }}
                          transition={{ duration: 1, delay: 0.8 }}
                        />
                      </motion.div>
                      <motion.div
                        className="relative overflow-hidden p-3 rounded-lg bg-background/30"
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(var(--background-rgb), 0.5)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="bg-primary/10 p-1 rounded-full">
                            <CreditCard className="h-3 w-3 text-primary" />
                          </div>
                          <div className="text-sm font-medium">Spent</div>
                        </div>
                        <motion.div
                          className="text-2xl font-bold flex items-baseline gap-1"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7, duration: 0.4 }}
                        >
                          <span className="text-gradient-primary">$2,840</span>
                          <span className="text-xs text-muted-foreground">.50</span>
                        </motion.div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="text-xs text-green-500 flex items-center">
                            <motion.div
                              animate={{ y: [0, -1, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                              ↓
                            </motion.div>
                            <span className="ml-1">33% of budget</span>
                          </div>
                        </div>
                        <motion.div
                          className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/30 to-violet-500/30 rounded-full"
                          animate={{
                            scaleX: [0, 1],
                            opacity: [0, 1]
                          }}
                          transition={{ duration: 1, delay: 0.9 }}
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      className="flex items-center justify-between mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Wallet className="h-4 w-4 text-primary" />
                        <span>Categories</span>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-full">
                        {Math.floor(2840/4250 * 100)}% used
                      </div>
                    </motion.div>

                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <motion.div
                          className="flex items-center gap-2 text-sm font-medium bg-primary/5 px-3 py-1.5 rounded-full"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8, duration: 0.4 }}
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary-rgb), 0.1)" }}
                        >
                          <BarChart2 className="h-3.5 w-3.5 text-primary" />
                          <span>Top Categories</span>
                        </motion.div>
                        <motion.div
                          className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded-full"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8, duration: 0.4 }}
                        >
                          {Math.floor(2840/4250 * 100)}% of budget used
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { category: "Housing", amount: "$1,200", percentage: 75, icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 12h3v9h16v-9h3L12 2z"></path></svg>, color: "from-blue-400 to-indigo-500" },
                          { category: "Food & Dining", amount: "$620", percentage: 60, icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M11 7h2v7h-2zm1-5a10 10 0 100 20z"></path></svg>, color: "from-green-400 to-emerald-500" },
                          { category: "Transportation", amount: "$450", percentage: 90, icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18 15H6v-2h12v2zM4 19h16v-2H4v2zM16 8l-4-4-4 4h2v4h4V8h2z"></path></svg>, color: "from-red-400 to-rose-500" },
                          { category: "Entertainment", amount: "$320", percentage: 40, icon: <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V6z"></path><path d="M17 14c0 2.76-2.24 5-5 5s-5-2.24-5-5h-2c0 3.53 2.61 6.43 6 6.92V22h2v-1.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>, color: "from-amber-400 to-yellow-500" }
                        ].map((item, idx) => (
                          <motion.div
                            key={item.category}
                            className="bg-card/30 rounded-lg p-3 border border-primary/5 space-y-2 card-hover-effect backdrop-blur-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + (idx * 0.1), duration: 0.4 }}
                            whileHover={{
                              y: -3,
                              backgroundColor: "rgba(var(--card), 0.8)",
                              borderColor: "rgba(var(--primary), 0.2)",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                            }}
                          >
                            <div className="flex justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className={`bg-gradient-to-br ${item.color} rounded-full p-1.5 text-white shadow-sm`}>
                                  {item.icon}
                                </div>
                                <span className="font-medium">{item.category}</span>
                              </div>
                              <span className="font-semibold">{item.amount}</span>
                            </div>
                            <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden relative">
                              <motion.div
                                className={`h-full bg-gradient-to-r ${item.color} transition-all`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ delay: 1 + (idx * 0.1), duration: 0.7, ease: "easeOut" }}
                              />
                              <motion.div
                                className="absolute top-0 right-0 bottom-0 bg-white opacity-30 w-[5px]"
                                animate={{
                                  left: ["100%", `${item.percentage}%`],
                                  opacity: [0, 0.5, 0]
                                }}
                                transition={{
                                  delay: 1.4 + (idx * 0.1),
                                  duration: 0.8,
                                  ease: "easeOut",
                                  times: [0, 0.8, 1]
                                }}
                              />
                            </div>
                            <div className="flex justify-end text-xs text-muted-foreground">
                              {item.percentage}% of category budget
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      className="absolute bottom-3 right-3"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        x: [0, 5, 0],
                        y: [0, 5, 0],
                      }}
                      transition={{
                        delay: 1.5,
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity
                      }}
                    >
                      <MousePointer className="h-5 w-5 text-muted-foreground/40" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="flex flex-wrap justify-center gap-8 pb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {['Trusted by thousands', 'Bank-level security', '99.9% uptime', 'Free starter plan'].map((item, idx) => (
              <motion.div
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground glow-on-hover bg-glass py-1 px-3 rounded-full"
                whileHover={{ scale: 1.05, color: "var(--primary)" }}
                transition={{ duration: 0.2 }}
              >
                <Check size={16} className="text-primary" />
                <span>{item}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features section - "Everything you need to manage your money" */}
      <section id="features" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-20"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 15,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Replace random decorative elements with client component */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FeatureBubbles />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 relative"
                animate={{
                  textShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 8px rgba(var(--primary-rgb), 0.3)", "0px 0px 0px rgba(0,0,0,0)"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                Everything you need to <span className="text-gradient-primary relative inline-block">
                  manage your money
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary/30 rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  />
                </span>
              </motion.h2>
            </motion.div>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Powerful tools to help you take control of your finances and achieve your financial goals.
            </motion.p>
          </motion.div>

            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const featureRef = useRef(null);
              const isInView = useInView(featureRef, { once: true, amount: 0.3 });

              return (
                <motion.div
                  key={feature.title}
                  ref={featureRef}
                  className="relative group p-6 bg-background/10 backdrop-blur rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute -inset-4 scale-95 bg-gradient-to-r from-primary/5 to-primary/0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    animate={isInView ? {
                      scale: [0.95, 1],
                      opacity: [0, 0.2, 0],
                    } : {}}
                    transition={{
                      delay: index * 0.1 + 0.3,
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      repeatDelay: 2
                    }}
                  />
                  
                  {/* Highlight Badge */}
                  <motion.div
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-primary to-violet-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.4 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {feature.highlight}
                  </motion.div>

                  <div className="flex items-start gap-5 sm:block">
                    <motion.div
                      className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary relative overflow-hidden"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        className="absolute inset-0 bg-primary"
                        initial={{ y: "100%" }}
                        whileHover={{ y: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                      <motion.div
                        className="relative z-10"
                        whileHover={{ scale: 1.1, color: "white" }}
                        animate={isInView ? {
                          y: [5, 0],
                          opacity: [0, 1]
                        } : {}}
                        transition={{
                          delay: index * 0.1 + 0.1,
                          duration: 0.5
                        }}
                      >
                        {feature.icon}
                      </motion.div>
                    </motion.div>

                    <div className="sm:mt-5">
                      <motion.h3
                        className="text-xl font-semibold mb-3"
                        initial={{ opacity: 0 }}
                        animate={isInView ? {
                          opacity: 1,
                          y: [5, 0]
                        } : {}}
                        transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                      >
                        {feature.title}
                      </motion.h3>

                      <motion.p
                        className="text-muted-foreground mb-4"
                        initial={{ opacity: 0 }}
                        animate={isInView ? {
                          opacity: 1,
                          y: [5, 0]
                        } : {}}
                        transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      >
                        {feature.description}
                      </motion.p>

                      {/* Benefits List */}
                      <motion.div
                        className="space-y-2 mb-4"
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                      >
                        {feature.benefits.map((benefit, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: index * 0.1 + 0.4 + (idx * 0.1), duration: 0.3 }}
                          >
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-primary"
                              whileHover={{ scale: 1.5 }}
                            />
                            <span className="text-muted-foreground">{benefit}</span>
                          </motion.div>
                        ))}
                      </motion.div>

                      <motion.div
                        className="h-0.5 w-0 bg-gradient-to-r from-primary/40 to-primary/0 rounded-full"
                        initial={{ width: 0 }}
                        animate={isInView ? { width: "3rem" } : {}}
                        transition={{ delay: index * 0.1 + 0.6, duration: 0.6 }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="mt-24 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <div className="grid md:grid-cols-2">
              <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                <motion.h3
                  className="text-2xl font-bold mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-gradient-primary">Advanced Budget Analytics</span>
                </motion.h3>
                <motion.p
                  className="text-muted-foreground mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  Get powerful insights into your spending patterns with our intuitive analytics dashboard. Identify trends, spot opportunities to save, and make data-driven financial decisions.
                </motion.p>
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  {[
                    { title: "Personalized Insights", description: "Tailored recommendations based on your spending habits" },
                    { title: "Smart Categories", description: "Customizable and automatically organized expense groups" },
                    { title: "Goal Tracking", description: "Visual progress meters toward your financial objectives" },
                    { title: "Monthly Reports", description: "Detailed breakdowns and year-over-year comparisons" }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-start gap-2 group"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                      whileHover={{ x: 5 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.4, type: "spring" }}
                        className="mt-1 flex-shrink-0 rounded-full p-1 bg-primary/10 text-primary"
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: "var(--primary)",
                          color: "white"
                        }}
                      >
                        <Check size={12} />
                      </motion.div>
                      <div>
                        <div className="font-medium text-sm group-hover:text-primary transition-colors">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative overflow-hidden rounded-md"
                >
                  <Button asChild variant="outline" className="w-fit group relative z-10 border-primary/30">
                    <Link href="/auth/register">
                      <motion.span
                        className="flex items-center gap-2 text-primary"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        Try analytics now
                        <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                      </motion.span>
                    </Link>
                  </Button>
                  <motion.div
                    className="absolute inset-0 bg-primary/5"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </div>
              <motion.div
                className="bg-muted/30 p-6 flex items-center justify-center order-1 md:order-2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <ParallaxWrapper>
                  <div className="rounded-lg border bg-glass p-4 shadow-md max-w-md w-full relative">
                    {/* Background design elements */}
                    <motion.div
                      className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 6,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute -left-16 -bottom-16 w-32 h-32 bg-primary/5 rounded-full"
                      animate={{
                        scale: [1.1, 0.9, 1.1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 5,
                        ease: "easeInOut"
                      }}
                    />

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between relative z-10">
                      <motion.div
                        className="flex items-center gap-2"
                        initial={{ x: -20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 360]
                          }}
                          transition={{
                            duration: 20,
                            ease: "linear",
                            repeat: Infinity
                          }}
                        >
                          <BarChart className="h-5 w-5 text-primary" />
                        </motion.div>
                        <h4 className="font-semibold">Your Spending Analysis</h4>
                      </motion.div>

                      <motion.div
                        className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                        initial={{ x: 20, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "var(--primary)",
                          color: "white"
                        }}
                      >
                        <span className="relative z-10">Last Quarter</span>
                      </motion.div>
                    </div>

                    {/* Stats row */}
                    <motion.div
                      className="grid grid-cols-2 gap-3 mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <motion.div
                        className="bg-background/50 rounded-lg p-3 border border-border/50"
                        whileHover={{ y: -2, backgroundColor: "var(--background)" }}
                      >
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" /> Total Spending
                        </div>
                        <div className="text-xl font-bold">$4,280<span className="text-xs font-normal text-muted-foreground">.50</span></div>
                        <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <motion.div animate={{ y: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>↓</motion.div> 12% from last period
                        </div>
                      </motion.div>

                      <motion.div
                        className="bg-background/50 rounded-lg p-3 border border-border/50"
                        whileHover={{ y: -2, backgroundColor: "var(--background)" }}
                      >
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <LineChart className="h-3 w-3" /> Avg. Monthly
                        </div>
                        <div className="text-xl font-bold">$1,426<span className="text-xs font-normal text-muted-foreground">.83</span></div>
                        <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <motion.div animate={{ x: [0, 1, 0, -1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>↔</motion.div> Stable spending
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Spending breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium">Top Categories</div>
                        <div className="text-xs text-muted-foreground">% of total</div>
                      </div>

                      {[
                        { name: "Housing", percentage: 35, color: "bg-blue-500" },
                        { name: "Food & Dining", percentage: 22, color: "bg-purple-500" },
                        { name: "Transportation", percentage: 18, color: "bg-green-500" },
                        { name: "Entertainment", percentage: 12, color: "bg-amber-500" }
                      ].map((category, idx) => (
                        <motion.div
                          key={category.name}
                          className="mb-3 last:mb-0"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + (idx * 0.1), duration: 0.4 }}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div className="text-xs flex items-center gap-1.5">
                              <motion.div
                                className={`h-2 w-2 rounded-full ${category.color}`}
                                whileHover={{ scale: 1.5 }}
                                transition={{ duration: 0.2 }}
                              />
                              {category.name}
                            </div>
                            <div className="text-xs font-medium">{category.percentage}%</div>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${category.color}`}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${category.percentage}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 + (idx * 0.1), duration: 0.7, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* AI Insights */}
                    <motion.div
                      className="mt-5 pt-4 border-t flex flex-col gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="text-xs font-medium flex items-center gap-1.5">
                        <motion.div
                          animate={{
                            rotate: [0, 0, 0, 10, -10, 0, 0],
                            scale: [1, 1, 1, 1.1, 1.1, 1, 1]
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 4,
                            repeatDelay: 3
                          }}
                        >
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                        </motion.div>
                        <span>AI-Powered Insights</span>
                      </div>
                      <motion.div
                        className="text-xs text-muted-foreground bg-primary/5 p-2 rounded"
                        whileHover={{ backgroundColor: "var(--primary-10)" }}
                      >
                        Food expenses increased by 8% this month. Consider setting a specific dining budget.
                      </motion.div>
                    </motion.div>
                  </div>
                </ParallaxWrapper>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials section */}
      <section id="testimonials" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent opacity-30"
          animate={{
            y: ["0%", "100%"],
          }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        {/* Add client component for testimonial bubbles */}
        <div className="absolute inset-0 opacity-60">
          <TestimonialBubbles />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h3
              className="text-sm text-primary font-medium uppercase tracking-wider mb-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              Testimonials
            </motion.h3>
            <motion.h2
              className="text-3xl font-bold tracking-tight sm:text-4xl mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Hear what our users are saying
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Real stories from real people who have taken control of their finances with our platform.
            </motion.p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.name}
                className="flex flex-col h-full bg-glass border rounded-xl p-6 relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px -15px rgba(0,0,0,0.1)" }}
              >
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/5 via-primary/40 to-primary/5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                />

                <div className="mb-4 flex">
                  {[...Array(5)].map((_, starIdx) => (
                    <motion.div
                      key={starIdx}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: idx * 0.1 + 0.3 + starIdx * 0.05,
                        duration: 0.3,
                        type: "spring"
                      }}
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </motion.div>
                  ))}
                </div>

                <motion.blockquote
                  className="flex-1 mb-4 text-muted-foreground relative"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.3, duration: 0.5 }}
                >
                  <motion.span
                    className="absolute -top-2 -left-1 text-4xl text-primary/20"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                  >
                    "
                  </motion.span>
                  {testimonial.quote}
                </motion.blockquote>

                <motion.div
                  className="flex items-center mt-auto"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.4, duration: 0.5 }}
                >
                  <motion.img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full mr-3 border-2 border-primary/20"
                    whileHover={{ scale: 1.1, borderColor: "var(--primary)" }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 + 0.5, duration: 0.4 }}
                  />
                  <div>
                    <motion.div
                      className="font-medium"
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 + 0.5, duration: 0.3 }}
                    >
                      {testimonial.name}
                    </motion.div>
                    <motion.div
                      className="text-sm text-muted-foreground"
                      initial={{ opacity: 0, y: 5 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 + 0.6, duration: 0.3 }}
                    >
                      {testimonial.title}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20"></div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            className="max-w-xl mx-auto text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Start for free, upgrade when you need more features.
              </p>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-start">
            {[
              {
                title: "Free",
                price: "$0",
                description: "Perfect for getting started with basic budgeting",
                features: [
                  "Up to 3 budget categories",
                  "Basic expense tracking",
                  "Monthly spending reports",
                  "Email support"
                ],
                cta: "Get Started",
                popular: false
              },
              {
                title: "Premium",
                price: "$9.99",
                per: "month",
                description: "Everything you need for serious money management",
                features: [
                  "Unlimited categories",
                  "Advanced analytics dashboard",
                  "Custom budget goals",
                  "Recurring expenses",
                  "Priority support",
                  "Bank account sync"
                ],
                cta: "Upgrade to Premium",
                popular: true
              },
              {
                title: "Family",
                price: "$19.99",
                per: "month",
                description: "Manage finances together with your family",
                features: [
                  "All Premium features",
                  "Up to 5 user accounts",
                  "Shared budget categories",
                  "Family spending insights",
                  "Bill splitting",
                  "Dedicated support"
                ],
                cta: "Start Family Plan",
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={index}
                className={`bg-card rounded-xl border ${plan.popular ? 'border-primary shadow-lg' : 'shadow-sm'} overflow-hidden flex flex-col`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -10,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
              >
                {plan.popular && (
                  <motion.div
                    className="bg-primary/10 text-primary text-center text-sm font-medium py-1 relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary/10"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2
                      }}
                    />
                    <span className="relative z-10">Most Popular</span>
                  </motion.div>
                )}
                <div className="p-6 md:p-8 flex-1">
                  <div className="font-semibold text-lg mb-2">{plan.title}</div>
                  <motion.div
                    className="flex items-baseline gap-1 mb-4"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                  >
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.per && <span className="text-muted-foreground">/{plan.per}</span>}
                  </motion.div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <motion.div
                        key={feature}
                        className="flex items-start gap-2 text-sm group"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.2 + idx * 0.05, duration: 0.4 }}
                      >
                        <motion.div
                          whileHover={{ rotate: 180, backgroundColor: "var(--primary)" }}
                          transition={{ duration: 0.3 }}
                          className="mt-0.5 flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center bg-primary/10"
                        >
                          <Check size={10} className="text-primary group-hover:text-white" />
                        </motion.div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="px-6 pb-8">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      asChild
                      className="w-full relative overflow-hidden"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <Link href="/auth/register">
                        <motion.span
                          className="absolute inset-0 bg-primary/10"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10">{plan.cta}</span>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="max-w-3xl mx-auto mt-16 p-6 bg-muted/30 rounded-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="font-medium mb-2">Need a custom solution?</div>
            <p className="text-muted-foreground text-sm mb-4">
              Contact us for tailored enterprise solutions with advanced features and dedicated support.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button variant="outline" size="sm">Contact Sales</Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-gradient-to-br from-muted/30 to-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <motion.div
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary w-fit mb-6 mx-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
            >
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-semibold">Simple, Transparent Pricing</span>
            </motion.div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose the perfect plan for your{" "}
              <span className="text-gradient-primary">financial journey</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as your needs grow. All plans include our core features with no hidden fees.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                className={`relative rounded-2xl border bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? 'border-primary/50 scale-105' : 'border-border/50'
                }`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.4 }}
                  >
                    <div className="bg-gradient-to-r from-primary to-violet-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </motion.div>
                )}

                <div className="p-6 md:p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <motion.div
                      className="flex items-baseline justify-center gap-1 mb-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.4 }}
                    >
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                    </motion.div>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                    {plan.savings && (
                      <motion.div
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.4, duration: 0.4 }}
                      >
                        <TrendingDown className="h-3 w-3" />
                        {plan.savings}
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        className="flex items-start gap-3 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + 0.3 + (idx * 0.05), duration: 0.3 }}
                      >
                        <motion.div
                          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center"
                          whileHover={{ scale: 1.2, backgroundColor: "var(--primary)" }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check className="h-2.5 w-2.5 text-primary" />
                        </motion.div>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                    
                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="pt-3 border-t border-border/50">
                        {plan.limitations.map((limitation, idx) => (
                          <motion.div
                            key={idx}
                            className="flex items-start gap-3 text-sm text-muted-foreground"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.5 + (idx * 0.05), duration: 0.3 }}
                          >
                            <div className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-muted/20 flex items-center justify-center">
                              <Minus className="h-2.5 w-2.5 text-muted-foreground" />
                            </div>
                            <span>{limitation}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      asChild
                      className={`w-full relative overflow-hidden ${
                        plan.popular ? 'bg-primary hover:bg-primary/90' : ''
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      <Link href="/auth/register">
                        <motion.span
                          className="absolute inset-0 bg-primary/10"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                        <span className="relative z-10">{plan.cta}</span>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="max-w-3xl mx-auto mt-16 p-6 bg-muted/30 rounded-xl text-center border border-border/50"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Building className="h-5 w-5 text-primary" />
              <span className="font-semibold">Enterprise Solutions</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Need custom features, dedicated support, or enterprise-grade security? We offer tailored solutions for organizations of all sizes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Sales
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="ghost" size="sm" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Schedule Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 md:py-24 bg-gradient-cta text-white relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Gradient Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-primary/80"
            animate={{
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              duration: 15,
              ease: "linear",
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />

          <div className="absolute top-0 left-0 right-0 h-px bg-white/30"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-white/30"></div>

          {/* Replace random elements with fixed CTABubbles */}
          <CTABubbles />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to take control of your finances?</h2>
            <p className="mb-8 text-lg text-white/90">Sign up now and start budgeting like a pro with our AI-powered tools.</p>
            <div className="grid md:grid-cols-5 gap-8 items-center">
              <motion.div
                className="md:col-span-3 text-center md:text-left"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="inline-block px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6 border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <motion.span
                    animate={{
                      color: ["rgba(255,255,255,0.9)", "rgba(255,255,255,1)", "rgba(255,255,255,0.9)"]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Join 10,000+ happy users</span>
                  </motion.span>
                </motion.div>

                <motion.h2
                  className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <motion.span
                    className="absolute -left-4 md:-left-8 top-0 text-6xl opacity-20"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 0.2, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    "
                  </motion.span>
                  Ready to take control of your{" "}
                  <motion.span
                    className="relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80"
                    initial={{ color: "white" }}
                    animate={{
                      textShadow: ["0 0 10px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.5)", "0 0 10px rgba(255,255,255,0)"]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    finances?
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    />
                  </motion.span>
                </motion.h2>

                <motion.p
                  className="mb-8 text-lg text-white/90 max-w-xl mx-auto md:mx-0 relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.span
                    className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-white/40 to-transparent rounded-full"
                    initial={{ height: 0 }}
                    whileInView={{ height: "100%" }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  />
                  Start your journey to financial freedom today. Our powerful tools make
                  budgeting simple, intuitive, and even enjoyable. Join thousands who've
                  already transformed their financial future.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <motion.div
                    className="group relative overflow-hidden rounded-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/70 to-pink-500/70 group-hover:from-purple-500/90 group-hover:to-pink-500/90 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    />
                    <motion.div
                      className="absolute -inset-full h-40 w-40 z-0 rotate-45 transform bg-white opacity-20 group-hover:opacity-30 transition-opacity blur-xl"
                      animate={{
                        left: ["-120%", "200%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    />
                    <Button asChild size="lg" className="bg-transparent text-white hover:bg-transparent border-0 px-10 py-6 relative z-10 shadow-lg">
                      <Link href="/auth/register">
                        <motion.span
                          className="flex items-center gap-3 text-lg"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          Get Started — Free
                          <ArrowRight className="h-5 w-5" />
                        </motion.span>
                      </Link>
                    </Button>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="relative overflow-hidden rounded-xl"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors duration-300"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    />
                    <Button asChild variant="outline" size="lg" className="border-white/40 text-white hover:text-white hover:bg-transparent px-10 py-6 backdrop-blur-sm relative z-10">
                      <Link href="/dashboard">
                        <motion.span
                          className="flex items-center gap-3 text-lg"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          View Demo
                          <motion.div
                            animate={{
                              x: [0, 4, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              repeatType: "reverse",
                            }}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </motion.div>
                        </motion.span>
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Stats/Testimonial Card */}
              <motion.div
                className="md:col-span-2 perspective"
                initial={{ opacity: 0, scale: 0.95, rotateY: 5 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                whileHover={{ scale: 1.02, rotateY: -2 }}
              >
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl border border-white/20 p-6 shadow-2xl relative overflow-hidden">
                  <motion.div
                    className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full filter blur-3xl opacity-50"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-full filter blur-3xl opacity-50"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />

                  <motion.div
                    className="flex items-center justify-between mb-8 relative"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20">
                        <CheckCircle className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-sm font-medium text-white">Verified Results</span>
                    </div>
                    <div className="flex -space-x-3">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-7 h-7 rounded-full border border-white/40 bg-white/20 flex items-center justify-center text-xs font-medium"
                          initial={{ x: 10, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6 + (i * 0.1), duration: 0.3 }}
                        >
                          {["A", "B", "C"][i]}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {[
                      { value: "94%", label: "User satisfaction" },
                      { value: "30%", label: "Average savings" },
                      { value: "15min", label: "Setup time" },
                      { value: "100%", label: "Data security" }
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        className="text-center"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + (idx * 0.1), duration: 0.4 }}
                      >
                        <motion.div
                          className="text-2xl font-bold"
                          animate={{
                            textShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 10px rgba(255,255,255,0.5)", "0px 0px 0px rgba(255,255,255,0)"]
                          }}
                          transition={{
                            duration: 2 + idx,
                            repeat: Infinity,
                            repeatDelay: 1
                          }}
                        >
                          {stat.value}
                        </motion.div>
                        <div className="text-sm text-white/70">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Testimonial quote */}
                  <motion.blockquote
                    className="text-sm text-white/80 border-l-2 border-white/30 pl-4 italic mb-6"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    "Budget Buddy helped me save for my dream vacation in just 6 months. The visual insights made all the difference!"
                  </motion.blockquote>

                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-medium">JD</div>
                    <div>
                      <div className="text-sm font-medium">Jamie Davis</div>
                      <div className="text-xs text-white/70">Saved $4,200 in 6 months</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet The Developer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Passion, innovation, and expertise driving Budget Buddy to help you achieve financial freedom
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-border/40 max-w-5xl mx-auto"
          >
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <motion.div
                  className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full" />
                  <Image
                    src="/1.png"
                    alt="Aditya Kumar Tiwari"
                    width={144}
                    height={144}
                    className="object-cover"
                    priority
                  />
                </motion.div>

                <div className="flex-1 text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-bold mb-1">Aditya Kumar Tiwari</h3>
                    <p className="text-primary mb-3">Cybersecurity Enthusiast | Web Developer | Lifelong Learner</p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      <Badge variant="secondary" className="px-3 py-1">Cybersecurity</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Python</Badge>
                      <Badge variant="secondary" className="px-3 py-1">JavaScript</Badge>
                      <Badge variant="secondary" className="px-3 py-1">HTML/CSS</Badge>
                      <Badge variant="secondary" className="px-3 py-1">Linux</Badge>
                    </div>

                    <p className="text-muted-foreground mb-6">
                      Aditya is a passionate Cybersecurity Specialist and Full-Stack Developer currently pursuing a BCA in
                      Cybersecurity at Sushant University. He thrives at the intersection of technology and innovation,
                      crafting secure and scalable solutions for real-world challenges.
                    </p>

                    <div className="flex gap-3 justify-center md:justify-start">
                      <Link
                        href="https://iaddy.netlify.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        Portfolio
                      </Link>
                      <Link
                        href="https://www.linkedin.com/in/itisaddy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                          <rect x="2" y="9" width="4" height="12" />
                          <circle cx="4" cy="4" r="2" />
                        </svg>
                        LinkedIn
                      </Link>
                      <Link
                        href="https://www.instagram.com/i__aditya7/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mr-2"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                        </svg>
                        Instagram
                      </Link>
                    </div>

                    <motion.div
                      className="mt-4"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                    >
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-card/80 border border-border/50 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <a href="mailto:itisaddy7@gmail.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">itisaddy7@gmail.com</a>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>

              <motion.div
                className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    Professional Experience
                  </h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background transition-colors duration-300">
                      <div className="font-medium">Mentor (Part-time)</div>
                      <div className="text-sm text-muted-foreground">JhaMobii Technologies Pvt. Ltd., Remote</div>
                      <div className="text-xs text-primary mb-2">Aug 2024 - Present</div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Provided technical mentorship in cybersecurity</li>
                        <li>• Guided team members through vulnerability assessments</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background transition-colors duration-300">
                      <div className="font-medium">Cybersecurity Intern</div>
                      <div className="text-sm text-muted-foreground">Null, Remote</div>
                      <div className="text-xs text-primary mb-2">Jun 2024 - Present</div>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Conducted vulnerability assessments</li>
                        <li>• Monitored network traffic and responded to security incidents</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    Certifications
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Foundations of Cybersecurity</div>
                    <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Cyber Threat Management</div>
                    <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">OSForensics Triage</div>
                    <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Endpoint Security</div>
                    <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">ISO 27001</div>
                    <div className="py-2 px-3 rounded-lg border border-primary/30 bg-primary/5 text-primary font-medium text-sm text-center">Ethical Hacker</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-background to-card border-t overflow-hidden pt-16 pb-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl opacity-70"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-secondary/5 blur-3xl opacity-70"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Footer top section with logo and quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Logo size="sm" withText />
              </div>

              <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                Your personal finance companion for smart budgeting, expense tracking, and financial insights in one beautiful app.
              </p>

              <div className="flex space-x-3 mb-8">
                <a
                  href="mailto:itisaddy7@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                  aria-label="Email"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/itisaddy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a
                  href="https://www.instagram.com/i__aditya7/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a
                  href="https://github.com/itisaddy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-background shadow-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:scale-110 transition-all duration-200"
                  aria-label="GitHub"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                </a>
              </div>
            </div>

            {/* Navigation columns */}
            {["Product", "Company", "Resources", "Legal"].map((section, i) => (
              <div key={section} className="space-y-4">
                <h3 className="font-semibold text-base">{section}</h3>
                <ul className="space-y-3">
                  {(section === "Product" ?
                    ["Features", "Integrations", "Pricing", "Changelog"] :
                  section === "Company" ?
                    ["About Us", "Careers", "Blog", "Press"] :
                  section === "Resources" ?
                    ["Help Center", "Contact Us", "Community", "Status"] :
                    ["Terms of Service", "Privacy Policy", "Cookie Policy", "Compliance"]).map((item) => (
                    <li key={item}>
                      <a
                        href={`/${section.toLowerCase()}/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all inline-block"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Footer bottom with copyright and links */}
          <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
              <p className="text-xs text-muted-foreground">© 2024 Budget Buddy. All rights reserved.</p>
              <div className="flex items-center gap-4 md:border-l md:border-border/30 md:pl-4">
                <a href="/legal/privacy-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</a>
                <a href="/legal/terms-of-service" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</a>
                <a href="/legal/cookie-policy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Cookies</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-8 w-8 bg-background rounded-full border border-border/50 shadow-sm flex items-center justify-center overflow-hidden">
                <ThemeToggle iconOnly />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    title: "Smart Expense Tracking",
    description: "Automatically categorize transactions with AI-powered recognition. Connect bank accounts, credit cards, and digital wallets for seamless expense monitoring across all your financial accounts.",
    icon: <Wallet className="h-6 w-6" />,
    benefits: ["Auto-categorization", "Multi-account sync", "Receipt scanning", "Real-time updates"],
    highlight: "Save 5+ hours weekly"
  },
  {
    title: "Intelligent Budget Management",
    description: "Create dynamic budgets that adapt to your lifestyle. Get personalized recommendations, spending alerts, and smart suggestions to optimize your financial health.",
    icon: <PieChart className="h-6 w-6" />,
    benefits: ["Dynamic budgets", "Smart alerts", "Spending insights", "Goal alignment"],
    highlight: "Reduce overspending by 40%"
  },
  {
    title: "Advanced Financial Analytics",
    description: "Discover hidden spending patterns with machine learning insights. Beautiful visualizations, trend analysis, and predictive forecasting help you make informed decisions.",
    icon: <LineChart className="h-6 w-6" />,
    benefits: ["Predictive analytics", "Custom reports", "Trend analysis", "Export capabilities"],
    highlight: "Identify 15+ saving opportunities"
  },
  {
    title: "Goal Achievement System",
    description: "Set and achieve financial milestones with our proven goal-setting framework. Track progress, celebrate wins, and stay motivated with gamified savings challenges.",
    icon: <TrendingUp className="h-6 w-6" />,
    benefits: ["SMART goals", "Progress tracking", "Milestone rewards", "Achievement badges"],
    highlight: "3x higher success rate"
  },
  {
    title: "Automated Bill Management",
    description: "Never miss a payment again with intelligent bill tracking and reminders. Monitor subscriptions, detect price changes, and optimize recurring expenses automatically.",
    icon: <Calendar className="h-6 w-6" />,
    benefits: ["Payment reminders", "Subscription tracking", "Price monitoring", "Cancellation alerts"],
    highlight: "Prevent $200+ in late fees"
  },
  {
    title: "Bank-Level Security",
    description: "Your financial data is protected with 256-bit encryption, multi-factor authentication, and SOC 2 compliance. We never store banking credentials or sell your data.",
    icon: <ShieldCheck className="h-6 w-6" />,
    benefits: ["256-bit encryption", "Multi-factor auth", "SOC 2 compliant", "Zero data selling"],
    highlight: "Trusted by 50,000+ users"
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for individuals starting their financial journey",
    features: [
      "Track up to 3 accounts",
      "Basic expense categorization",
      "Monthly budget creation",
      "Simple reports and charts",
      "Mobile app access",
      "Email support"
    ],
    limitations: ["Limited to 100 transactions/month", "Basic categories only"],
    cta: "Get Started Free",
    popular: false,
    color: "from-gray-400 to-gray-600"
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "Advanced features for serious budgeters and savers",
    features: [
      "Unlimited accounts and transactions",
      "AI-powered categorization",
      "Advanced budget templates",
      "Goal tracking and milestones",
      "Bill reminders and alerts",
      "Custom reports and exports",
      "Investment tracking",
      "Priority email support",
      "Mobile and web access"
    ],
    limitations: [],
    cta: "Start 14-Day Free Trial",
    popular: true,
    color: "from-blue-500 to-purple-600",
    savings: "Save $24 annually vs monthly billing"
  },
  {
    name: "Family",
    price: "$19.99",
    period: "per month",
    description: "Comprehensive financial management for families",
    features: [
      "Everything in Pro",
      "Up to 6 family member accounts",
      "Shared budgets and goals",
      "Kids' allowance tracking",
      "Family spending insights",
      "Multiple currency support",
      "Advanced security controls",
      "Dedicated account manager",
      "Phone and chat support",
      "Financial planning consultation"
    ],
    limitations: [],
    cta: "Start Family Trial",
    popular: false,
    color: "from-emerald-500 to-teal-600",
    savings: "Save $48 annually vs monthly billing"
  }
];

const faqs = [
  {
    question: "How secure is my financial data?",
    answer: "We use bank-level 256-bit SSL encryption and never store your banking credentials. Your data is protected with multi-factor authentication, and we're SOC 2 compliant. We never sell or share your personal information with third parties."
  },
  {
    question: "Can I connect multiple bank accounts?",
    answer: "Yes! You can connect unlimited bank accounts, credit cards, investment accounts, and digital wallets. We support over 12,000 financial institutions across the US, Canada, and UK through secure API connections."
  },
  {
    question: "How does the AI categorization work?",
    answer: "Our machine learning algorithms analyze transaction descriptions, merchant information, and spending patterns to automatically categorize your expenses. The system learns from your corrections and becomes more accurate over time."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Absolutely! You can cancel your subscription at any time with no cancellation fees. Your data will remain accessible for 90 days after cancellation, giving you time to export your information if needed."
  },
  {
    question: "Do you offer customer support?",
    answer: "Yes! Free users get email support, Pro users get priority email support, and Family plan users get phone and chat support plus a dedicated account manager. Our average response time is under 2 hours during business days."
  },
  {
    question: "Can I use Budget Buddy on mobile?",
    answer: "Yes! We have native iOS and Android apps that sync seamlessly with the web version. You can track expenses, check budgets, and receive notifications on the go. The mobile app works offline and syncs when you're back online."
  }
];

const testimonials = [
  {
    name: "Alex Johnson",
    title: "Small Business Owner",
    company: "Johnson's Coffee Roasters",
    quote: "Budget Buddy completely transformed how I manage both my personal and business finances. The AI categorization caught subscription services I'd forgotten about, saving me $180/month. The business expense tracking helped me identify that I was overspending on supplies by 30%. In just one year, I've saved over $5,200 and increased my profit margins significantly.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 5,
    savings: "$5,200",
    timeUsing: "14 months",
    location: "Portland, OR"
  },
  {
    name: "Sarah Williams",
    title: "Certified Financial Planner",
    company: "Williams Wealth Management",
    quote: "I recommend Budget Buddy to all my clients because it bridges the gap between professional financial planning and daily money management. The goal tracking feature has a 73% higher success rate compared to traditional methods I've seen. My clients love the visual progress indicators and automated insights. It's become an essential tool in my practice.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    rating: 5,
    savings: "Helps clients save avg $3,400/year",
    timeUsing: "2+ years",
    location: "Austin, TX"
  },
  {
    name: "Michael Chen",
    title: "Senior Software Engineer",
    company: "TechFlow Solutions",
    quote: "As someone who was terrible at tracking expenses, this app has been a game-changer. The automated categorization is incredibly accurate - it correctly identifies 95% of my transactions. I used to spend 2-3 hours monthly on budgeting; now it takes me 15 minutes. The investment tracking feature helped me rebalance my portfolio and I'm up 12% this year.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    rating: 5,
    savings: "5+ hours monthly",
    timeUsing: "18 months",
    location: "San Francisco, CA"
  },
  {
    name: "Priya Patel",
    title: "Graduate Student",
    company: "Stanford University",
    quote: "Living on a $1,800/month stipend was challenging until I found Budget Buddy. The student discount made it affordable, and the app showed me I was spending $340/month on food delivery! Now I meal prep and cook more, saving $200/month. The goal feature helped me save $2,400 for a summer research trip to India. As a data science student, I love the detailed analytics.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    rating: 5,
    savings: "$2,400 goal achieved",
    timeUsing: "10 months",
    location: "Palo Alto, CA"
  },
  {
    name: "David Kim",
    title: "Emergency Room Physician",
    company: "Metro General Hospital",
    quote: "Working irregular hours made budgeting nearly impossible. Budget Buddy's automated tracking handles everything while I focus on saving lives. The goal setting feature helped me save $45,000 for a house down payment in 18 months. The bill reminders ensure I never miss payments despite my chaotic schedule. The family plan helps my wife and I coordinate our finances seamlessly.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    rating: 5,
    savings: "$45,000 house fund",
    timeUsing: "2 years",
    location: "Chicago, IL"
  },
  {
    name: "Emma Rodriguez",
    title: "Marketing Director",
    company: "BrandForward Agency",
    quote: "I've tried Mint, YNAB, PocketGuard, and others, but Budget Buddy strikes the perfect balance between powerful features and ease of use. The AI insights revealed I was spending $450/month on work lunches and coffee. Now I budget $200 and bring lunch twice a week. The custom reports help me track business expenses for tax season. Highly recommend to any professional!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 5,
    savings: "$3,000 annually",
    timeUsing: "16 months",
    location: "Denver, CO"
  },
  {
    name: "James Thompson",
    title: "Retired Teacher",
    company: "Lincoln Elementary (Retired)",
    quote: "At 67, I thought I was too old to learn new technology, but Budget Buddy's interface is so intuitive! It helps me manage my pension, Social Security, and retirement savings all in one place. The bill tracking ensures I never miss my medication refills or insurance payments. I've optimized my fixed income and even found ways to save $150/month on utilities and subscriptions.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    rating: 5,
    savings: "$1,800 annually",
    timeUsing: "8 months",
    location: "Phoenix, AZ"
  },
  {
    name: "Lisa Park",
    title: "Working Mother of 3",
    company: "Park Family Household",
    quote: "Managing finances for a family of 5 was overwhelming until we started using Budget Buddy's Family plan. The kids' allowance tracking teaches financial responsibility, and shared budgets keep my husband and I aligned. We discovered we were spending $800/month on groceries and dining out. Now we budget $500 and meal plan together. We've saved enough for a Disney vacation!",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    rating: 5,
    savings: "$4,200 vacation fund",
    timeUsing: "13 months",
    location: "Orlando, FL"
  }
];

const companyInfo = {
  founded: "2021",
  headquarters: "San Francisco, CA",
  employees: "25+",
  funding: "Series A",
  mission: "To democratize financial wellness by making budgeting simple, intelligent, and accessible to everyone.",
  values: ["Privacy First", "User-Centric Design", "Financial Inclusion", "Continuous Innovation"],
  certifications: ["SOC 2 Type II", "PCI DSS Compliant", "GDPR Compliant"],
  investors: ["Sequoia Capital", "Andreessen Horowitz", "Y Combinator"]
};

const developers = [
  {
    name: "Alex Chen",
    role: "Co-Founder & CEO",
    bio: "Former Goldman Sachs quantitative analyst turned fintech entrepreneur. Alex has 8+ years of experience in financial modeling and machine learning. He holds an MS in Computer Science from Stanford and is passionate about making financial tools accessible to everyone.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    experience: "8+ years",
    education: "MS Computer Science, Stanford University",
    previousCompanies: ["Goldman Sachs", "Stripe", "Robinhood"],
    expertise: ["Machine Learning", "Financial Modeling", "Product Strategy"],
    socials: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/alexchen",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
      },
      {
        platform: "GitHub",
        url: "https://github.com/alexchen",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/alexchen_tech",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
      }
    ]
  },
  {
    name: "Sophia Rodriguez",
    role: "Co-Founder & Head of Design",
    bio: "Award-winning UX designer with 6+ years at Apple and Google. Sophia led design for Google Pay's budgeting features used by 100M+ users. She holds a BFA in Interaction Design from Art Center and is passionate about inclusive financial design.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia",
    experience: "6+ years",
    education: "BFA Interaction Design, Art Center College of Design",
    previousCompanies: ["Apple", "Google", "IDEO"],
    expertise: ["User Experience", "Design Systems", "Accessibility"],
    awards: ["Webby Award 2020", "UX Design Awards 2019"],
    socials: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/sophiarodriguez",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
      },
      {
        platform: "Dribbble",
        url: "https://dribbble.com/sophiarodriguez",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"/><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"/><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"/></svg>
      },
      {
        platform: "Behance",
        url: "https://behance.net/sophiarodriguez",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
      }
    ]
  },
  {
    name: "Marcus Johnson",
    role: "VP of Engineering",
    bio: "Cybersecurity expert and former Netflix senior engineer. Marcus built scalable systems serving 200M+ users and specializes in financial data protection. He holds an MS in Cybersecurity from MIT and ensures Budget Buddy meets the highest security standards.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    experience: "10+ years",
    education: "MS Cybersecurity, MIT",
    previousCompanies: ["Netflix", "Palantir", "Square"],
    expertise: ["Cybersecurity", "Distributed Systems", "Data Protection"],
    certifications: ["CISSP", "CISM", "AWS Solutions Architect"],
    socials: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/marcusjohnson",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
      },
      {
        platform: "GitHub",
        url: "https://github.com/marcusjohnson",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
      },
      {
        platform: "Stack Overflow",
        url: "https://stackoverflow.com/users/marcusjohnson",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16.5h-12v-2h12v2z"/><path d="m19 20h-14v-2h14z"/><path d="m14 12 0.8-3-3-0.7-0.8 3 3 0.7z"/><path d="m12 8.3 1.6-2.7-2.7-1.6-1.6 2.7 2.7 1.6z"/><path d="m8.8 3.8 2.3-2.1-2.1-2.3-2.3 2.1 2.1 2.3z"/></svg>
      }
    ]
  },
  {
    name: "Dr. Priya Sharma",
    role: "Head of Data Science",
    bio: "PhD in Machine Learning from Carnegie Mellon with 7+ years in financial AI. Former lead data scientist at American Express, where she developed fraud detection algorithms. Priya leads our AI initiatives and predictive analytics features.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    experience: "7+ years",
    education: "PhD Machine Learning, Carnegie Mellon University",
    previousCompanies: ["American Express", "JPMorgan Chase", "IBM Research"],
    expertise: ["Machine Learning", "Financial AI", "Predictive Analytics"],
    publications: "15+ peer-reviewed papers",
    socials: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/priyasharma",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
      },
      {
        platform: "Google Scholar",
        url: "https://scholar.google.com/priyasharma",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15"></path></svg>
      },
      {
        platform: "ResearchGate",
        url: "https://researchgate.net/profile/priya-sharma",
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
      }
    ]
  }
];
