"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Logo } from "@/components/ui/logo";

export default function AboutPage() {
  return (
    <div className="container max-w-5xl py-8 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2 brand-text inline-block">About Budget Buddy</h1>
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
        <CardHeader className="bg-gradient-to-r from-primary/10 to-violet-400/10 border-b border-primary/10">
          <CardTitle className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5z"></path><path d="M2 12h20"></path><path d="M2 18h20"></path></svg>
            App Details
          </CardTitle>
          <CardDescription>
            Latest updates and version information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Logo size="lg" withText />
              <div className="flex items-center gap-2 ml-2">
                <p className="text-sm text-muted-foreground">Version 8.1.0</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shadow-sm">Latest</Badge>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden md:block"
            >
              <Button variant="outline" size="sm" className="rounded-full h-8 border-primary/30 hover:bg-primary/10 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                View on GitHub
              </Button>
            </motion.div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="M16 12l-4 4-4-4"></path><path d="M12 16V2"></path></svg>
                </div>
                <h4 className="text-sm font-semibold">
                  Released: July 13, 2024
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 hover:shadow-md transition-all"
                  whileHover={{ y: -5 }}
                >
                  <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>
                    Version 8.0.0 key updates:
                  </h5>
                  <ul className="text-sm space-y-2 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Updated to Next.js 15.3.0 and React 19.1.0</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed developer profile image using inline SVG</span>
                    </li>
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
                  </ul>
                </motion.div>
                
                <motion.div 
                  className="p-4 rounded-xl border bg-card/50 hover:bg-card/80 hover:shadow-md transition-all"
                  whileHover={{ y: -5 }}
                >
                  <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </div>
                    Technical improvements:
                  </h5>
                  <ul className="text-sm space-y-2 text-muted-foreground ml-1">
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Improved compatibility with modern browsers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Enhanced performance with latest React features</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Replaced external SVG with inline SVG avatar</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Added gradient borders and glow effects</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5 text-primary">•</span>
                      <span>Fixed SVG image rendering issues</span>
                    </li>
                  </ul>
                </motion.div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="relative pb-6">
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-primary/20"></div>
              <h4 className="text-sm font-semibold mb-6 flex items-center relative z-10">
                <div className="h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center mr-4 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="12 8 12 12 14 14"></polyline><path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5"></path></svg>
                </div>
                Version History
              </h4>
              
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex items-start relative">
                    <div className="h-6 w-6 rounded-full bg-violet-100 border-4 border-white dark:border-gray-900 flex items-center justify-center mr-5 shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-violet-500"></div>
                    </div>
                    <motion.div 
                      className="flex-1 p-4 rounded-xl border bg-card/50 hover:bg-card/80 hover:shadow-md transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-sm font-medium">Version 7.5.0</h5>
                        <span className="text-xs text-muted-foreground">April 20, 2024</span>
                      </div>
                      <ul className="text-xs space-y-1.5 text-muted-foreground ml-1">
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
                      </ul>
                    </motion.div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-start relative">
                    <div className="h-6 w-6 rounded-full bg-blue-100 border-4 border-white dark:border-gray-900 flex items-center justify-center mr-5 shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <motion.div 
                      className="flex-1 p-4 rounded-xl border bg-card/50 hover:bg-card/80 hover:shadow-md transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-sm font-medium">Version 7.3.0</h5>
                        <span className="text-xs text-muted-foreground">April 8, 2024</span>
                      </div>
                      <ul className="text-xs space-y-1.5 text-muted-foreground ml-1">
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
                    </motion.div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-start relative">
                    <div className="h-6 w-6 rounded-full bg-green-100 border-4 border-white dark:border-gray-900 flex items-center justify-center mr-5 shadow-sm z-10">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <motion.div 
                      className="flex-1 p-4 rounded-xl border bg-card/50 hover:bg-card/80 hover:shadow-md transition-all"
                      whileHover={{ x: 5 }}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <h5 className="text-sm font-medium">Version 7.2.0</h5>
                        <span className="text-xs text-muted-foreground">April 5, 2024</span>
                      </div>
                      <ul className="text-xs space-y-1.5 text-muted-foreground ml-1">
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
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mb-10">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><path d="M15 2v2"></path><path d="M15 20v2"></path><path d="M2 15h2"></path><path d="M20 15h2"></path><path d="m3.6 3.6 1.4 1.4"></path><path d="m19 19 1.4 1.4"></path><path d="m3.6 20.4 1.4-1.4"></path><path d="m19 5 1.4-1.4"></path></svg>
          Technology Stack
        </h2>
        
        <div className="bg-gradient-to-r from-primary/5 to-violet-400/5 rounded-xl p-6 border shadow-sm mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
            {[
              { name: "Next.js", version: "15.3.0", color: "#000000", icon: 
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <path d="M11.572 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
                </svg>
              },
              { name: "React", version: "19.1.0", color: "#007acc", icon: 
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38a2.167 2.167 0 0 0-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44a23.476 23.476 0 0 0-3.107-.534A23.892 23.892 0 0 0 12.769 4.7c1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442a22.73 22.73 0 0 0-3.113.538 15.02 15.02 0 0 1-.254-1.42c-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87a25.64 25.64 0 0 1-4.412.005 26.64 26.64 0 0 1-1.183-1.86c-.372-.64-.71-1.29-1.018-1.946a25.17 25.17 0 0 1 1.013-1.954c.38-.66.773-1.286 1.18-1.868A25.245 25.245 0 0 1 12 8.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933a25.952 25.952 0 0 0-1.345-2.32zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493a23.966 23.966 0 0 0-1.1-2.98c.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98a23.142 23.142 0 0 0-1.086 2.964c-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39a25.819 25.819 0 0 0 1.341-2.338zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143a22.005 22.005 0 0 1-2.006-.386c.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295a1.185 1.185 0 0 1-.553-.132c-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z" />
                </svg>
              },
              { name: "TypeScript", version: "5.2", color: "#2F74C0", icon: 
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z" />
                </svg>
              },
              { name: "Tailwind", version: "3.4", color: "#2D3748", icon: 
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
                </svg>
              },
              { name: "Supabase", version: "2.x", color: "#3ECF8E", icon: 
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.648 12.525c-.329.433-.048 1.141.508 1.141h9.363v8.962a.396.396 0 0 0 .716.233l8.636-12.363c.329-.433.048-1.141-.509-1.141zM12 12.951H5.868l6.132-8.567v8.567zm6.132 2.611L12 24.129v-8.567h6.132z" />
                </svg>
              },
              { name: "Framer", version: "11.x", color: "#000000", icon: 
                <svg viewBox="0 0 24 24" fill="currentColor" height="24" width="24">
                  <path d="M4 0h16v8h-8v8H4V0zm0 8h8v8H4v-8z" />
                </svg>
              },
              { name: "Recharts", version: "2.15", color: "#8A2BE2", icon: 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              },
              { name: "ShadcnUI", version: "1.x", color: "#5E35B1", icon: 
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              },
            ].map((tech, index) => (
              <motion.div
                key={tech.name}
                className="group relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`p-4 h-full rounded-lg bg-opacity-10 flex flex-col items-center justify-center gap-2 border shadow-sm hover:shadow-md transition-all`}
                  style={{ backgroundColor: `${tech.color}20` }}>
                  <div className="h-12 w-12 flex items-center justify-center text-primary mb-1">
                    {tech.icon}
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-sm">{tech.name}</div>
                    <div className="text-xs text-muted-foreground">{tech.version}</div>
                  </div>

                  {/* Progress bar representing skill level */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-in-out group-hover:w-full" 
                      style={{ 
                        backgroundColor: tech.color,
                        width: `${75 + Math.random() * 25}%`
                      }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-primary hover:underline hover:text-primary/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Return to Dashboard
          </Link>
          
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link 
              href="https://iaddy.netlify.app/tech-stack" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              View Repository
            </Link>
          </motion.div>
        </div>
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
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative h-36 w-36 rounded-xl overflow-hidden shadow-lg hover:shadow-primary/30 hover:shadow-2xl transition-shadow"
              style={{
                background: `linear-gradient(to right, rgba(109, 40, 217, 0.7), rgba(139, 92, 246, 0.7))`,
                padding: '3px' // Creates space for gradient border
              }}
            >
              <div className="w-full h-full rounded-lg overflow-hidden">
                <Image
                  src="/developer-profile.jpg"
                  alt="Aditya Kumar Tiwari"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M12 8a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2"></path><path d="M16 7h.01"></path><path d="M12 20h8a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-8a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1Z"></path></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
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