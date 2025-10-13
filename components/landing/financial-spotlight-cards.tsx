"use client";

import { CardSpotlight } from "@/components/ui/card-spotlight";
import { 
  Wallet, 
  PieChart, 
  LineChart, 
  TrendingUp, 
  Calendar, 
  ShieldCheck,
  Check,
  DollarSign,
  Target,
  Bell
} from "lucide-react";
import { motion } from "framer-motion";

const financialFeatures = [
  {
    title: "Smart Expense Tracking",
    description: "Automatically categorize and track all your expenses with AI-powered recognition.",
    icon: <Wallet className="h-8 w-8" />,
    color: "#22c55e",
    steps: [
      "Connect your bank accounts securely",
      "Auto-categorize transactions with AI",
      "Track spending across multiple accounts",
      "Get real-time expense notifications"
    ],
    highlight: "Save 5+ hours weekly"
  },
  {
    title: "Intelligent Budget Planning",
    description: "Create dynamic budgets that adapt to your lifestyle and financial goals.",
    icon: <PieChart className="h-8 w-8" />,
    color: "#3b82f6",
    steps: [
      "Set personalized budget categories",
      "Get smart spending recommendations",
      "Receive overspending alerts",
      "Track budget performance metrics"
    ],
    highlight: "Reduce overspending by 40%"
  },
  {
    title: "Advanced Analytics",
    description: "Discover spending patterns with machine learning insights and forecasting.",
    icon: <LineChart className="h-8 w-8" />,
    color: "#8b5cf6",
    steps: [
      "View detailed spending analytics",
      "Get predictive financial forecasts",
      "Export custom financial reports",
      "Identify saving opportunities"
    ],
    highlight: "Find 15+ saving opportunities"
  },
  {
    title: "Goal Achievement",
    description: "Set and achieve financial milestones with our proven goal-setting framework.",
    icon: <TrendingUp className="h-8 w-8" />,
    color: "#f59e0b",
    steps: [
      "Create SMART financial goals",
      "Track progress with visual metrics",
      "Get milestone achievement rewards",
      "Join goal-focused communities"
    ],
    highlight: "3x higher success rate"
  },
  {
    title: "Bill Management",
    description: "Never miss a payment with intelligent bill tracking and reminders.",
    icon: <Calendar className="h-8 w-8" />,
    color: "#ef4444",
    steps: [
      "Set up automatic bill reminders",
      "Track subscription services",
      "Monitor price changes",
      "Get cancellation suggestions"
    ],
    highlight: "Prevent $200+ in late fees"
  },
  {
    title: "Bank-Level Security",
    description: "Your data is protected with enterprise-grade security and encryption.",
    icon: <ShieldCheck className="h-8 w-8" />,
    color: "#06b6d4",
    steps: [
      "256-bit encryption protection",
      "Multi-factor authentication",
      "SOC 2 compliance certified",
      "Zero data selling policy"
    ],
    highlight: "Trusted by 50,000+ users"
  }
];

export function FinancialSpotlightCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16">
      {financialFeatures.map((feature, index) => (
        <motion.div
          key={feature.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="w-full group"
          whileHover={{ y: -8 }}
        >
          <CardSpotlight
            className="h-full bg-background/95 border-border/50 backdrop-blur-sm hover:bg-background/98 transition-all duration-500 p-4 sm:p-6 hover:shadow-2xl hover:shadow-primary/10 group-hover:border-primary/30"
            color={feature.color}
            radius={300}
          >
            {/* Enhanced Highlight Badge */}
            <motion.div
              className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 z-10"
              initial={{ opacity: 0, scale: 0, rotate: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3, duration: 0.4, type: "spring" }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-violet-500 rounded-full blur-sm opacity-70"></div>
                <div className="relative bg-gradient-to-r from-primary to-violet-500 text-white text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-lg border border-white/20">
                  {feature.highlight}
                </div>
              </div>
            </motion.div>

            {/* Enhanced Icon with Glow Effect */}
            <motion.div
              className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl mb-4 sm:mb-6 relative overflow-hidden group-hover:shadow-lg"
              style={{ backgroundColor: `${feature.color}15` }}
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  backgroundColor: feature.color,
                  filter: "blur(8px)",
                  transform: "scale(1.2)"
                }}
              />
              
              {/* Background fill animation */}
              <motion.div
                className="absolute inset-0 rounded-xl"
                style={{ backgroundColor: feature.color }}
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Icon */}
              <motion.div
                className="relative z-10 transition-all duration-300 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6"
                style={{ color: feature.color }}
                whileHover={{ 
                  color: "white",
                  scale: 1.1,
                  filter: "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
                }}
              >
                {feature.icon}
              </motion.div>
            </motion.div>

            {/* Content */}
            <div className="relative z-20">
              <motion.h3
                className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
              >
                {feature.title}
              </motion.h3>

              <motion.p
                className="text-muted-foreground mb-4 sm:mb-6 text-sm leading-relaxed"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              >
                {feature.description}
              </motion.p>

              {/* Steps List */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              >
                {feature.steps.map((step, stepIndex) => (
                  <motion.div
                    key={stepIndex}
                    className="flex items-start gap-3 group"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: index * 0.1 + 0.4 + (stepIndex * 0.1), 
                      duration: 0.3 
                    }}
                    whileHover={{ x: 5 }}
                  >
                    <motion.div
                      className="flex-shrink-0 rounded-full p-1 mt-0.5"
                      style={{ backgroundColor: `${feature.color}20` }}
                      whileHover={{
                        backgroundColor: feature.color,
                        scale: 1.1
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check 
                        size={12} 
                        className="transition-colors duration-200"
                        style={{ color: feature.color }}
                      />
                    </motion.div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {step}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Bottom accent line */}
              <motion.div
                className="mt-6 h-1 rounded-full"
                style={{ backgroundColor: `${feature.color}30` }}
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.8, duration: 0.6 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: feature.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "40%" }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 1, duration: 0.8 }}
                />
              </motion.div>
            </div>
          </CardSpotlight>
        </motion.div>
      ))}
    </div>
  );
}

const FinancialCheckIcon = ({ color }: { color: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-3 w-3 flex-shrink-0"
      style={{ color }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  );
};