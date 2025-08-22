"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { 
  Wallet, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Calendar, 
  ShieldCheck,
  Check,
  BarChart,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FinancialDataFlow from "@/components/ui/financial-data-flow";

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

export function FeaturesSection() {
  return (
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

        <AdvancedAnalyticsSection />
      </div>
    </section>
  );
}

function AdvancedAnalyticsSection() {
  return (
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
          <FinancialDataFlow
            title="Smart Financial Data Processing & AI Insights"
            circleText="AI"
            badgeTexts={{
              first: "INCOME",
              second: "BUDGET", 
              third: "ANALYTICS",
              fourth: "INSIGHTS"
            }}
            buttonTexts={{
              first: "Budget Buddy",
              second: "Smart Analytics"
            }}
            lightColor="#22c55e"
            className="scale-90 sm:scale-100"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

