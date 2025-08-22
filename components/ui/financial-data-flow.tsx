"use client";

import React from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, PieChart, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialDataFlowProps {
  className?: string;
  circleText?: string;
  badgeTexts?: {
    first: string;
    second: string;
    third: string;
    fourth: string;
  };
  buttonTexts?: {
    first: string;
    second: string;
  };
  title?: string;
  lightColor?: string;
}

const FinancialDataFlow = ({
  className,
  circleText,
  badgeTexts,
  buttonTexts,
  title,
  lightColor,
}: FinancialDataFlowProps) => {
  return (
    <div
      className={cn(
        "relative flex h-[350px] w-full max-w-[500px] flex-col items-center",
        className
      )}
    >
      {/* SVG Paths  */}
      <svg
        className="h-full sm:w-full text-muted"
        width="100%"
        height="100%"
        viewBox="0 0 200 100"
      >
        <g
          stroke="currentColor"
          fill="none"
          strokeWidth="0.4"
          strokeDasharray="100 100"
          pathLength="100"
        >
          <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
          <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
          <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
          <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />
          {/* Animation For Path Starting */}
          <animate
            attributeName="stroke-dashoffset"
            from="100"
            to="0"
            dur="1s"
            fill="freeze"
            calcMode="spline"
            keySplines="0.25,0.1,0.5,1"
            keyTimes="0; 1"
          />
        </g>
        {/* Financial Data Lights */}
        <g mask="url(#financial-mask-1)">
          <circle
            className="financial-data financial-light-1"
            cx="0"
            cy="0"
            r="12"
            fill="url(#financial-green-grad)"
          />
        </g>
        <g mask="url(#financial-mask-2)">
          <circle
            className="financial-data financial-light-2"
            cx="0"
            cy="0"
            r="12"
            fill="url(#financial-green-grad)"
          />
        </g>
        <g mask="url(#financial-mask-3)">
          <circle
            className="financial-data financial-light-3"
            cx="0"
            cy="0"
            r="12"
            fill="url(#financial-green-grad)"
          />
        </g>
        <g mask="url(#financial-mask-4)">
          <circle
            className="financial-data financial-light-4"
            cx="0"
            cy="0"
            r="12"
            fill="url(#financial-green-grad)"
          />
        </g>
        {/* Financial Feature Buttons */}
        <g stroke="currentColor" fill="none" strokeWidth="0.4">
          {/* Income Tracking */}
          <g>
            <rect
              fill="#16a34a"
              x="14"
              y="5"
              width="34"
              height="10"
              rx="5"
            ></rect>
            <IncomeIcon x="18" y="7.5"></IncomeIcon>
            <text
              x="26"
              y="12"
              fill="white"
              stroke="none"
              fontSize="4.5"
              fontWeight="500"
            >
              {badgeTexts?.first || "INCOME"}
            </text>
          </g>
          {/* Budget Planning */}
          <g>
            <rect
              fill="#2563eb"
              x="60"
              y="5"
              width="34"
              height="10"
              rx="5"
            ></rect>
            <BudgetIcon x="64" y="7.5"></BudgetIcon>
            <text
              x="72"
              y="12"
              fill="white"
              stroke="none"
              fontSize="4.5"
              fontWeight="500"
            >
              {badgeTexts?.second || "BUDGET"}
            </text>
          </g>
          {/* Analytics */}
          <g>
            <rect
              fill="#7c3aed"
              x="108"
              y="5"
              width="34"
              height="10"
              rx="5"
            ></rect>
            <AnalyticsIcon x="112" y="7.5"></AnalyticsIcon>
            <text
              x="120"
              y="12"
              fill="white"
              stroke="none"
              fontSize="4"
              fontWeight="500"
            >
              {badgeTexts?.third || "ANALYTICS"}
            </text>
          </g>
          {/* Insights */}
          <g>
            <rect
              fill="#dc2626"
              x="150"
              y="5"
              width="40"
              height="10"
              rx="5"
            ></rect>
            <InsightsIcon x="154" y="7.5"></InsightsIcon>
            <text
              x="163"
              y="12"
              fill="white"
              stroke="none"
              fontSize="4"
              fontWeight="500"
            >
              {badgeTexts?.fourth || "INSIGHTS"}
            </text>
          </g>
        </g>
        <defs>
          {/* 1 - Income tracking */}
          <mask id="financial-mask-1">
            <path
              d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* 2 - Budget planning */}
          <mask id="financial-mask-2">
            <path
              d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* 3 - Analytics */}
          <mask id="financial-mask-3">
            <path
              d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* 4 - AI Insights */}
          <mask id="financial-mask-4">
            <path
              d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10"
              strokeWidth="0.5"
              stroke="white"
            />
          </mask>
          {/* Green Gradient for financial success */}
          <radialGradient id="financial-green-grad" fx="1">
            <stop offset="0%" stopColor={lightColor || "#22c55e"} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>
      {/* Main Financial Dashboard Box */}
      <div className="absolute bottom-10 flex w-full flex-col items-center">
        {/* bottom shadow */}
        <div className="absolute -bottom-4 h-[100px] w-[62%] rounded-lg bg-accent/30" />
        {/* box title */}
        <div className="absolute -top-3 z-20 flex items-center justify-center rounded-lg border bg-[#101112] px-2 py-1 sm:-top-4 sm:py-1.5">
          <TrendingUp className="size-3" />
          <span className="ml-2 text-[10px]">
            {title ? title : "Smart Financial Management & AI-Powered Insights"}
          </span>
        </div>
        {/* box outer circle */}
        <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border-t bg-[#141516] font-semibold text-xs">
          {circleText ? circleText : "AI"}
        </div>
        {/* box content */}
        <div className="relative z-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background shadow-md">
          {/* Financial Badges */}
          <div className="absolute bottom-8 left-12 z-10 h-7 rounded-full bg-[#101112] px-3 text-xs border flex items-center gap-2 ">
            <DollarSign className="size-4 text-green-500" />
            <span>{buttonTexts?.first || "Budget Buddy"}</span>
          </div>
          <div className="absolute right-16 z-10 hidden h-7 rounded-full bg-[#101112] px-3 text-xs sm:flex border items-center gap-2">
            <BarChart3 className="size-4 text-blue-500" />
            <span>{buttonTexts?.second || "Smart Analytics"}</span>
          </div>
          {/* Animated Financial Circles */}
          <motion.div
            className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border-t bg-green-500/10"
            animate={{
              scale: [0.98, 1.02, 0.98, 1, 1, 1, 1, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border-t bg-blue-500/10"
            animate={{
              scale: [1, 1, 1, 0.98, 1.02, 0.98, 1, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border-t bg-purple-500/10"
            animate={{
              scale: [1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-[120px] h-[235px] w-[235px] rounded-full border-t bg-red-500/10"
            animate={{
              scale: [1, 1, 1, 1, 1, 1, 0.98, 1.02, 0.98, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialDataFlow;

// Financial Icons
const IncomeIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
  return (
    <svg
      x={x}
      y={y}
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
};

const BudgetIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
  return (
    <svg
      x={x}
      y={y}
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
};

const AnalyticsIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
  return (
    <svg
      x={x}
      y={y}
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  );
};

const InsightsIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
  return (
    <svg
      x={x}
      y={y}
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11H1v3h8v3l3-4-3-4v2z" />
      <path d="M22 12h-7v3h7v-3z" />
      <path d="M15 9h7v3h-7V9z" />
    </svg>
  );
};