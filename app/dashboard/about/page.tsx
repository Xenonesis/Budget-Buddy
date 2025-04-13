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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent inline-block">About Budget Buddy</h1>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22v-5"></path><path d="M9 8V2"></path><path d="M15 8V2"></path><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"></path><path d="M15 8v7"></path><path d="M9 8v7"></path></svg>
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
      
      <Card className="mb-10 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"></path><path d="M2 12h20"></path><path d="M2 18h20"></path></svg>
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
                  alt="Budget Buddy Logo" 
                  width={24} 
                  height={24} 
                  className="h-6 w-6" 
                />
              </div>
              <div>
                <h3 className="font-medium">Budget Buddy</h3>
                <p className="text-sm text-muted-foreground">Version 7.5.0</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Latest</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M16 12l-4 4-4-4"></path><path d="M12 16V2"></path></svg>
                Released: April 20, 2024
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.5.0 key updates:</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced About page UI with modern animations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Updated developer profile with current information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved certification display with interactive cards</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Added direct links to developer's professional profiles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Added featured projects and experience section</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Technical improvements:</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Integrated Framer Motion for smooth animations</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved responsive layout for all device sizes</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced accessibility with better contrast and focus states</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Optimized image loading with better performance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Updated copyright information for 2025</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M16 12l-4 4-4-4"></path><path d="M12 16V2"></path></svg>
                Previous Releases
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.3.0 (April 8, 2024)</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed build failures and circular dependency issues</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>New dedicated colors utility for better visualization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved module structure and code organization</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium mb-2">Version 7.2.0 (April 5, 2024)</h5>
                  <ul className="text-sm space-y-1.5 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed dark mode text visibility in charts</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Compatibility fixes for Next.js and React</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced chart readability with better contrast</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Technology Stack
        </h2>
        <div className="flex flex-wrap gap-3 mb-6">
          <Badge className="bg-[#000000] text-white py-1 px-3">Next.js 13.3</Badge>
          <Badge className="bg-[#007acc] text-white py-1 px-3">React 18</Badge>
          <Badge className="bg-[#2F74C0] text-white py-1 px-3">TypeScript 5.2</Badge>
          <Badge className="bg-[#2D3748] text-white py-1 px-3">Tailwind CSS</Badge>
          <Badge className="bg-[#3ECF8E] text-white py-1 px-3">Supabase</Badge>
          <Badge className="bg-[#000000] text-white py-1 px-3">Framer Motion</Badge>
          <Badge className="bg-[#8A2BE2] text-white py-1 px-3">Recharts</Badge>
          <Badge className="bg-[#5E35B1] text-white py-1 px-3">shadcn/ui</Badge>
        </div>
        
        <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m9 18 6-6-6-6"></path></svg>
          Return to Dashboard
        </Link>
      </div>
      
      <Card className="mb-10 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-violet-400/5 opacity-50"></div>
          <CardTitle className="flex items-center gap-2 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Meet the Developer
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative h-36 w-36 rounded-xl overflow-hidden shadow-lg border-2 border-primary/30"
            >
              <Image
                src="/developer-profile.svg"
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
          
          <Separator className="my-6" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"></path><path d="M16 7h.01"></path><path d="M12 20h8a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1Z"></path></svg>
                Professional Experience
              </h4>
              <div className="space-y-3">
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <h5 className="font-medium text-sm">Mentor (Part-time)</h5>
                  <p className="text-xs text-muted-foreground">JhaMobii Technologies Pvt. Ltd.</p>
                  <p className="text-xs text-primary">Aug 2024 - Present</p>
                </div>
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <h5 className="font-medium text-sm">Cybersecurity Intern</h5>
                  <p className="text-xs text-muted-foreground">Null, Remote</p>
                  <p className="text-xs text-primary">Jun 2024 - Present</p>
                </div>
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <h5 className="font-medium text-sm">Cybersecurity and AI/ML Intern</h5>
                  <p className="text-xs text-muted-foreground">Quantam Pvt. Ltd., Gurugram</p>
                  <p className="text-xs text-primary">Oct 2024 - Present</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"></path><path d="m9 12 2 2 4-4"></path></svg>
                Featured Projects
              </h4>
              <div className="space-y-3">
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <h5 className="font-medium text-sm">Innova</h5>
                  <p className="text-xs text-muted-foreground">Modern E-commerce Platform</p>
                </div>
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <h5 className="font-medium text-sm">PropDekho</h5>
                  <p className="text-xs text-muted-foreground">Real Estate Website</p>
                </div>
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <h5 className="font-medium text-sm">Real Estate Chatbot</h5>
                  <p className="text-xs text-muted-foreground">AI Assistance for Property Search</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
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