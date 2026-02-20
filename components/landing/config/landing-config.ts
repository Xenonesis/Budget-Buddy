/**
 * Centralized configuration for landing page content
 * This makes it easy to update content without touching component code
 */

import type { LucideIcon } from 'lucide-react';

// Hero Section Configuration
export const HERO_CONFIG = {
  title: 'Welcome to Budget Buddy',
  subtitle: {
    regular: 'Take control of your finances with ',
    gradient: 'our intuitive budgeting tool',
  },
  description:
    'Track your expenses, set budgets, and achieve your financial goals with our easy-to-use platform designed for everyone.',
  ctaText: 'Get Started',
  ctaHref: '/auth/register',
  bottomImage: {
    light: '/hero-banner.png',
    dark: '/hero-banner.png',
  },
} as const;

// Navigation Items
export const NAV_ITEMS = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'About', href: '#about' },
] as const;

// Social Links
export const SOCIAL_LINKS = [
  {
    href: 'mailto:itisaddy7@gmail.com',
    label: 'Email',
    icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22,6 12,13 2,6',
  },
  {
    href: 'https://www.linkedin.com/in/itisaddy/',
    label: 'LinkedIn',
    icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
  },
  {
    href: 'https://www.instagram.com/i__aditya7/',
    label: 'Instagram',
    icon: 'M2 2h20v20H2z M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01',
  },
  {
    href: 'https://github.com/itisaddy',
    label: 'GitHub',
    icon: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
  },
] as const;

// Footer Navigation
export const FOOTER_SECTIONS = [
  {
    title: 'Product',
    links: ['Features', 'Integrations', 'Pricing', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Blog', 'Press'],
  },
  {
    title: 'Resources',
    links: ['Help Center', 'Contact Us', 'Community', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Compliance'],
  },
] as const;

// Pricing Plans
export const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'Perfect for individuals starting their financial journey',
    features: [
      'Track up to 3 accounts',
      'Basic expense categorization',
      'Monthly budget creation',
      'Simple reports and charts',
      'Mobile app access',
      'Email support',
    ],
    limitations: ['Limited to 100 transactions/month', 'Basic categories only'],
    cta: 'Get Started Free',
    popular: false,
    color: 'from-gray-400 to-gray-600',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'Advanced features for serious budgeters and savers',
    features: [
      'Unlimited accounts and transactions',
      'AI-powered categorization',
      'Advanced budget templates',
      'Goal tracking and milestones',
      'Bill reminders and alerts',
      'Custom reports and exports',
      'Investment tracking',
      'Priority email support',
      'Mobile and web access',
    ],
    limitations: [],
    cta: 'Start 14-Day Free Trial',
    popular: true,
    color: 'from-blue-500 to-purple-600',
    savings: 'Save $24 annually vs monthly billing',
  },
  {
    name: 'Family',
    price: '$19.99',
    period: 'per month',
    description: 'Comprehensive financial management for families',
    features: [
      'Everything in Pro',
      'Up to 6 family member accounts',
      'Shared budgets and goals',
      "Kids' allowance tracking",
      'Family spending insights',
      'Multiple currency support',
      'Advanced security controls',
      'Dedicated account manager',
      'Phone and chat support',
      'Financial planning consultation',
    ],
    limitations: [],
    cta: 'Start Family Trial',
    popular: false,
    color: 'from-emerald-500 to-teal-600',
    savings: 'Save $48 annually vs monthly billing',
  },
] as const;

// CTA Stats
export const CTA_STATS = [
  { value: '94%', label: 'User satisfaction' },
  { value: '30%', label: 'Average savings' },
  { value: '15min', label: 'Setup time' },
  { value: '100%', label: 'Data security' },
] as const;

// Analytics Features
export const ANALYTICS_FEATURES = [
  {
    title: 'Personalized Insights',
    description: 'Tailored recommendations based on your spending habits',
  },
  {
    title: 'Smart Categories',
    description: 'Customizable and automatically organized expense groups',
  },
  {
    title: 'Goal Tracking',
    description: 'Visual progress meters toward your financial objectives',
  },
  {
    title: 'Monthly Reports',
    description: 'Detailed breakdowns and year-over-year comparisons',
  },
] as const;

// Trust Indicators
export const TRUST_INDICATORS = [
  { icon: 'pulse', label: '99.9% Uptime' },
  { icon: 'heart', label: '50k+ Users' },
] as const;
