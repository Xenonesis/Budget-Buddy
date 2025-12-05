/**
 * Modern Design System Configuration
 * Professional, consistent design tokens and utilities
 */

// Spacing scale - consistent across all breakpoints
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '6rem', // 96px
} as const;

// Typography scale
export const typography = {
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Border radius - modern, consistent rounding
export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

// Shadows - subtle, professional elevation
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// Animation durations
export const duration = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Professional icon mapping (using lucide-react icons instead of emojis)
export const iconMap = {
  // Financial
  money: 'DollarSign',
  income: 'TrendingUp',
  expense: 'TrendingDown',
  savings: 'PiggyBank',
  investment: 'LineChart',
  budget: 'Wallet',
  balance: 'Scale',

  // Analytics
  chart: 'BarChart3',
  analytics: 'LineChart',
  insights: 'Sparkles',
  report: 'FileText',
  statistics: 'PieChart',

  // Actions
  add: 'Plus',
  edit: 'Pencil',
  delete: 'Trash2',
  save: 'Save',
  download: 'Download',
  upload: 'Upload',
  search: 'Search',
  filter: 'Filter',
  sort: 'ArrowUpDown',

  // Status
  success: 'CheckCircle2',
  warning: 'AlertTriangle',
  error: 'XCircle',
  info: 'Info',
  clock: 'Clock',
  pending: 'Clock',

  // Navigation
  menu: 'Menu',
  close: 'X',
  back: 'ArrowLeft',
  forward: 'ArrowRight',
  up: 'ChevronUp',
  down: 'ChevronDown',

  // Categories (professional icons instead of emojis)
  food: 'UtensilsCrossed',
  transport: 'Car',
  shopping: 'ShoppingBag',
  entertainment: 'Tv',
  health: 'Heart',
  utilities: 'Zap',
  other: 'MoreHorizontal',
} as const;

// Status colors - semantic and accessible
export const statusColors = {
  success: {
    light: 'hsl(142 76% 36%)',
    dark: 'hsl(142 71% 45%)',
  },
  warning: {
    light: 'hsl(38 92% 50%)',
    dark: 'hsl(38 92% 50%)',
  },
  error: {
    light: 'hsl(0 72% 51%)',
    dark: 'hsl(0 72% 51%)',
  },
  info: {
    light: 'hsl(199 89% 48%)',
    dark: 'hsl(199 89% 48%)',
  },
} as const;

// Utility function for responsive values
export function responsive<T>(
  mobile: T,
  tablet?: T,
  desktop?: T
): {
  mobile: T;
  tablet: T;
  desktop: T;
} {
  return {
    mobile,
    tablet: tablet ?? mobile,
    desktop: desktop ?? tablet ?? mobile,
  };
}

// Generate consistent transition classes
export function transition(
  property: string = 'all',
  durationKey: keyof typeof duration = 'normal'
) {
  return `transition-${property} duration-${durationKey} ease-in-out`;
}
