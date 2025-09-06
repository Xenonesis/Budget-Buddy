# Hero Section Component

This document explains how to use the HeroSection component in your application.

## Component Location

The component is located at `components/ui/hero-section-dark.tsx` and is exported through `components/ui/index.ts`.

## Usage

```tsx
import { HeroSection } from "@/components/ui/hero-section-dark"

function MyPage() {
  return (
    <HeroSection
      title="Welcome to Budget Buddy"
      subtitle={{
        regular: "Take control of your finances with ",
        gradient: "our intuitive budgeting tool",
      }}
      description="Track your expenses, set budgets, and achieve your financial goals with our easy-to-use platform designed for everyone."
      ctaText="Get Started"
      ctaHref="/signup"
      bottomImage={{
        light: "https://plus.unsplash.com/premium_photo-1661886912924-378b502e068a?w=800&auto=format&fit=crop",
        dark: "https://plus.unsplash.com/premium_photo-1661886912924-378b502e068a?w=800&auto=format&fit=crop",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.4,
        cellSize: 50,
        lightLineColor: "#4a4a4a",
        darkLineColor: "#2a2a2a",
      }}
    />
  )
}
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| title | string | The badge text above the main heading | "Build products for everyone" |
| subtitle | { regular: string, gradient: string } | The main heading with a gradient part | { regular: "Designing your projects faster with ", gradient: "the largest figma UI kit." } |
| description | string | The descriptive text below the heading | "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium..." |
| ctaText | string | The text for the call-to-action button | "Browse courses" |
| ctaHref | string | The URL for the call-to-action button | "#" |
| bottomImage | { light: string, dark: string } | The dashboard preview images for light and dark modes | URLs to farmui images |
| gridOptions | { angle?, cellSize?, opacity?, lightLineColor?, darkLineColor? } | Options for the retro grid background effect | See default values in component |

## Example Implementation

See the demo implementation in `components/ui/hero-section-demo.tsx` and `app/hero-demo/page.tsx`.

## Dependencies

- `lucide-react` (already installed in this project)
- `@/lib/utils` (for the `cn` function)

## Customization

You can customize the appearance by passing different props. The component uses Tailwind CSS classes for styling, so you can also override styles using the `className` prop.

## Troubleshooting

If you encounter the "Cannot read properties of undefined" error:

1. Make sure you're using the latest version of the component
2. Check that all required dependencies are installed
3. Verify that the `cn` utility function is available in `@/lib/utils`
4. Ensure that Tailwind CSS is properly configured in your project