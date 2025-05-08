"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
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
  ChevronUp
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <div className="w-full bg-gradient-to-r from-primary/20 to-violet-500/20 mb-8">
        <div className="container max-w-5xl px-4 py-8 sm:py-12">
          <div className="relative">
            <div className="absolute -top-1 -left-1 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 -right-8 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-primary relative z-10">About Budget Buddy</h1>
            <p className="text-muted-foreground max-w-2xl text-lg relative z-10">Your personal finance companion for smarter decisions and financial freedom</p>
          </div>
        </div>
      </div>
      
      <div className="container max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-12">
          <div className="md:col-span-2">
            <Card className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-violet-500/5 border-b border-primary/10 p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 14c.2-1 .7-1.7 1.5-2"></path><path d="M8 9a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"></path><path d="M17 9v9"></path><path d="M20 9h-6V5a2 2 0 1 1 4 0v6h4"></path></svg>
                  Our Mission
                </CardTitle>
                <CardDescription className="text-base">
                  Empowering individuals and businesses to take control of their finances
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <p className="leading-relaxed">
                  Budget Buddy is designed to help you manage your finances effectively and achieve your financial goals.
                  Our application provides intuitive tools for tracking expenses, creating budgets, and analyzing your 
                  spending patterns with advanced visualizations and AI insights.
                </p>
                <p className="leading-relaxed">
                  We believe that financial management should be accessible to everyone, regardless of their financial 
                  background or expertise. Our goal is to simplify personal finance and provide you with the insights 
                  you need to make informed financial decisions while maintaining complete privacy and security.
                </p>
                <p className="leading-relaxed">
                  Developed with modern web technologies, Budget Buddy offers a seamless and
                  responsive experience across all your devices, with a focus on security,
                  performance, and exceptional user experience.
                </p>
                <div className="flex flex-wrap gap-3 mt-6 items-center">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">Security Focused</Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">Privacy First</Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-medium">User Centered</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
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
                    "Expense tracking and categorization",
                    "Custom budget creation and visualization",
                    "Financial analytics with multiple chart types",
                    "Multi-currency support",
                    "AI-powered financial insights",
                    "Dark & light theme support",
                    "Responsive mobile design",
                    "Personalized spending recommendations",
                    "Automated saving goals tracking",
                    "Predictive spending patterns",
                    "Bill payment reminders",
                    "Real-time sync across devices",
                    "Export financial reports",
                    "Secure data encryption"
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
          </div>
        </div>
        
        <Card className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 overflow-hidden">
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
                  <p className="text-sm text-muted-foreground">Version 8.7.0</p>
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
                    Version 8.7.0 key update:
                  </h3>
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Redesigned About page with enhanced UI/UX</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Added FAQs section for common user questions</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Updated developer profile with current information</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Improved mobile responsiveness and animations</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Added interactive elements for better user engagement</span>
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
                      <span className="group-hover:translate-x-0.5 transition-transform">Improved compatibility with modern browsers</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Enhanced performance with latest React features</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Replaced internal SVG with native SVG avatar</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Added gradient touches and glow effects</span>
                    </li>
                    <li className="flex items-start gap-2 group">
                      <span className="text-primary group-hover:scale-110 transition-transform">•</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">Fixed SVG image rendering issues</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-sm font-medium flex items-center gap-2 text-primary">
                <Calendar className="w-4 h-4" />
                Version History
              </h3>
              
              <div className="relative before:absolute before:h-full before:w-[2px] before:bg-gradient-to-b before:from-primary/50 before:to-muted before:left-2.5 before:top-0">
                <div className="mb-6 pl-7 relative group">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-violet-500 absolute left-0 top-0.5 shadow-md shadow-primary/25 group-hover:scale-110 transition-transform"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors">Version 7.5.0</h4>
                    <Badge variant="outline" className="text-xs bg-primary/5">April 20, 2024</Badge>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary transition-colors">•</span> Enhanced About page UI with modern animations
                    </li>
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary transition-colors">•</span> Added developer profile with current information
                    </li>
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary transition-colors">•</span> Improved notification display with interactive cards
                    </li>
                  </ul>
                </div>
                
                <div className="mb-6 pl-7 relative group">
                  <div className="w-5 h-5 rounded-full bg-muted absolute left-0 top-0.5 shadow-sm group-hover:bg-primary/30 transition-colors"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium group-hover:text-primary/70 transition-colors">Version 7.0.0</h4>
                    <Badge variant="outline" className="text-xs">April 8, 2024</Badge>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary/70 transition-colors">•</span> Introduced new modular dependency system
                    </li>
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary/70 transition-colors">•</span> Added custom color utility for better visualization
                    </li>
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary/70 transition-colors">•</span> Improved mobile structure and code organization
                    </li>
                  </ul>
                </div>
                
                <div className="pl-7 relative group">
                  <div className="w-5 h-5 rounded-full bg-muted absolute left-0 top-0.5 group-hover:bg-primary/30 transition-colors"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium group-hover:text-primary/70 transition-colors">Version 7.2.0</h4>
                    <Badge variant="outline" className="text-xs">April 3, 2024</Badge>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1.5">
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary/70 transition-colors">•</span> Fixed core icons not loading in charts
                    </li>
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary/70 transition-colors">•</span> Compatibility fixes for React and Next.js
                    </li>
                    <li className="group/item">
                      <span className="inline-block group-hover/item:text-primary/70 transition-colors">•</span> Enhanced chart rendering and screen contrast
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserCircle className="w-5 h-5" />
              Meet the Developer
            </CardTitle>
            <CardDescription className="text-base">
              The talented mind behind Budget Buddy
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-36 h-36 md:w-56 md:h-56 rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl relative group">
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
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-20"></div>
                <div className="absolute bottom-3 left-3 z-30 opacity-80 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium">Aditya Kumar Tiwari</p>
                  <p className="text-white/80 text-[10px]">Full-Stack Developer</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-5 text-center md:text-left">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent inline-block">Aditya Kumar Tiwari</h3>
                  <p className="text-muted-foreground">Cybersecurity Specialist • Full-Stack Developer • Sushant University</p>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
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
                
                <div className="flex gap-2 justify-center md:justify-start">
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
            </div>
            
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
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
                  </li>
                  <li className="group hover:bg-white/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                    <h5 className="text-sm font-medium flex items-center gap-2 mb-1">
                      <span className="group-hover:text-primary transition-colors">PropDekho</span>
                      <Badge className="text-[10px] h-4 bg-emerald-500/90 group-hover:bg-emerald-500 transition-colors">Real Estate</Badge>
                    </h5>
                    <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">A real estate website that helps users find and explore properties easily.</p>
                  </li>
                  <li className="group hover:bg-white/50 dark:hover:bg-gray-900/50 p-3 rounded-lg transition-colors">
                    <h5 className="text-sm font-medium flex items-center gap-2 mb-1">
                      <span className="group-hover:text-primary transition-colors">Real Estate ChatBot</span>
                      <Badge className="text-[10px] h-4 bg-violet-500/90 group-hover:bg-violet-500 transition-colors">AI Assistant</Badge>
                    </h5>
                    <p className="text-xs text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">A chatbot developed for real estate inquiries, offering users assistance in finding properties.</p>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-10 sm:mb-12 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-5 h-5" />
                Our Team
              </CardTitle>
              <CardDescription className="text-base">
                Meet the talented people behind Budget Buddy
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full blur-md"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-primary bg-white dark:bg-gray-900 rounded-full border-2 border-primary/20 z-10">BB</div>
                </div>
                <div>
                  <h3 className="font-medium">Budget Buddy Team</h3>
                  <p className="text-xs text-muted-foreground">A collaborative effort of financial and technical experts</p>
                </div>
              </div>
              
              <p className="text-sm mb-5 leading-relaxed">
                Budget Buddy is developed by a passionate team of developers, designers, and financial experts dedicated to
                making personal finance management accessible and engaging for everyone.
              </p>
              
              <Button 
                size="sm" 
                className="rounded-full h-9 text-xs px-5 gap-2 group transition-all" 
                asChild
              >
                <Link href="#">
                  <span>Meet Our Team</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="group-hover:translate-x-0.5 transition-transform"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="h-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="w-5 h-5" />
                Contact Us
              </CardTitle>
              <CardDescription className="text-base">
                We're here to help with any questions you might have
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 18,11"></polyline><path d="M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0"></path><line x1="6" y1="10" x2="7" y2="10"></line></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Customer Support</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Have questions, suggestions, or feedback? Our dedicated support team is ready to assist you with any inquiries.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19.23 15.26c-2.29-.46-2.4-2.54-2.4-2.54"></path><path d="M13.17 14.37c.58-.18 1.25-.5 1.8-1.15.73-.87 1-2.54.7-4.13-.32-1.77-1.95-3.17-3.76-3.25-2.32-.09-3.7 1.79-3.95 3.13-.34 1.77.1 3.48 1.43 4.58"></path><path d="M11.4 15.9c.48-.56.89-1.45 1-2.72.14-1.27.15-3.5-2.31-3.72-.62-.06-1.27.12-1.85.55-.6.45-1.92 1.67-1.92 3.61 0 2.55 5.13 2.28 5.08 2.28Z"></path><path d="M11.4 15.9c0 .7-.38 1.16-.93 1.16s-.93-.46-.93-1.16.38-1.16.93-1.16.93.46.93 1.16Z"></path><path d="M13.42 16.89c0 .46-.25.76-.61.76s-.61-.3-.61-.76.25-.76.61-.76.61.3.61.76Z"></path><path d="M14.95 16.48c.1.33-.04.57-.32.66s-.61-.07-.71-.4.04-.57.32-.66.61.07.71.4Z"></path><path d="M8.19 18.7c-.1-.33.04-.57.32-.66s.61.07.71.4-.04.57-.32.66-.61-.07-.71-.4Z"></path><path d="M7.98 16.97c0-.46.25-.76.61-.76s.61.3.61.76-.25.76-.61.76-.61-.3-.61-.76Z"></path><path d="M9.59 14.82a.586.586 0 0 1-.15.82.59.59 0 0 1-.82-.14c-.17-.25-.05-.72.26-.87.31-.15.55.03.71.19Z"></path><path d="M8.76 14.2c-.29.07-.54-.22-.64-.44-.12-.23.19-.55.44-.61.25-.04.59.19.59.47s-.21.54-.39.58Z"></path><path d="M13.09 12.95c.41-.2.71.15.79.37.12.33-.16.63-.42.71-.31.09-.67-.13-.7-.46s.1-.49.33-.62Z"></path><path d="M11.29 12c0-.21-.4-.96-1.5-.96s-1.5.75-1.5.96"></path><path d="M14.96 12c0-.21-.4-.96-1.5-.96s-1.5.75-1.5.96"></path><path d="M10.8 12a.2.2 0 0 1-.2-.2"></path><path d="M12.2 11.8a.2.2 0 0 1-.2.2"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">Feedback & Suggestions</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your input helps us improve! Share your thoughts on new features or improvements you'd like to see.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" variant="default" className="rounded-full h-9 text-xs px-5 gap-2 group hover:shadow-md transition-all" asChild>
                  <Link href="#">
                    <Mail className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Get in Touch</span>
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="rounded-full h-9 text-xs px-5 gap-2 border-primary/20 hover:bg-primary/5 group transition-all" asChild>
                  <Link href="#">
                    <UserCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span className="group-hover:translate-x-0.5 transition-transform">Contact Developer</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8 sm:mb-10 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Award className="w-4.5 h-4.5" />
              Certifications & Achievements
            </CardTitle>
            <CardDescription className="text-base">
              Recognitions and accolades for our team and product
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { title: "Foundations of Cybersecurity", color: "bg-blue-500" },
                { title: "Cisco Cyber Threat Management", color: "bg-orange-500" },
                { title: "OSForensics Triage", color: "bg-green-500" },
                { title: "Cybersecurity for Everyone", color: "bg-violet-500" },
                { title: "ISO 27001 Course", color: "bg-teal-500" },
                { title: "Endpoint Security", color: "bg-indigo-500" },
                { title: "Digital Footprint", color: "bg-amber-500" },
                { title: "Ethical Hacker", color: "bg-rose-500" },
              ].map((cert, i) => (
                <div key={i} className="rounded-md border border-muted p-3 flex items-center justify-center text-center">
                  <div>
                    <div className={`w-10 h-10 rounded-full ${cert.color} mx-auto flex items-center justify-center mb-2 text-white`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-medium leading-tight">{cert.title}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <Button variant="link" size="sm" className="text-xs">
                View All Certifications
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors py-2 px-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 