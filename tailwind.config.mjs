/** @type {import('tailwindcss').Config} */
import tailwindcssAnimate from 'tailwindcss-animate';

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        "2xl": "1400px",
      },
    },
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Color scheme variations
        blue: {
          primary: "hsl(221.2 83.2% 53.3%)",
          "primary-dark": "hsl(217.2 91.2% 59.8%)",
        },
        green: {
          primary: "hsl(142.1 76.2% 36.3%)",
          "primary-dark": "hsl(142.1 70.6% 45.3%)",
        },
        purple: {
          primary: "hsl(265 84% 53%)",
          "primary-dark": "hsl(263.4 70% 71%)",
        },
        orange: {
          primary: "hsl(25.7 95% 53.1%)",
          "primary-dark": "hsl(24.6 95% 53.1%)",
        },
        rose: {
          primary: "hsl(346.8 77.2% 49.8%)",
          "primary-dark": "hsl(346.8 77.2% 49.8%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)",
        '3xl': "calc(var(--radius) + 12px)",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "slide-in-left": {
          from: { 
            transform: "translateX(-100%)",
            opacity: 0 
          },
          to: { 
            transform: "translateX(0)",
            opacity: 1 
          },
        },
        "slide-out-left": {
          from: { 
            transform: "translateX(0)",
            opacity: 1 
          },
          to: { 
            transform: "translateX(-100%)",
            opacity: 0 
          },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "slide-out-left": "slide-out-left 0.3s ease-in forwards",
        "fade-in": "fade-in 0.3s ease-in-out",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    function({ addVariant }) {
      addVariant('sidebar-open', 'html.sidebar-open &');
      addVariant('sidebar-collapsed', '.sidebar-collapsed &');
    }
  ],
};

export default config; 