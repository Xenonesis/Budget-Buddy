"use client";

import { motion } from "framer-motion";
import { 
  Check,
  BarChart,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import FinancialDataFlow from "@/components/ui/financial-data-flow";
import { FinancialSpotlightCards } from "./financial-spotlight-cards";
import { ErrorBoundary } from "@/components/ui/error-boundary";


export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-32 relative overflow-hidden">
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
          className="max-w-xl mx-auto text-center mb-8 sm:mb-12 md:mb-16"
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
              className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl mb-3 sm:mb-4 relative px-2 sm:px-0"
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
                <span className="block sm:inline">manage your money</span>
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
            className="text-base sm:text-lg text-muted-foreground px-2 sm:px-0"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Powerful tools to help you take control of your finances and achieve your financial goals.
          </motion.p>
        </motion.div>

        <FinancialSpotlightCards />

        <AdvancedAnalyticsSection />
      </div>
    </section>
  );
}

function AdvancedAnalyticsSection() {
  return (
    <motion.div
      className="mt-12 sm:mt-16 md:mt-20 lg:mt-24 border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-500"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
    >
      <div className="grid md:grid-cols-2">
        <div className="p-6 sm:p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
          <motion.h3
            className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-gradient-primary">Advanced Budget Analytics</span>
          </motion.h3>
          <motion.p
            className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Get powerful insights into your spending patterns with our intuitive analytics dashboard. Identify trends, spot opportunities to save, and make data-driven financial decisions.
          </motion.p>
          <motion.div
            className="grid grid-cols-1 gap-3 mb-6 sm:mb-8"
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
          className="bg-muted/30 p-4 sm:p-6 flex items-center justify-center order-1 md:order-2 min-h-[300px] sm:min-h-[400px]"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <ErrorBoundary
            fallback={
              <div className="flex items-center justify-center h-64 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Financial visualization temporarily unavailable</p>
              </div>
            }
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
              className="scale-75 sm:scale-90 md:scale-100"
            />
          </ErrorBoundary>
        </motion.div>
      </div>
    </motion.div>
  );
}

