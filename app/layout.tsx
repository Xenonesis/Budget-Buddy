import './globals.css'
import './fast-skeleton.css'
import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter } from 'next/font/google'

// Optimize font loading with display swap
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

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
    { media: '(prefers-color-scheme: dark)', color: '#121212' }
  ],
  colorScheme: 'light dark'
}

// Improve metadata for better SEO and performance
export const metadata: Metadata = {
  title: 'Budget Buddy - Smart Money Management',
  description: 'Take control of your finances with Budget Buddy, an intuitive financial management tool. Track expenses, set budgets, and achieve your financial goals.',
  applicationName: 'Budget Buddy',
  authors: [{ name: 'Budget Buddy Team' }],
  keywords: ['budget tracking', 'personal finance', 'expense management', 'money management', 'savings goals', 'financial dashboard', 'budget buddy'],
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
    description: 'Take control of your finances with Budget Buddy, an intuitive financial management tool.',
    siteName: 'Budget Buddy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Budget Buddy - Smart Money Management',
    description: 'Take control of your finances with Budget Buddy, an intuitive financial management tool.',
    creator: '@budgetbuddy',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ]
  },
  other: {
    'X-UA-Compatible': 'IE=edge',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="budget-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}