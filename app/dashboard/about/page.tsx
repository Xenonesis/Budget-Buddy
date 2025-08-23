"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { TechLogo } from "@/components/ui/tech-logo";
import TeamSection from "@/components/ui/team";
import { 
  BarChart4, 
  BookOpen, 
  Code, 
  Github, 
  GitBranch, 
  LayoutGrid, 
  Lightbulb, 
  Linkedin, 
  Mail, 
  MessageCircle, 
  Award, 
  Calendar, 
  Trophy,
  ExternalLink,
  Globe,
  Instagram,
  UserCircle,
  Users,
  ChevronDown,
  ChevronUp,
  Table,
  Cpu,
  Check,
  X,
  ArrowUpRight,
  DollarSign,
  BarChart,
  Layers,
  Database,
  Home,
  Info,
  Sparkles,
  History,
  FileQuestion,
  Network
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table as UITable, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Add CSS for grid pattern background
const gridPatternStyle = {
  backgroundSize: '40px 40px',
  backgroundImage: `
    linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
  `,
  backgroundAttachment: 'fixed'
};

// Animation helper component
const AnimateInView = ({ children, className = "", delay = 0 }: { 
  children: React.ReactNode; 
  className?: string; 
  delay?: number; 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1
      }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const ScrollProgressBar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const calculateScrollProgress = () => {
    const scrollPx = document.documentElement.scrollTop;
    const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = scrollPx / winHeightPx;
    setScrollProgress(scrolled);
  };

  useEffect(() => {
    window.addEventListener("scroll", calculateScrollProgress);
    return () => window.removeEventListener("scroll", calculateScrollProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-background/30 backdrop-blur-sm z-50">
      <div 
        className="h-full bg-gradient-to-r from-primary/80 via-violet-500/80 to-primary/80" 
        style={{ width: `${scrollProgress * 100}%` }}
      />
    </div>
  );
};

export default function AboutPage() {
  // Add state for active section
  const [activeSection, setActiveSection] = React.useState("mission");

  // Function to handle smooth scrolling to sections
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="animate-fade-in">
      <ScrollProgressBar />
      <div className="w-full bg-gradient-to-r from-primary/20 via-primary/10 to-violet-500/20 mb-8 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute -bottom-10 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[80px]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full" style={gridPatternStyle}></div>
        
        <div className="container max-w-5xl px-4 py-10 sm:py-14 relative z-10">
          <div className="relative">
            <div className="absolute -top-1 -left-1 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -right-8 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 text-primary relative z-10 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">About Budget Buddy</h1>
            <p className="text-muted-foreground max-w-2xl text-lg relative z-10 sm:text-xl">Your personal finance companion for smarter decisions and financial freedom</p>
          </div>
        </div>
      </div>
      
      {/* Quick Navigation Menu */}
      <div className="sticky top-[60px] z-30 bg-background/80 backdrop-blur-md border-b border-primary/10 mb-6 shadow-sm">
        <div className="container max-w-5xl px-4">
          <div className="overflow-x-auto flex items-center -mx-4 px-4 py-2">
            <div className="flex items-center gap-1 sm:gap-2 px-4">
              {[
                { id: "mission", label: "Mission", icon: <Info className="w-3.5 h-3.5" /> },
                { id: "app-details", label: "App Details", icon: <Sparkles className="w-3.5 h-3.5" /> },
                { id: "team", label: "Team", icon: <Users className="w-3.5 h-3.5" /> },
                { id: "faq", label: "FAQ", icon: <FileQuestion className="w-3.5 h-3.5" /> },
                { id: "stack", label: "Tech Stack", icon: <Layers className="w-3.5 h-3.5" /> },
                { id: "compare", label: "Comparison", icon: <BarChart className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => scrollToSection(item.id)}
                  className={`rounded-full text-xs py-1.5 px-3 ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "border-transparent"
                  } whitespace-nowrap flex items-center gap-1.5 transition-all`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-5xl px-4">
        <div id="mission" className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-16 scroll-mt-20">
          <AnimateInView className="md:col-span-2">
            <Card className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b border-primary/10 p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 14c.2-1 .7-1.7 1.5-2"></path><path d="M8 9a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"></path><path d="M17 9v9"></path><path d="M20 9h-6V5a2 2 0 1 1 4 0v6h4"></path></svg>
                  Our Mission
                </CardTitle>
                <CardDescription className="text-base">
                  AI-powered financial management with voice interface and real-time insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <p className="leading-relaxed">
                  Budget Buddy revolutionizes personal finance management by combining cutting-edge AI technology with 
                  intuitive design. Our platform integrates 20+ AI providers including Google Gemini to deliver 
                  personalized financial insights, voice-powered transaction input, and intelligent spending analysis 
                  that adapts to your unique financial patterns.
                </p>
                <p className="leading-relaxed">
                  Built on modern web technologies including Next.js 15, React 19, and Supabase, Budget Buddy offers 
                  real-time data synchronization, drag-and-drop budget management, and comprehensive analytics with 
                  interactive visualizations. Our voice interface and AI-powered insights make financial management 
                  as simple as having a conversation with your personal finance assistant.
                </p>
                <p className="leading-relaxed">
                  We believe financial empowerment should be accessible to everyone. That's why we've created a 
                  platform that not only tracks your finances but actively helps you make smarter decisions through 
                  predictive analytics, automated categorization, and export capabilities for Excel and PDF reports.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 items-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">AI-Powered</Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">Voice Enabled</Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">Real-time Sync</Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">Export Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </AnimateInView>
          
          <AnimateInView delay={200}>
            <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b border-primary/10 p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22v-5"></path><path d="M9 8V2"></path><path d="M15 8V2"></path><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path><path d="M15 8v7"></path><path d="M9 8v7"></path></svg>
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2 grid sm:grid-cols-1 gap-2">
                  {[
                    "Transaction tracking with drag & drop sorting",
                    "Dynamic budget creation and management",
                    "Interactive charts with Recharts visualization",
                    "AI-powered financial insights (20+ providers)",
                    "Voice interface for transaction input",
                    "Dark & light theme support",
                    "Responsive mobile-first design",
                    "Excel and PDF export functionality",
                    "Real-time data sync with Supabase",
                    "Advanced filtering and search",
                    "Recurring transaction automation",
                    "Annual budget summaries",
                    "Secure authentication system",
                    "Copy-to-clipboard functionality",
                    "Animated UI with Framer Motion",
                    "Comprehensive analytics dashboard"
                  ].map((feature, index) => (
                    <li 
                      key={index}
                      className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors group"
                    >
                      <span className="mr-2 text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-1 transition-transform">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimateInView>
        </div>
        
        <AnimateInView>
          <Card id="app-details" className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 overflow-hidden scroll-mt-20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"></path><path d="M2 12h20"></path><path d="M2 18h20"></path></svg>
                App Details
              </CardTitle>
              <CardDescription className="text-base">
                Latest updates and version information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-md"></div>
                    <Logo size="lg" withText animated={false} className="relative z-10" />
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <p className="text-sm text-muted-foreground">Version 15.50.00</p>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">Latest</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full h-9 border-primary/30 hover:bg-primary/10 text-xs w-full sm:w-auto group transition-all"
                  asChild
                >
                  <Link href="https://github.com/Xenonesis" target="_blank" rel="noopener noreferrer">
                    <Github className="w-3.5 h-3.5 mr-1.5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:translate-x-0.5 transition-transform">View on GitHub</span>
                  </Link>
                </Button>
              </div>
              
              <div className="p-5 bg-gradient-to-r from-primary/5 to-violet-500/5 rounded-lg border border-primary/10 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                      <GitBranch className="w-4 h-4" />
                      Version 15.50.00 key update:
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">Released on August 22, 2025</p>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Advanced AI integration with 20+ providers for comprehensive financial insights</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Real-time financial predictions with machine learning algorithms</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Enhanced security with biometric authentication and advanced encryption</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Expanded support for 25+ international currencies</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Customizable dashboard with drag-and-drop widgets</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                      <Lightbulb className="w-4 h-4" />
                      Technical improvements:
                    </h3>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">35% reduction in bundle size with improved code splitting</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Enhanced security with two-factor authentication</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Automated end-to-end testing with Playwright</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">WCAG 2.1 AA compliance for better accessibility</span>
                      </li>
                      <li className="flex items-start gap-2 group">
                        <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                        <span className="group-hover:translate-x-0.5 transition-transform">Streaming server components for improved UX</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                  <Calendar className="w-4 h-4" />
                  Version Timeline:
                </h3>
                
                <div className="relative pt-2">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/80 to-primary/10 rounded-full"></div>
                  
                  {/* Version 15.50.00 */}
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary to-violet-500/80 flex items-center justify-center shadow-lg shadow-primary/20 z-10">
                      <span className="text-xs font-semibold text-white">15.5</span>
                    </div>
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-primary/30 to-transparent"></div>
                    <div className="bg-card rounded-lg border border-primary/10 shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 px-4 py-2.5 border-b border-primary/10 flex justify-between items-center">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">v15.50.00</Badge>
                        <span className="text-xs text-muted-foreground">Released on August 22, 2025</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Advanced AI integration with 20+ providers</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Real-time financial insights and predictions</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Enhanced security with biometric authentication</span>
                          </li>
                        </ul>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Improved performance with 40% faster loading</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Multi-language support for global users</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Advanced analytics dashboard with custom reports</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Version 13.50.00 */}
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary/70 to-violet-500/60 flex items-center justify-center shadow-lg shadow-primary/15 z-10">
                      <span className="text-xs font-semibold text-white">13.5</span>
                    </div>
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"></div>
                    <div className="bg-card rounded-lg border border-muted shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-2.5 border-b border-muted flex justify-between items-center">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">v13.50.00</Badge>
                        <span className="text-xs text-muted-foreground">Released on August 22, 2025</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Enhanced AI provider support with 15+ providers</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Automatic model detection based on API keys</span>
                          </li>
                        </ul>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Dynamic model fetching for all providers</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Improved rate limit handling for Gemini API</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Version 13.25.00 */}
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary/70 to-violet-500/60 flex items-center justify-center shadow-lg shadow-primary/15 z-10">
                      <span className="text-xs font-semibold text-white">13.2</span>
                    </div>
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"></div>
                    <div className="bg-card rounded-lg border border-muted shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-2.5 border-b border-muted flex justify-between items-center">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">v13.25.00</Badge>
                        <span className="text-xs text-muted-foreground">Released on August 22, 2025</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>AI provider support enhancements</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Dynamic model fetching implementation</span>
                          </li>
                        </ul>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Updated AI setup guide</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Improved user experience</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Version 12.50.00 */}
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary/60 to-violet-500/50 flex items-center justify-center shadow-lg shadow-primary/10 z-10">
                      <span className="text-xs font-semibold text-white">12.5</span>
                    </div>
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent"></div>
                    <div className="bg-card rounded-lg border border-muted shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-muted/30 to-muted/10 px-4 py-2.5 border-b border-muted flex justify-between items-center">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">v12.50.00</Badge>
                        <span className="text-xs text-muted-foreground">Released on August 22, 2025</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Landing page components refactoring</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Split main page into focused components</span>
                          </li>
                        </ul>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Improved code organization</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-muted-foreground">•</span>
                            <span>Reduced bundle size optimization</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Version 8.8.0 */}
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary/90 to-violet-500/70 flex items-center justify-center shadow-md shadow-primary/10 z-10">
                      <span className="text-xs font-semibold text-white">8.8</span>
                    </div>
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent"></div>
                    <div className="bg-card rounded-lg border border-primary/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 px-4 py-2.5 border-b border-primary/10 flex justify-between items-center">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">v8.8.0</Badge>
                        <span className="text-xs text-muted-foreground">Released on May 7, 2025</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Enhanced brand identity with improved logo styling</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Added subtle animation effects to brand elements</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Improved brand visibility across themes</span>
                          </li>
                        </ul>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Added custom shadow effects for better depth</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Enhanced text gradient with improved transitions</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Fixed text visibility on dark backgrounds</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Version 8.7.0 */}
                  <div className="relative pl-10 pb-8">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary/80 to-violet-500/60 flex items-center justify-center shadow-md shadow-primary/10 z-10">
                      <span className="text-xs font-semibold text-white">8.7</span>
                    </div>
                    <div className="absolute left-[15px] top-[30px] bottom-0 w-0.5 bg-gradient-to-b from-primary/30 via-primary/15 to-transparent"></div>
                    <div className="bg-card rounded-lg border border-primary/10 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 px-4 py-2.5 border-b border-primary/10 flex justify-between items-center">
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">v8.7.0</Badge>
                        <span className="text-xs text-muted-foreground">Released on May 7, 2025</span>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Redesigned About page with enhanced UI/UX</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Added FAQs section for common user questions</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Updated developer profile with current information</span>
                          </li>
                        </ul>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Improved mobile responsiveness and animations</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Fixed SVG image rendering issues</span>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Enhanced performance with latest React features</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Earlier Versions Button */}
                  <div className="relative pl-10">
                    <div className="absolute left-0 top-1 w-[30px] h-[30px] rounded-full bg-gradient-to-tr from-primary/50 to-violet-500/30 flex items-center justify-center shadow shadow-primary/5 z-10">
                      <History className="w-4 h-4 text-white/80" />
                    </div>
                    <Button variant="outline" className="w-full justify-center text-xs border-dashed">
                      Show Earlier Versions
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimateInView>
        
        {/* <AnimateInView>
          <Card id="developer" className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden scroll-mt-20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserCircle className="w-5 h-5" />
                Meet the Developer
              </CardTitle>
              <CardDescription className="text-base">
                The talented mind behind Budget Buddy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-br from-primary/10 to-violet-500/10 z-0"></div>
                <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
                
                <div className="p-6 pt-10 relative z-10">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center md:items-start">
                      <div className="w-36 h-36 md:w-48 md:h-48 rounded-xl overflow-hidden border-4 border-background shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-violet-500/30 opacity-70 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-primary/5 mix-blend-overlay"></div>
                        <Image
                          src="/1.png"
                          alt="Aditya Kumar Tiwari"
                          width={224}
                          height={224}
                          className="object-cover w-full h-full relative z-10 group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent z-20"></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center mt-4 md:hidden">
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/5 group transition-all" asChild>
                          <Link href="https://github.com/Xenonesis" target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/5 group transition-all" asChild>
                          <Link href="https://www.linkedin.com/in/itisaddy/" target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/5 group transition-all" asChild>
                          <Link href="https://www.instagram.com/i__aditya7/" target="_blank" rel="noopener noreferrer">
                            <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-8 w-8 hover:bg-primary/5 group transition-all" asChild>
                          <Link href="https://iaddy.netlify.app/" target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-5 text-center md:text-left">
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent inline-block">Aditya Kumar Tiwari</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">Cybersecurity Specialist • Full-Stack Developer • Sushant University</p>
                        
                        <div className="mt-3 hidden md:flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="rounded-full h-9 px-4 gap-1.5 hover:bg-primary/5 group transition-all" asChild>
                            <Link href="https://github.com/Xenonesis" target="_blank" rel="noopener noreferrer">
                              <Github className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span className="text-xs group-hover:translate-x-0.5 transition-transform">GitHub</span>
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full h-9 px-4 gap-1.5 hover:bg-primary/5 group transition-all" asChild>
                            <Link href="https://www.linkedin.com/in/itisaddy/" target="_blank" rel="noopener noreferrer">
                              <Linkedin className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span className="text-xs group-hover:translate-x-0.5 transition-transform">LinkedIn</span>
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full h-9 px-4 gap-1.5 hover:bg-primary/5 group transition-all" asChild>
                            <Link href="https://www.instagram.com/i__aditya7/" target="_blank" rel="noopener noreferrer">
                              <Instagram className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span className="text-xs group-hover:translate-x-0.5 transition-transform">Instagram</span>
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full h-9 px-4 gap-1.5 hover:bg-primary/5 group transition-all" asChild>
                            <Link href="https://iaddy.netlify.app/" target="_blank" rel="noopener noreferrer">
                              <Globe className="h-4 w-4 group-hover:scale-110 transition-transform" />
                              <span className="text-xs group-hover:translate-x-0.5 transition-transform">Portfolio</span>
                            </Link>
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center md:justify-start bg-muted/20 p-3 rounded-lg">
                        {[
                          "Digital Forensics", "Linux", "Python", "JavaScript", "ReactJS", "HTML/CSS"
                        ].map((skill, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="bg-primary/5 border-primary/20 text-xs px-3 py-1 hover:bg-primary/10 transition-colors cursor-default"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm leading-relaxed">
                        Aditya is a passionate Cybersecurity Specialist and Full-Stack Developer currently pursuing a BCA in Cybersecurity at 
                        Sushant University. He thrives on the intersection of technology and innovation, crafting secure and scalable solutions 
                        for real-world challenges. His expertise spans Digital Forensics, Linux, Python, and web development technologies, with 
                        a focus on creating exceptional digital experiences.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-0">
                  <div className="p-5 rounded-lg bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <BarChart4 className="h-4 w-4 text-primary" />
                      Professional Experience
                    </h4>
                    <ul className="space-y-4">
                      <li className="relative pl-7 group">
                        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-primary/50 to-primary/0 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center shadow-md shadow-primary/10 group-hover:scale-110 transition-transform">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex justify-between mb-1.5">
                          <h5 className="text-sm font-medium">Mentor (Part-time)</h5>
                          <Badge variant="outline" className="text-xs h-5 bg-primary/5">Aug 2024 - Present</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">JhaMobii Technologies Pvt. Ltd.</p>
                      </li>
                      <li className="relative pl-7 group">
                        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-primary/30 to-primary/0 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-gradient-to-tr from-primary/70 to-violet-500/70 flex items-center justify-center shadow-md shadow-primary/10 group-hover:scale-110 transition-transform">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex justify-between mb-1.5">
                          <h5 className="text-sm font-medium">Cybersecurity Intern</h5>
                          <Badge variant="outline" className="text-xs h-5 bg-primary/5">Jun 2024 - Present</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Null</p>
                      </li>
                      <li className="relative pl-7 group">
                        <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-primary/20 to-transparent rounded-full"></div>
                        <div className="absolute top-0 left-0 w-5 h-5 rounded-full bg-gradient-to-tr from-primary/50 to-violet-500/50 flex items-center justify-center shadow-md shadow-primary/10 group-hover:scale-110 transition-transform">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="flex justify-between mb-1.5">
                          <h5 className="text-sm font-medium">Cybersecurity and AI/ML Intern</h5>
                          <Badge variant="outline" className="text-xs h-5 bg-primary/5">Oct 2024 - Present</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Quantam Pvt. Ltd.</p>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-5 rounded-lg bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-primary" />
                      Featured Projects
                    </h4>
                    <ul className="space-y-4">
                      <li className="group hover:bg-white/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                        <h5 className="text-sm font-medium flex items-center gap-2 mb-1">
                          <span className="group-hover:text-primary transition-colors">SEO Optimized Website</span>
                          <Badge className="text-[10px] h-4 bg-amber-500/90 group-hover:bg-amber-500 transition-colors">Website</Badge>
                        </h5>
                        <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">An SEO-optimized website to improve search engine visibility using best practices.</p>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full px-2.5 hover:bg-amber-500/10 hover:text-amber-500">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Project
                          </Button>
                        </div>
                      </li>
                      <li className="group hover:bg-white/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                        <h5 className="text-sm font-medium flex items-center gap-2 mb-1">
                          <span className="group-hover:text-primary transition-colors">PropDekho</span>
                          <Badge className="text-[10px] h-4 bg-emerald-500/90 group-hover:bg-emerald-500 transition-colors">Real Estate</Badge>
                        </h5>
                        <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">A real estate website that helps users find and explore properties easily.</p>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full px-2.5 hover:bg-emerald-500/10 hover:text-emerald-500">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Project
                          </Button>
                        </div>
                      </li>
                      <li className="group hover:bg-white/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                        <h5 className="text-sm font-medium flex items-center gap-2 mb-1">
                          <span className="group-hover:text-primary transition-colors">Real Estate ChatBot</span>
                          <Badge className="text-[10px] h-4 bg-violet-500/90 group-hover:bg-violet-500 transition-colors">AI Assistant</Badge>
                        </h5>
                        <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">A chatbot developed for real estate inquiries, offering users assistance in finding properties.</p>
                        <div className="mt-2">
                          <Button variant="ghost" size="sm" className="h-7 text-[10px] rounded-full px-2.5 hover:bg-violet-500/10 hover:text-violet-500">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Project
                          </Button>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimateInView> */}
        
        {/* New Team Section */}
        <AnimateInView>
          <div id="team" className="scroll-mt-20">
            <TeamSection />
          </div>
        </AnimateInView>
        
        <AnimateInView>
          <Card id="faq" className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden scroll-mt-20">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <MessageCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription className="text-base">
                Get answers to the most common questions about Budget Buddy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 space-y-4">
                  {[
                    {
                      question: "Is Budget Buddy free to use?",
                      answer: "Yes, Budget Buddy's core features are completely free to use. We do offer a premium tier with advanced features like AI-powered insights, unlimited budget categories, and priority support."
                    },
                    {
                      question: "How secure is my financial data?",
                      answer: "Budget Buddy uses end-to-end encryption and follows industry-standard security protocols. Your data is stored securely and is never shared with third parties without your explicit permission. We implement bank-level security measures to protect all your sensitive financial information."
                    },
                    {
                      question: "Can I import transactions from my bank?",
                      answer: "Yes, Budget Buddy supports CSV imports from most major banks. We're also working on direct bank integrations for seamless transaction syncing, which will be available in our next major update."
                    },
                    {
                      question: "Is Budget Buddy available on mobile devices?",
                      answer: "Budget Buddy is fully responsive and works on all devices. We also have dedicated iOS and Android apps available for download, providing a native mobile experience with features like fingerprint authentication and offline access to your budget."
                    },
                    {
                      question: "How do I create custom budget categories?",
                      answer: "Navigate to Settings > Categories to create, edit, or delete custom budget categories. You can also set category icons and colors to personalize your experience and make your budget visually intuitive."
                    },
                    {
                      question: "Can I share my budget with others?",
                      answer: "Yes, Budget Buddy supports shared budgets for families or couples. Go to Settings > Sharing to invite others to view or collaborate on your budget. You can control permissions at a granular level, allowing view-only or edit access as needed."
                    },
                  ].map((faq, index) => {
                    const [isOpen, setIsOpen] = React.useState(index === 0);
                    
                    return (
                      <div 
                        key={index} 
                        className="rounded-lg border border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-md"
                      >
                        <button
                          onClick={() => setIsOpen(!isOpen)}
                          className="w-full flex items-center justify-between p-4 text-left focus:outline-none group"
                        >
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors flex items-center">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary mr-2 text-xs">
                              {index + 1}
                            </span>
                            {faq.question}
                          </h3>
                          <div className="text-primary shrink-0 ml-4">
                            <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                              <ChevronDown className="h-4 w-4" />
                            </div>
                          </div>
                        </button>
                        
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="px-4 pb-4 pt-0 text-sm text-muted-foreground">
                            <Separator className="mb-3" />
                            <p className="leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8 text-center p-4 bg-gradient-to-r from-primary/5 to-violet-500/5 rounded-lg border border-primary/10">
                  <h3 className="text-sm font-medium mb-2">Still have questions?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you can't find the answer to your question, feel free to reach out to our support team.
                  </p>
                  <Button variant="default" size="sm" className="rounded-full text-xs px-4 h-9">
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimateInView>
        
        <div id="stack" className="scroll-mt-20">
          <AnimateInView>
            <Card className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Cpu className="w-5 h-5" />
                  Tech Stack
                </CardTitle>
                <CardDescription className="text-base">
                  The powerful technologies behind Budget Buddy
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary mb-4">
                      <Layers className="w-4 h-4" />
                      Frontend Technologies
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                      {[
                        { name: "Next.js", logo: "/tech/nextjs.svg", desc: "React framework v15.5.0" },
                        { name: "React", logo: "/tech/react.svg", desc: "UI library v19.1.1" },
                        { name: "TypeScript", logo: "/tech/typescript.svg", desc: "Type-safe JavaScript v5.9.2" },
                        { name: "Tailwind CSS", logo: "/tech/tailwind.svg", desc: "Utility-first CSS v4.1.12" },
                        { name: "Framer Motion", logo: "/tech/framer.svg", desc: "Animation library v12.23.12" },
                        { name: "Radix UI", logo: "/tech/shadcn.png", desc: "Headless UI components" },
                        { name: "Lucide React", logo: "/tech/react.svg", desc: "Icon library v0.540.0" }
                      ].map((tech, i) => (
                        <div key={i} className="flex flex-col items-center p-3 rounded-lg border border-muted hover:border-primary/20 transition-all bg-white/50 dark:bg-gray-900/50 hover:shadow-md group">
                          <div className="w-12 h-12 mb-3 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-md group-hover:bg-primary/10 transition-colors"></div>
                            <div className="relative z-10 w-10 h-10">
                              <TechLogo
                                name={tech.name}
                                logo={tech.logo}
                                size={40}
                                className="w-full h-full group-hover:scale-110 transition-transform"
                              />
                            </div>
                          </div>
                          <h4 className="text-xs font-medium text-center group-hover:text-primary transition-colors">{tech.name}</h4>
                          <p className="text-[10px] text-center text-muted-foreground mt-1">{tech.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary mb-4">
                      <Database className="w-4 h-4" />
                      Backend & Database
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                      {[
                        { name: "Supabase", logo: "/tech/supabase.svg", desc: "Backend-as-a-Service v2.55.0" },
                        { name: "PostgreSQL", logo: "/tech/postgres.svg", desc: "Relational database" },
                        { name: "Node.js", logo: "/tech/nodejs.svg", desc: "JavaScript runtime" },
                        { name: "Google AI", logo: "/tech/openai.svg", desc: "Generative AI v0.24.1" },
                        { name: "Zustand", logo: "/tech/react.svg", desc: "State management v5.0.8" }
                      ].map((tech, i) => (
                        <div key={i} className="flex flex-col items-center p-3 rounded-lg border border-muted hover:border-primary/20 transition-all bg-white/50 dark:bg-gray-900/50 hover:shadow-md group">
                          <div className="w-12 h-12 mb-3 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-md group-hover:bg-primary/10 transition-colors"></div>
                            <div className="relative z-10 w-10 h-10">
                              <TechLogo
                                name={tech.name}
                                logo={tech.logo}
                                size={40}
                                className="w-full h-full group-hover:scale-110 transition-transform"
                              />
                            </div>
                          </div>
                          <h4 className="text-xs font-medium text-center group-hover:text-primary transition-colors">{tech.name}</h4>
                          <p className="text-[10px] text-center text-muted-foreground mt-1">{tech.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium flex items-center gap-2 text-primary mb-4">
                      <ArrowUpRight className="w-4 h-4" />
                      Tools & Libraries
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                      {[
                        { name: "Vercel", logo: "/tech/vercel.svg", desc: "Deployment platform" },
                        { name: "GitHub", logo: "/tech/github.svg", desc: "Version control" },
                        { name: "Recharts", logo: "/tech/chartjs.svg", desc: "Data visualization v3.1.2" },
                        { name: "DnD Kit", logo: "/tech/react.svg", desc: "Drag & drop v6.3.1" },
                        { name: "Date-fns", logo: "/tech/nodejs.svg", desc: "Date utilities v4.1.0" },
                        { name: "ExcelJS", logo: "/tech/api.svg", desc: "Excel export v4.4.0" },
                        { name: "jsPDF", logo: "/tech/api.svg", desc: "PDF generation v3.0.1" }
                      ].map((tech, i) => (
                        <div key={i} className="flex flex-col items-center p-3 rounded-lg border border-muted hover:border-primary/20 transition-all bg-white/50 dark:bg-gray-900/50 hover:shadow-md group">
                          <div className="w-12 h-12 mb-3 relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-primary/5 rounded-full blur-md group-hover:bg-primary/10 transition-colors"></div>
                            <div className="relative z-10 w-10 h-10">
                              <TechLogo
                                name={tech.name}
                                logo={tech.logo}
                                size={40}
                                className="w-full h-full group-hover:scale-110 transition-transform"
                              />
                            </div>
                          </div>
                          <h4 className="text-xs font-medium text-center group-hover:text-primary transition-colors">{tech.name}</h4>
                          <p className="text-[10px] text-center text-muted-foreground mt-1">{tech.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full h-9 px-4 gap-1.5 border-primary/20 hover:bg-primary/5 text-xs w-full sm:w-auto"
                      asChild
                    >
                      <Link href="https://github.com/Xenonesis" target="_blank" rel="noopener noreferrer">
                        <Github className="h-3.5 w-3.5" />
                        <span>View Source Code</span>
                        <ExternalLink className="h-3 w-3 ml-1 opacity-70" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateInView>
        </div>
        
        <div id="compare" className="scroll-mt-20">
          <AnimateInView>
            <Card className="mb-10 sm:mb-12 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border-0 bg-gradient-to-br from-white via-white to-primary/5 dark:from-gray-950 dark:via-gray-950 dark:to-primary/5">
              <CardHeader className="bg-gradient-to-r from-primary/15 via-violet-400/10 to-primary/15 border-b border-primary/20 p-8 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-5 -left-5 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl"></div>
                <CardTitle className="flex items-center gap-3 text-2xl font-bold relative z-10">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Table className="w-6 h-6 text-primary" />
                  </div>
                  <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                    Feature Comparison
                  </span>
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground relative z-10 mt-2">
                  See how Budget Buddy's cutting-edge features stack up against traditional budget managers
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet-500/5 to-primary/10 rounded-2xl blur-sm"></div>
                    <div className="relative bg-gradient-to-r from-primary/8 to-violet-500/8 p-6 rounded-2xl border border-primary/20 backdrop-blur-sm">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                          <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-primary">Revolutionary Financial Management</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            Budget Buddy revolutionizes financial management with <span className="font-semibold text-primary">20+ AI providers</span>, 
                            <span className="font-semibold text-primary"> voice-powered interactions</span>, 
                            <span className="font-semibold text-primary"> drag-and-drop functionality</span>, and 
                            <span className="font-semibold text-primary"> real-time data sync</span>. Built on Next.js 15 and React 19, 
                            it offers capabilities that traditional budget apps simply can't match.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-gray-900 dark:to-primary/10">
                    <UITable>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5 dark:from-primary/10 dark:to-violet-500/10">
                          <TableHead className="w-[300px] p-6 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              Feature Comparison
                            </div>
                          </TableHead>
                          <TableHead className="text-center p-6">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                                <span className="font-bold text-primary text-lg">Budget Buddy</span>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium bg-primary/5 px-3 py-1 rounded-full">
                                Next-Gen Finance Platform
                              </span>
                            </div>
                          </TableHead>
                          <TableHead className="text-center p-6">
                            <div className="flex flex-col items-center gap-2">
                              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-muted">
                                <div className="w-3 h-3 rounded-full bg-muted-foreground/50"></div>
                                <span className="font-medium text-muted-foreground text-lg">Traditional Apps</span>
                              </div>
                              <span className="text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1 rounded-full">
                                Legacy Budget Managers
                              </span>
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          { 
                            feature: "Voice Interface", 
                            budgetBuddy: true, 
                            traditional: false,
                            description: "Voice-powered transaction input and commands"
                          },
                          { 
                            feature: "20+ AI Providers", 
                            budgetBuddy: true, 
                            traditional: false,
                            description: "Google Gemini, OpenAI, and 18+ other AI models"
                          },
                          { 
                            feature: "Drag & Drop Management", 
                            budgetBuddy: true, 
                            traditional: false,
                            description: "Intuitive drag-and-drop budget and transaction sorting"
                          },
                          { 
                            feature: "Real-time Data Sync", 
                            budgetBuddy: true, 
                            traditional: { partial: true },
                            description: "Instant synchronization with Supabase backend"
                          },
                          { 
                            feature: "Excel & PDF Export", 
                            budgetBuddy: true, 
                            traditional: { partial: true },
                            description: "Advanced export with ExcelJS and jsPDF integration"
                          },
                          { 
                            feature: "Interactive Charts", 
                            budgetBuddy: true, 
                            traditional: { partial: true },
                            description: "Recharts-powered dynamic visualizations"
                          },
                          { 
                            feature: "Modern Tech Stack", 
                            budgetBuddy: true, 
                            traditional: false,
                            description: "Next.js 15, React 19, TypeScript 5.9"
                          },
                          { 
                            feature: "Animated UI", 
                            budgetBuddy: true, 
                            traditional: false,
                            description: "Framer Motion animations and smooth transitions"
                          },
                          { 
                            feature: "Copy-to-Clipboard", 
                            budgetBuddy: true, 
                            traditional: false,
                            description: "One-click data copying and sharing"
                          },
                          { 
                            feature: "Advanced Filtering", 
                            budgetBuddy: true, 
                            traditional: { partial: true },
                            description: "Powerful search and filter capabilities"
                          },
                        ].map((row, i) => (
                          <TableRow key={i} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-violet-500/5 dark:hover:from-primary/10 dark:hover:to-violet-500/10 transition-all duration-300 border-b border-primary/10 group">
                            <TableCell className="font-medium p-6">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{row.feature}</span>
                                  <span className="text-sm text-muted-foreground mt-1 leading-relaxed">{row.description}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center p-6">
                              {row.budgetBuddy === true ? (
                                <div className="flex justify-center">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-sm"></div>
                                    <span className="relative w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                      <Check className="w-5 h-5" />
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30">
                                    <X className="w-5 h-5" />
                                  </span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center p-6">
                              {row.traditional === true ? (
                                <div className="flex justify-center">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-green-500/20 rounded-full blur-sm"></div>
                                    <span className="relative w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                      <Check className="w-5 h-5" />
                                    </span>
                                  </div>
                                </div>
                              ) : row.traditional && row.traditional.partial ? (
                                <div className="flex justify-center">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-sm"></div>
                                    <span className="relative w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                      <Check className="w-5 h-5 opacity-80" />
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <span className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 border border-red-500/30 group-hover:scale-110 transition-transform">
                                    <X className="w-5 h-5" />
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </UITable>
                  </div>
                  
                  <div className="relative mt-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-violet-500/5 to-primary/10 rounded-3xl blur-sm"></div>
                    <div className="relative bg-gradient-to-br from-primary/8 via-violet-500/5 to-primary/8 p-8 rounded-3xl border border-primary/20 backdrop-blur-sm">
                      <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 mb-4">
                          <Trophy className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-bold text-primary">Why Choose Budget Buddy?</h3>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                          Experience the future of financial management with cutting-edge technology and innovative features
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="group relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-2xl border border-primary/20 backdrop-blur-sm group-hover:border-primary/30 transition-all">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 shrink-0 group-hover:scale-110 transition-transform">
                                <Network className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Voice-Powered Interface</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">Revolutionary voice commands for transaction input and financial queries</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="group relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-2xl border border-primary/20 backdrop-blur-sm group-hover:border-primary/30 transition-all">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 shrink-0 group-hover:scale-110 transition-transform">
                                <Cpu className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">20+ AI Providers</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">Unmatched AI integration with Google Gemini, OpenAI, and 18+ other models</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="group relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-500/10 rounded-2xl blur-sm group-hover:blur-md transition-all"></div>
                          <div className="relative bg-white/80 dark:bg-gray-900/80 p-6 rounded-2xl border border-primary/20 backdrop-blur-sm group-hover:border-primary/30 transition-all">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/30 shrink-0 group-hover:scale-110 transition-transform">
                                <LayoutGrid className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">Modern Architecture</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">Built on Next.js 15, React 19, and cutting-edge web technologies</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateInView>
        </div>
        
        <AnimateInView className="text-center mb-6 sm:mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors py-2 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Return to Dashboard
          </Link>
        </AnimateInView>
      </div>
    </div>
  );
} 