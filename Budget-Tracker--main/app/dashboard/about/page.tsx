"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, Book, Sparkles, ShieldCheck, RefreshCw } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container max-w-5xl py-8 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent drop-shadow-sm animate-gradient-x inline-block">About Budget Buddy</h1>
        <p className="text-muted-foreground mb-8">Your personal finance companion for smarter decisions and financial freedom</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          className="md:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="h-full overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={18} />
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
                spending patterns with advanced visualizations and AI insights.
              </p>
              <p>
                We believe that financial management should be accessible to everyone, regardless of their financial 
                background or expertise. Our goal is to simplify personal finance and provide you with the insights 
                you need to make informed financial decisions while maintaining complete privacy and security.
              </p>
              <p>
                Developed with modern web technologies, Budget Buddy offers a seamless and responsive experience 
                across all your devices, with a focus on security, performance, and exceptional user experience.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 items-center">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">Security Focused</Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">Privacy First</Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">User Centered</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <Book size={18} />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {[
                  "Expense tracking and categorization",
                  "Custom budget creation and visualization",
                  "Financial analytics with multiple chart types",
                  "Multi-currency support",
                  "AI-powered financial insights",
                  "Dark & light theme support",
                  "Responsive mobile design"
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start rounded-md p-2 hover:bg-muted/50 transition-colors"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <span className="mr-2 text-primary">•</span>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center">
          <Sparkles size={20} />
          <span className="relative">
            App Details
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 to-violet-400/50 rounded-full"></span>
          </span>
        </h2>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden border-animated relative">
          <CardContent className="p-0">
            {/* App Info Header */}
            <div className="p-6 bg-gradient-to-r from-primary/10 to-violet-400/10 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="h-16 w-16 bg-gradient-to-br from-primary/20 to-violet-500/30 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <motion.div
                    animate={{ 
                      boxShadow: ['0 0 0 0 rgba(124, 58, 237, 0)', '0 0 0 8px rgba(124, 58, 237, 0.2)', '0 0 0 0 rgba(124, 58, 237, 0)'] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'loop'
                    }}
                    className="absolute inset-0 rounded-xl"
                  ></motion.div>
                  <Image 
                    src="/logo.svg" 
                    alt="Budget Buddy Logo" 
                    width={32} 
                    height={32}
                    className="h-8 w-8 relative z-10" 
                  />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent drop-shadow-sm">Budget Buddy</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="default" className="bg-gradient-to-r from-primary to-violet-500 text-white px-2.5 text-xs font-medium shadow-sm">v7.7.0</Badge>
                    <span className="text-sm text-muted-foreground">Last Updated: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <motion.div whileHover={{ y: -3 }} className="shadow-sm">
                  <Button size="sm" variant="outline" className="rounded-full border-primary/20 hover:border-primary/40 hover:bg-primary/5 shadow-sm">
                    <CreditCard size={16} />
                    Source Code
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} className="shadow-sm">
                  <Button size="sm" className="rounded-full shadow-sm">
                    <RefreshCw size={16} />
                    Check for Updates
                  </Button>
                </motion.div>
              </div>
            </div>
            
            {/* Latest Version Features */}
            <div className="p-6 pt-8">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-semibold flex items-center">
                    <motion.div 
                      animate={{ rotate: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                      className="mr-2 text-primary"
                    >
                      <ShieldCheck size={18} />
                    </motion.div>
                    <span className="relative">
                      What's New in Version 7.7.0
                      <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full"></span>
                    </span>
                  </h4>
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-primary/20 bg-primary/5 text-primary">Latest</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3 p-3 rounded-lg border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
                        <Book className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">System-wide Optimization</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Improved overall system performance with optimized database queries and reduced API response times by 40%.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-3 rounded-lg border border-blue-500/10 bg-blue-500/5 hover:bg-blue-500/10 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-500/20 flex items-center justify-center text-blue-500 shadow-sm">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">Continuous Learning Mechanism</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Implemented an adaptive feedback system that learns from user interactions to provide more personalized financial insights.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-3 p-3 rounded-lg border border-violet-500/10 bg-violet-500/5 hover:bg-violet-500/10 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/30 to-violet-500/20 flex items-center justify-center text-violet-500 shadow-sm">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">Enhanced Security Protocol</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Strengthened data protection with advanced encryption algorithms and added two-factor authentication options.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 p-3 rounded-lg border border-amber-500/10 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
                        <RefreshCw className="h-5 w-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm">Automatic Update Framework</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Introduced a seamless update system that applies improvements in the background without disrupting user experience.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Version History */}
              <div>
                <h4 className="text-base font-semibold mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path></svg>
                  <span className="relative">
                    Version History
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full"></span>
                  </span>
                </h4>
                
                <div className="space-y-0 relative pl-1.5">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[1.55rem] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/70 via-primary/30 to-primary/10"></div>
                  
                  {/* Version 7.7.0 */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-4 relative pb-6 hover:bg-primary/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center text-white shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-sm">Version 7.7.0</h5>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-primary/5 border-primary/20 w-fit">{new Date().toLocaleDateString()}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1.5">
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>System-wide optimization with 40% faster API response times</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Adaptive feedback system for personalized financial insights</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Enhanced security with advanced encryption and 2FA</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Seamless background update system implementation</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Version 7.6.0 */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-start gap-4 relative pb-6 hover:bg-primary/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary/90 to-violet-500/90 flex items-center justify-center text-white shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-sm">Version 7.6.0</h5>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-primary/5 border-primary/20 w-fit">May 15, 2025</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1.5">
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Enhanced mobile menu with improved UI and animation</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Fixed overlapping elements on small screens</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Improved brand typography with animations</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Version 7.5.0 */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-start gap-4 relative pb-6 hover:bg-primary/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary/90 to-violet-500/90 flex items-center justify-center text-white shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-sm">Version 7.5.0</h5>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-primary/5 border-primary/20 w-fit">April 20, 2025</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1.5">
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Modern animations and interactive UI elements</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Updated app branding from "Budget Tracker" to "Budget Buddy"</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Enhanced about page with improved App Details UI</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Version 7.3.0 */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-start gap-4 relative pb-6 hover:bg-primary/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary to-violet-500 flex items-center justify-center text-white shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-sm">Version 7.3.0</h5>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-primary/5 border-primary/20 w-fit">April 8, 2025</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1.5">
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Fixed build failures and circular dependency issues</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>New dedicated colors utility for better visualization</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Improved module structure and code organization</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                  
                  {/* Version 7.2.0 */}
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="flex items-start gap-4 relative hover:bg-primary/5 p-3 rounded-lg transition-colors"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary/70 to-violet-500/70 flex items-center justify-center text-white shadow-sm z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h5 className="font-semibold text-sm">Version 7.2.0</h5>
                        <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-primary/5 border-primary/20 w-fit">April 5, 2025</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1.5">
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Fixed dark mode text visibility in charts</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Compatibility fixes for Next.js and React</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <span className="text-primary">•</span>
                          <span>Enhanced chart readability with better contrast</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary"><path d="M12.9 6.858 17.142 11.1l-1.958 1.958-6.284 6.284-4.243-4.243L11.9 7.857l1 1Z"></path><path d="M9 15.142 4.858 11l5.284-5.284 4.242 4.243L9 15.143Z"></path></svg>
          Technology Stack
        </h2>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="space-y-2"
              >
                <h3 className="font-medium text-base border-l-2 border-primary pl-2">Frontend</h3>
                <div className="flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-black dark:bg-white flex items-center justify-center">
                      <svg viewBox="0 0 180 180" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="dark:invert"><path d="M 90 0 L 180 180 L 0 180 Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="24"></path></svg>
                    </div>
                    <div>
                      <div className="font-medium">Next.js</div>
                      <div className="text-xs text-muted-foreground">v15.3</div>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#007acc]/10 flex items-center justify-center text-[#007acc] dark:text-[#61dafb]">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9.55C12.917 8.613 14.111 8 15.5 8c2.485 0 4.5 2.015 4.5 4.5S17.985 17 15.5 17c-1.389 0-2.583-.613-3.5-1.55"></path><path d="M8.5 17C6.015 17 4 14.985 4 12.5S6.015 8 8.5 8c1.389 0 2.583.613 3.5 1.55"></path><line x1="12" y1="9.5" x2="12" y2="14.5"></line></svg>
                    </div>
                    <div>
                      <div className="font-medium">React</div>
                      <div className="text-xs text-muted-foreground">v18.2</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="space-y-2"
              >
                <h3 className="font-medium text-base border-l-2 border-primary pl-2">Styling & UI</h3>
                <div className="flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#38bdf8]/10 flex items-center justify-center text-[#38bdf8]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                    </div>
                    <div>
                      <div className="font-medium">Tailwind CSS</div>
                      <div className="text-xs text-muted-foreground">v3.3</div>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#5e35b1]/10 flex items-center justify-center text-[#5e35b1]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2H8C5 2 3 4 3 7v10c0 3 2 5 5 5h8c3 0 5-2 5-5V7c0-3-2-5-5-5Z"></path><path d="M9 22V16c0-1 1-2 2-2h2c1 0 2 1 2 2v6"></path><path d="M8 10h8"></path><path d="M8 6h8"></path></svg>
                    </div>
                    <div>
                      <div className="font-medium">shadcn/ui</div>
                      <div className="text-xs text-muted-foreground">Components</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-2"
              >
                <h3 className="font-medium text-base border-l-2 border-primary pl-2">Backend & Data</h3>
                <div className="flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#3ecf8e]/10 flex items-center justify-center text-[#3ecf8e]">
                      <svg width="24" height="24" viewBox="0 0 109 113" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"><path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"></path><path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="currentColor"></path><path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04075L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="currentColor"></path></svg>
                    </div>
                    <div>
                      <div className="font-medium">Supabase</div>
                      <div className="text-xs text-muted-foreground">Auth & Database</div>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#2F74C0]/10 flex items-center justify-center text-[#2F74C0]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
                    </div>
                    <div>
                      <div className="font-medium">TypeScript</div>
                      <div className="text-xs text-muted-foreground">v5</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-2"
              >
                <h3 className="font-medium text-base border-l-2 border-primary pl-2">Animation & Charts</h3>
                <div className="flex flex-col gap-2">
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#ff4154]/10 flex items-center justify-center text-[#ff4154]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 15-3-3 3-3"></path><path d="m2 9 3 3-3 3"></path><path d="M9 5h6"></path><path d="M9 19h6"></path><path d="M15 5c.83 0 1.5.67 1.5 1.5S15.83 8 15 8"></path><path d="M9 5c-.83 0-1.5.67-1.5 1.5S8.17 8 9 8"></path><path d="M15 19c.83 0 1.5-.67 1.5-1.5S15.83 16 15 16"></path><path d="M9 19c-.83 0-1.5-.67-1.5-1.5S8.17 16 9 16"></path><path d="M12 12v-3"></path><path d="M12 12h3"></path></svg>
                    </div>
                    <div>
                      <div className="font-medium">Framer Motion</div>
                      <div className="text-xs text-muted-foreground">v11.18</div>
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.03, x: 5 }} className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5">
                    <div className="h-10 w-10 rounded-md bg-[#8A2BE2]/10 flex items-center justify-center text-[#8A2BE2]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </div>
                    <div>
                      <div className="font-medium">Recharts</div>
                      <div className="text-xs text-muted-foreground">v2.15</div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 pt-6 border-t"
            >
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m9 18 6-6-6-6"></path></svg>
                </div>
                <p className="text-sm">
                  Built with <span className="font-medium">Next.js 15.3</span> with Turbopack for faster development and builds
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
        
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
          Return to Dashboard
        </Link>
      </motion.div>
      
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary"><path d="M12.9 6.858 17.142 11.1l-1.958 1.958-6.284 6.284-4.243-4.243L11.9 7.857l1 1Z"></path><path d="M9 15.142 4.858 11l5.284-5.284 4.242 4.243L9 15.143Z"></path></svg>
          Meet the Developer
        </h2>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
          <CardContent className="px-6 py-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative h-36 w-36 rounded-xl overflow-hidden shadow-lg border-2 border-primary/30"
              >
                <Image
                  src="/developer-profile.jpg"
                  alt="Aditya Kumar Tiwari"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
              <div className="space-y-4 text-center md:text-left flex-1">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent inline-block">Aditya Kumar Tiwari</h3>
                  <p className="text-sm text-muted-foreground mb-2">Cybersecurity Specialist • Full-Stack Developer • Sushant University</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-3">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">Digital Forensics</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">Linux</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">Python</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">JavaScript</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">HTML/CSS</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">React</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">Next.js</Badge>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">Firebase</Badge>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed">
                  Aditya is a passionate Cybersecurity Specialist and Full-Stack Developer currently pursuing a BCA in Cybersecurity at Sushant University. 
                  He thrives at the intersection of technology and innovation, crafting secure and scalable solutions for real-world challenges. 
                  His expertise spans Digital Forensics, Linux, Python, and web development technologies, with a focus on creating impactful digital experiences.
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <motion.div whileHover={{ y: -3 }}>
                    <Link href="https://iaddy.netlify.app/" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full h-9 px-4 border-primary/30 hover:bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.39 6.39a7.05 7.05 0 0 1 1.55 3.61h-3.1a13.89 13.89 0 0 0-.39-3.61zM13 4.04a7.08 7.08 0 0 1 3.14.73 12.35 12.35 0 0 1-1.5 3.23h-1.64zm-2 0v3.96H9.36a12.35 12.35 0 0 1-1.5-3.23A7.08 7.08 0 0 1 11 4.04zM7.86 6h-.7A7.05 7.05 0 0 1 10.61 4a12.02 12.02 0 0 0-2.75 2zm-1.25 2.39A7.05 7.05 0 0 1 8.16 12H5.06a7.05 7.05 0 0 1 1.55-3.61zM5.06 14h3.1a13.89 13.89 0 0 0 .39 3.61A7.05 7.05 0 0 1 5.06 14zm2.1 5.61h.7a12.02 12.02 0 0 0 2.75 2 7.05 7.05 0 0 1-3.45-2z"></path></svg>
                        Portfolio
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }}>
                    <Link href="https://github.com/Xenonesis" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full h-9 px-4 border-primary/30 hover:bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                        GitHub
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }}>
                    <Link href="https://www.linkedin.com/in/itisaddy/" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full h-9 px-4 border-primary/30 hover:bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        LinkedIn
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }}>
                    <Link href="https://www.instagram.com/i__aditya7?igsh=c2JzeHl2a2J6NGU=" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full h-9 px-4 border-primary/30 hover:bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        Instagram
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1"
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                Budget Buddy is developed by a passionate team of developers, designers, and financial experts dedicated to making personal finance management accessible and engaging for everyone.
              </p>
              <Button className="rounded-full px-4" size="sm">
                Meet the Team
              </Button>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex-1"
        >
          <Card className="shadow-md hover:shadow-lg transition-shadow h-full">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">
                Have questions, suggestions, or feedback? We'd love to hear from you! Reach out to our support team for prompt assistance.
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.div whileHover={{ y: -3 }}>
                  <Button className="rounded-full px-4 bg-primary/90 hover:bg-primary" size="sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Get in Touch
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                  <Link href="https://iaddy.netlify.app/#contact" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full px-4 border-primary/30 hover:bg-primary/10" size="sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Contact Developer
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div 
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"></path><path d="m9 12 2 2 4-4"></path></svg>
          Certifications & Achievements
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-blue-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            Foundations of Cybersecurity
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-red-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Cyber Threat Management
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-green-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            OSForensics Triage
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-amber-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Endpoint Security
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-purple-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            ISO 27001 Course
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-teal-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            Ethical Hacker
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-indigo-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            Cybersecurity for Everyone
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-slate-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            Digital Footprint
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-pink-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            Network Support and Security
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-emerald-500/80 text-white text-center py-2 px-3 rounded-md text-xs shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            Prompt Engineering for AI
          </motion.div>
        </div>
        
        <div className="text-center">
          <Link href="https://iaddy.netlify.app/#certifications" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="rounded-full h-8 text-xs">
              View All Certifications
            </Button>
          </Link>
        </div>
      </motion.div>
      
      <motion.div 
        className="text-center mt-12 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Separator className="mb-6" />
        <div className="flex flex-col md:flex-row gap-2 items-center justify-center text-sm text-muted-foreground">
          <div>© 2025 Budget Buddy. All rights reserved.</div>
          <div className="hidden md:block">|</div>
          <div>
            Developed with <span className="text-red-500">❤️</span> by{" "}
            <Link href="https://iaddy.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Aditya Kumar Tiwari
            </Link>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link href="https://github.com/Xenonesis" target="_blank" rel="noopener noreferrer">
            <motion.div whileHover={{ y: -2 }} className="text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            </motion.div>
          </Link>
          <Link href="https://www.linkedin.com/in/itisaddy/" target="_blank" rel="noopener noreferrer">
            <motion.div whileHover={{ y: -2 }} className="text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </motion.div>
          </Link>
          <Link href="https://www.instagram.com/i__aditya7?igsh=c2JzeHl2a2J6NGU=" target="_blank" rel="noopener noreferrer">
            <motion.div whileHover={{ y: -2 }} className="text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </motion.div>
          </Link>
          <Link href="https://iaddy.netlify.app/" target="_blank" rel="noopener noreferrer">
            <motion.div whileHover={{ y: -2 }} className="text-muted-foreground hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 