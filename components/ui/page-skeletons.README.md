# Page Skeleton Components

A collection of reusable skeleton loading states for all dashboard pages.

## Overview

These components provide structured loading placeholders that match the layout of each page,
improving perceived performance and user experience.

## Components

### BudgetPageSkeleton

```tsx
import { BudgetPageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <BudgetPageSkeleton />;
```

**Layout:**

- Header with logo and title
- 3 summary cards
- Filters section
- 5 budget item cards with progress bars

---

### AnalyticsPageSkeleton

```tsx
import { AnalyticsPageSkeleton } from '@/components/ui/page-skeletons';

if (isDataLoading) return <AnalyticsPageSkeleton />;
```

**Layout:**

- Page header
- 4 stats cards
- 2 large chart placeholders
- Additional analytics section

---

### ProfilePageSkeleton

```tsx
import { ProfilePageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <ProfilePageSkeleton />;
```

**Layout:**

- Page header
- Profile picture placeholder
- 6 form fields
- Action buttons

---

### SettingsPageSkeleton

```tsx
import { SettingsPageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <SettingsPageSkeleton />;
```

**Layout:**

- Page header
- Tab navigation (4 tabs)
- Main content area with form fields
- Sidebar with toggle settings

---

### NotificationsPageSkeleton

```tsx
import { NotificationsPageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <NotificationsPageSkeleton />;
```

**Layout:**

- Page header
- Filter controls
- 6 notification items with icons
- Settings sidebar

---

### FinancialInsightsPageSkeleton

```tsx
import { FinancialInsightsPageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <FinancialInsightsPageSkeleton />;
```

**Layout:**

- Page header with tabs
- 3 overview cards
- Multiple chart sections
- Insights sidebar

---

### AIInsightsPageSkeleton

```tsx
import { AIInsightsPageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <AIInsightsPageSkeleton />;
```

**Layout:**

- Conversation sidebar
- Chat header
- Empty state placeholder
- Input area

---

### TransactionsPageSkeleton

```tsx
import { TransactionsPageSkeleton } from '@/components/ui/page-skeletons';

if (loading) return <TransactionsPageSkeleton />;
```

**Layout:**

- Page header with action button
- 4 summary cards
- Filter controls
- 10 transaction rows

---

## Usage Pattern

All skeleton components follow the same usage pattern:

```tsx
import { PageNameSkeleton } from "@/components/ui/page-skeletons";

export default function Page() {
  const [loading, setLoading] = useState(true);

  // Fetch data...
  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <PageNameSkeleton />;
  }

  return (
    // Your page content
  );
}
```

## Design Principles

1. **Layout Accuracy**: Skeletons match the actual page layout
2. **Minimal Animation**: Only CSS shimmer effects for performance
3. **Responsive**: Adapts to different screen sizes
4. **Consistent**: Uses shared Skeleton and Card components
5. **Fast**: Renders instantly with no data dependencies

## Dependencies

- `@/components/ui/skeleton` - Base skeleton component
- `@/components/ui/card` - Card containers
- `@/lib/utils` - Utility functions (cn)

## Customization

To customize a skeleton:

```tsx
// Override specific skeleton dimensions
<Skeleton className="h-12 w-64 mb-4" />

// Add responsive classes
<Skeleton className="h-10 w-full md:w-48" />

// Combine with other variants
<Card>
  <CardContent className="p-8">
    <Skeleton className="h-6 w-full" />
  </CardContent>
</Card>
```

## Performance

- **Zero JavaScript Runtime**: Pure CSS animations
- **Small Bundle Impact**: Single file, shared components
- **Fast Render**: No data fetching required
- **Optimized DOM**: Minimal elements per skeleton

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Screen reader compatible
- Maintains focus order

## Best Practices

### ✅ Do:

- Use skeletons for initial page loads
- Match skeleton to actual content layout
- Keep animations subtle
- Test on different screen sizes

### ❌ Don't:

- Use skeletons for very fast loads (< 100ms)
- Animate too aggressively
- Create layout shift when content loads
- Over-complicate skeleton structure

## Examples

### Simple Page

```tsx
if (loading) {
  return <ProfilePageSkeleton />;
}
```

### With Error Handling

```tsx
if (loading) return <ProfilePageSkeleton />;
if (error) return <ErrorMessage error={error} />;
return <ProfileContent data={data} />;
```

### Conditional Skeleton

```tsx
if (isInitialLoad && loading) {
  return <AnalyticsPageSkeleton />;
}

return (
  <div>
    {loading && <LoadingIndicator />}
    <Content data={data} />
  </div>
);
```

## Testing

To test skeleton states:

1. **Slow Network**: Use browser DevTools to throttle network
2. **Visual Regression**: Compare skeleton to actual content
3. **Screen Readers**: Verify loading announcements
4. **Responsive**: Test on mobile and desktop

## Browser Support

Works in all modern browsers with CSS Grid and Flexbox support:

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS 14+, Android 5+)
