# Landing Page - Quick Reference Card

## 🎯 Need to Update Something? Here's Where to Look

### 📝 Content Updates

| What to Change        | File to Edit                  | Line/Section             |
| --------------------- | ----------------------------- | ------------------------ |
| Navigation menu items | `config/landing-config.ts`    | `NAV_ITEMS`              |
| Hero section text     | `config/landing-config.ts`    | `HERO_CONFIG`            |
| Pricing plans         | `config/landing-config.ts`    | `PRICING_PLANS`          |
| Social media links    | `config/landing-config.ts`    | `SOCIAL_LINKS`           |
| Footer navigation     | `config/landing-config.ts`    | `FOOTER_SECTIONS`        |
| CTA statistics        | `config/landing-config.ts`    | `CTA_STATS`              |
| Analytics features    | `config/landing-config.ts`    | `ANALYTICS_FEATURES`     |
| Trust indicators      | `config/landing-config.ts`    | `TRUST_INDICATORS`       |
| Testimonials          | `config/testimonials-data.ts` | `FINANCIAL_TESTIMONIALS` |

### 🔧 Code Updates

| What to Change        | File to Edit                 |
| --------------------- | ---------------------------- |
| Header UI/styling     | `header.tsx`                 |
| Footer UI/styling     | `footer.tsx`                 |
| Pricing card design   | `pricing.tsx`                |
| CTA section design    | `cta.tsx`                    |
| Features layout       | `features.tsx`               |
| Section wrapper logic | `shared/SectionWrapper.tsx`  |
| Loading skeleton      | `shared/SectionSkeleton.tsx` |
| Scroll behavior       | `utils/scroll-utils.ts`      |

## 📂 Directory Structure

```
components/landing/
├── config/              # 📋 Edit content here
│   ├── landing-config.ts
│   └── testimonials-data.ts
├── shared/              # 🔄 Reusable components
│   ├── SectionWrapper.tsx
│   └── SectionSkeleton.tsx
├── utils/               # 🛠️ Helper functions
│   └── scroll-utils.ts
├── about.tsx
├── cta.tsx
├── features.tsx
├── financial-spotlight-cards.tsx
├── financial-testimonials.tsx
├── footer.tsx
├── header.tsx
├── index.ts             # 📦 Central exports
├── pricing.tsx
├── README.md            # 📖 Full documentation
├── sections.tsx
└── testimonials.tsx
```

## ⚡ Quick Tasks

### Add a Navigation Item

```typescript
// config/landing-config.ts
export const NAV_ITEMS = [
  { name: 'Features', href: '#features' },
  { name: 'New Page', href: '#new' }, // Add here
] as const;
```

### Add a Pricing Plan

```typescript
// config/landing-config.ts
export const PRICING_PLANS = [
  // ... existing plans
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'per month',
    description: 'For large teams',
    features: ['Feature 1', 'Feature 2'],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'from-orange-500 to-red-600',
  },
] as const;
```

### Add a Testimonial

```typescript
// config/testimonials-data.ts
export const FINANCIAL_TESTIMONIALS = [
  // ... existing testimonials
  {
    id: 9,
    quote: 'Amazing app!',
    name: 'Jane Doe',
    username: '@janedoe',
    avatar: generateUserAvatar('Jane Doe', 9),
  },
];
```

### Add a Social Link

```typescript
// config/landing-config.ts
export const SOCIAL_LINKS = [
  // ... existing links
  {
    href: 'https://twitter.com/yourhandle',
    label: 'Twitter',
    icon: 'M23 3a10.9...', // SVG path data
  },
] as const;
```

## 🔍 Common Questions

**Q: Where is the pricing data?**  
A: `components/landing/config/landing-config.ts` → `PRICING_PLANS`

**Q: How do I update testimonials?**  
A: `components/landing/config/testimonials-data.ts` → `FINANCIAL_TESTIMONIALS`

**Q: Where's the scroll logic?**  
A: `components/landing/utils/scroll-utils.ts`

**Q: How do I add a reusable component?**  
A: Put it in `components/landing/shared/`

**Q: Where's the documentation?**  
A: `components/landing/README.md`

## 🚀 Import Examples

### Import from Landing Components

```typescript
// Clean imports using barrel export
import { Header, Footer, NAV_ITEMS, scrollToSection } from '@/components/landing';
```

### Import Config Directly

```typescript
import { PRICING_PLANS } from '@/components/landing/config/landing-config';
```

### Import Utils Directly

```typescript
import { scrollToTop } from '@/components/landing/utils/scroll-utils';
```

## 🎨 Style Changes

### Component-Specific Styles

Edit the component file directly (e.g., `header.tsx`, `footer.tsx`)

### Global Landing Styles

Check `app/globals.css` or Tailwind config

### Animation Changes

Look for `motion.*` components in individual files

## 🧪 Testing Changes

```bash
# Type check
npm run type-check

# Build check
npm run build

# Development server
npm run dev
```

## 📊 File Sizes (for reference)

| File                   | Lines | Purpose            |
| ---------------------- | ----- | ------------------ |
| `landing-config.ts`    | 174   | Main configuration |
| `testimonials-data.ts` | 77    | Testimonials       |
| `scroll-utils.ts`      | 34    | Scroll helpers     |
| `SectionWrapper.tsx`   | 32    | Section wrapper    |
| `SectionSkeleton.tsx`  | 19    | Loading skeleton   |

## 🎯 Best Practices

✅ **DO:**

- Edit config files for content changes
- Use TypeScript types from config
- Import from `@/components/landing`
- Test after changes

❌ **DON'T:**

- Mix data with UI components
- Duplicate configuration
- Hardcode content in components
- Skip type checking

## 🔗 Related Documentation

- **Full Documentation**: `components/landing/README.md`
- **Refactoring Summary**: `LANDING_PAGE_REFACTORING_SUMMARY.md`
- **Benefits Guide**: `REFACTORING_BENEFITS.md`
- **Visual Guide**: `REFACTORING_VISUAL_GUIDE.md`

## 💡 Pro Tips

1. **Content changes?** → Config files only
2. **UI changes?** → Component files
3. **New feature?** → Check `shared/` first
4. **Need help?** → Read the README
5. **Type errors?** → Config types are auto-generated

---

**Keep this card handy for quick reference! 📌**
