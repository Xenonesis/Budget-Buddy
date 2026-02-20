export const dynamic = 'force-dynamic';
export const revalidate = 0;

import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Syne, Manrope, JetBrains_Mono } from 'next/font/google';
import ThemeProviderShell from '@/components/ThemeProviderShell';

// Display font - high impact, editorial
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  preload: true,
});

// Body font - clean, readable
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

// Monospace - for financial data
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: true,
});

// Define viewport config separately
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  colorScheme: 'light dark',
};

// Improve metadata for better SEO and performance
export const metadata: Metadata = {
  title: 'Budget Buddy - Smart Money Management',
  description:
    'Take control of your finances with Budget Buddy, an intuitive financial management tool. Track expenses, set budgets, and achieve your financial goals.',
  applicationName: 'Budget Buddy',
  authors: [{ name: 'Budget Buddy Team' }],
  keywords: [
    'budget tracking',
    'personal finance',
    'expense management',
    'money management',
    'savings goals',
    'financial dashboard',
    'budget buddy',
  ],
  robots: 'index, follow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Budget Buddy',
  },
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://budget-buddy.com',
    title: 'Budget Buddy - Smart Money Management',
    description:
      'Take control of your finances with Budget Buddy, an intuitive financial management tool.',
    siteName: 'Budget Buddy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget Buddy - Smart Money Management',
    description:
      'Take control of your finances with Budget Buddy, an intuitive financial management tool.',
    creator: '@budgetbuddy',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  other: {
    'X-UA-Compatible': 'IE=edge',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${syne.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        {/* Preconnect to Supabase for faster API calls */}
        <link rel="preconnect" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        {/* Critical resource hints */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProviderShell>{children}</ThemeProviderShell>
      </body>
    </html>
  );
}
