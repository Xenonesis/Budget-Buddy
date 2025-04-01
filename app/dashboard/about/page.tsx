"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="container max-w-5xl py-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight mb-2">About Budget Buddy</h1>
      <p className="text-muted-foreground mb-8">Your personal finance companion for financial freedom</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2">
          <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M15 14c.2-1 .7-1.7 1.5-2"></path><path d="M8 9a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"></path><path d="M17 9v9"></path><path d="M20 9h-6V5a2 2 0 1 1 4 0v6h4"></path></svg>
                Our Mission
              </CardTitle>
              <CardDescription>
                Empowering individuals and businesses to take control of their finances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <p>
                Budget Buddy is designed to help you manage your finances effectively and achieve your financial goals.
                Our application provides intuitive tools for tracking expenses, creating budgets, and analyzing your 
                spending patterns.
              </p>
              <p>
                We believe that financial management should be accessible to everyone, regardless of their financial 
                background or expertise. Our goal is to simplify personal finance and provide you with the insights 
                you need to make informed financial decisions.
              </p>
              <p>
                Developed with modern web technologies, Budget Buddy offers a seamless and responsive experience 
                across all your devices, with a focus on security, performance, and user experience.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22v-5"></path><path d="M9 8V2"></path><path d="M15 8V2"></path><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path><path d="M15 8v7"></path><path d="M9 8v7"></path></svg>
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>Expense tracking and categorization</span>
                </li>
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>Custom budget creation and visualization</span>
                </li>
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>Financial analytics with multiple chart types</span>
                </li>
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>Multi-currency support</span>
                </li>
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>AI-powered financial insights</span>
                </li>
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>Dark & light theme support</span>
                </li>
                <li className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors">
                  <span className="mr-2 text-primary">•</span>
                  <span>Responsive mobile design</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="mb-10 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            App Details
          </CardTitle>
          <CardDescription>
            Latest updates and version information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Image 
                  src="/logo.svg" 
                  alt="Budget Tracker Logo" 
                  width={24} 
                  height={24} 
                  className="h-6 w-6" 
                />
              </div>
              <div>
                <h3 className="font-medium">Budget Buddy</h3>
                <p className="text-sm text-muted-foreground">Version 7.3</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Latest</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M16 12l-4 4-4-4"></path><path d="M12 16V2"></path></svg>
                Released: April 8, 2024
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.3 Updates</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed build failure caused by import error</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Resolved circular dependency issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed module path resolution</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved code organization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced type checking and error handling</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.2 Updates (April 5, 2024)</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed dark mode text visibility in charts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Resolved Next.js compatibility issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed savings rate calculation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced chart readability in dark mode</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved handling of empty transaction data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M16 12l-4 4-4-4"></path><path d="M12 16V2"></path></svg>
                Previous Updates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.1 (April 3, 2024)</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed type error in settings page</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Resolved build failures</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved timezone and gender field handling</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced form data consistency</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Better type checking for data interfaces</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.0 (April 2, 2024)</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced category management</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Optimized radial charts for mobile and desktop</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Added dynamic screen size detection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Implemented colorful chart gradients</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Redesigned category deletion UI</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Performance Optimizations</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-md">DOM Optimization</Badge>
                <Badge variant="secondary" className="rounded-md">Efficient Data Processing</Badge>
                <Badge variant="secondary" className="rounded-md">Reduced Network Overhead</Badge>
                <Badge variant="secondary" className="rounded-md">UI Responsiveness</Badge>
                <Badge variant="secondary" className="rounded-md">Next.js 14.2</Badge>
                <Badge variant="secondary" className="rounded-md">React 18</Badge>
                <Badge variant="secondary" className="rounded-md">TypeScript 5.2</Badge>
                <Badge variant="secondary" className="rounded-md">Tailwind CSS</Badge>
                <Badge variant="secondary" className="rounded-md">Supabase</Badge>
                <Badge variant="secondary" className="rounded-md">Framer Motion</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2 mt-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
        Technical Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
              Performance Optimizations
            </CardTitle>
            <CardDescription>
              Techniques used to ensure optimal application performance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">DOM Manipulation Optimization</h5>
                <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>React.memo for component memoization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Optimized stateless functional components</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Event delegation for transaction lists</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Virtualization for long lists</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Efficient Data Processing</h5>
                <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Maps and Sets for O(1) lookups</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>useMemo for expensive operations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Single-pass algorithms for data transformation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Batched React state updates</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Technical Requirements
            </CardTitle>
            <CardDescription>
              Setup information for developers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2">Environment Setup</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  Before building or deploying this project:
                </p>
                <div className="bg-primary/5 p-3 rounded-md text-sm font-mono mb-2">
                  <p className="mb-1">NEXT_PUBLIC_SUPABASE_URL=your-supabase-url</p>
                  <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  These environment variables are required for the application to function properly.
                </p>
              </div>
              
              <div>
                <h5 className="text-sm font-medium mb-2">Installation Requirements</h5>
                <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Node.js (v18 or newer)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>npm or yarn</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5 text-primary">•</span>
                    <span>Supabase account</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Meet the Developer
      </h2>
      
      <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow overflow-hidden border-border/60">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 border-b border-border/50">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0 bg-background shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full" />
                <Image 
                  src="/developer-profile.svg" 
                  alt="Aditya Kumar Tiwari" 
                  width={144} 
                  height={144} 
                  className="object-cover"
                  priority
                />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold">Aditya Kumar Tiwari</h3>
                <p className="text-muted-foreground mb-2">Cybersecurity Enthusiast | Web Developer | Lifelong Learner</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge variant="secondary">Cybersecurity</Badge>
                  <Badge variant="secondary">Python</Badge>
                  <Badge variant="secondary">JavaScript</Badge>
                  <Badge variant="secondary">HTML/CSS</Badge>
                  <Badge variant="secondary">Linux</Badge>
                </div>
                
                <p className="mb-4">
                  Aditya is a passionate Cybersecurity Specialist and Full-Stack Developer currently pursuing a BCA in 
                  Cybersecurity at Sushant University. He thrives at the intersection of technology and innovation, 
                  crafting secure and scalable solutions for real-world challenges. His expertise spans Digital Forensics, 
                  Linux, Python, and web development technologies.
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="https://iaddy.netlify.app/" target="_blank" rel="noopener noreferrer">
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
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="https://www.linkedin.com/in/itisaddy/" target="_blank" rel="noopener noreferrer">
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
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <Link href="https://www.instagram.com/i__aditya7/" target="_blank" rel="noopener noreferrer">
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
                  </Button>
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <a href="mailto:itisaddy7@gmail.com">
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
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  Professional Experience
                </h4>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border bg-card/80 hover:bg-card hover:shadow-sm transition-all">
                    <div className="font-medium">Mentor (Part-time)</div>
                    <div className="text-sm text-muted-foreground">JhaMobii Technologies Pvt. Ltd., Remote</div>
                    <div className="text-xs text-primary mb-2">Aug 2024 - Present</div>
                    <ul className="text-sm space-y-1">
                      <li>• Provided technical mentorship in cybersecurity</li>
                      <li>• Guided team members through vulnerability assessments</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-lg border bg-card/80 hover:bg-card hover:shadow-sm transition-all">
                    <div className="font-medium">Cybersecurity Intern</div>
                    <div className="text-sm text-muted-foreground">Null, Remote</div>
                    <div className="text-xs text-primary mb-2">Jun 2024 - Present</div>
                    <ul className="text-sm space-y-1">
                      <li>• Conducted vulnerability assessments</li>
                      <li>• Monitored network traffic and responded to security incidents</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                  Certifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">Foundations of Cybersecurity</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">Cyber Threat Management</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">OSForensics Triage</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">Endpoint Security</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">ISO 27001</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">Ethical Hacker</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">Network Support</Badge>
                  <Badge className="py-2 px-3 rounded-lg border bg-primary/10 text-primary justify-center hover:bg-primary/20 transition-colors">Technical Support</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-muted-foreground mb-4">
        © {new Date().getFullYear()} Budget Buddy. All rights reserved.
      </div>
    </div>
  );
} 