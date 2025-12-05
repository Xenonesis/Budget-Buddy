# Landing Page Components

This directory contains all components related to the landing page of Budget Buddy.

## Structure

```
landing/
├── config/                  # Configuration and data files
│   ├── landing-config.ts   # Main landing page configuration
│   └── testimonials-data.ts # Testimonials data
├── shared/                  # Shared/reusable components
│   ├── SectionWrapper.tsx  # Wrapper for sections with animations
│   └── SectionSkeleton.tsx # Loading skeleton for sections
├── utils/                   # Utility functions
│   └── scroll-utils.ts     # Scroll and navigation utilities
├── about.tsx               # About section component
├── cta.tsx                 # Call-to-action section
├── features.tsx            # Features showcase section
├── financial-spotlight-cards.tsx # Financial feature cards
├── financial-testimonials.tsx    # Testimonials display
├── footer.tsx              # Page footer
├── header.tsx              # Page header/navigation
├── pricing.tsx             # Pricing plans section
├── sections.tsx            # Main sections orchestrator
└── testimonials.tsx        # Testimonials wrapper

```

## Key Refactoring Improvements

### 1. **Centralized Configuration**

All static data (navigation items, pricing plans, testimonials, etc.) has been moved to `config/`
directory:

- Easy to update content without touching component logic
- Type-safe configuration with TypeScript
- Single source of truth for all landing page content

### 2. **Reusable Components**

Common patterns extracted into `shared/` directory:

- `SectionWrapper`: Handles section layout and animations
- `SectionSkeleton`: Consistent loading states

### 3. **Utility Functions**

Navigation and scroll logic moved to `utils/`:

- `scrollToSection()`: Smooth scrolling with offset
- `scrollToTop()`: Scroll to top functionality
- Easy to test and reuse across components

### 4. **Performance Optimizations**

- Dynamic imports for below-the-fold sections
- Memoized components to prevent unnecessary re-renders
- Lazy-loaded animations
- Optimized bundle size by removing duplicate code

### 5. **Better Maintainability**

- Clear separation of concerns
- Reduced code duplication
- Type-safe props and data structures
- Self-documenting code structure

## Usage Examples

### Adding a New Navigation Item

```typescript
// In config/landing-config.ts
export const NAV_ITEMS = [
  { name: 'Features', href: '#features' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'New Section', href: '#new-section' }, // Add here
] as const;
```

### Adding a New Pricing Plan

```typescript
// In config/landing-config.ts
export const PRICING_PLANS = [
  // ... existing plans
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'per month',
    description: 'For large organizations',
    features: [...],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'from-orange-500 to-red-600',
  },
] as const;
```

### Using the Section Wrapper

```tsx
import { SectionWrapper } from './shared/SectionWrapper';

function MySection() {
  return (
    <SectionWrapper AnimationComponent={MyAnimationComponent}>
      <div>Your section content</div>
    </SectionWrapper>
  );
}
```

## Component Dependencies

- All components use centralized configuration from `config/`
- Shared components import from `shared/`
- Utilities import from `utils/`
- No circular dependencies

## Testing

To test configuration changes:

1. Update values in `config/landing-config.ts`
2. Save and verify hot-reload in development
3. Check all sections render correctly

## Future Improvements

- [ ] Add A/B testing support in configuration
- [ ] Implement internationalization (i18n) in config
- [ ] Add analytics tracking configuration
- [ ] Create component variants system
- [ ] Add CMS integration for dynamic content
