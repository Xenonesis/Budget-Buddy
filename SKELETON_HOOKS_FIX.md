# React Hooks Fix - Analytics Page

## Issue

React detected a change in the order of Hooks, causing an error:

```
React has detected a change in the order of Hooks called by AnalyticsPage.
```

## Root Cause

The conditional return (skeleton) was placed **before** a `useEffect` hook:

```tsx
// ❌ WRONG - Violates Rules of Hooks
useEffect(() => { ... }, []);

if (isDataLoading && transactions.length === 0) {
  return <AnalyticsPageSkeleton />; // Early return before all hooks
}

useEffect(() => { ... }, [userPreferences.currency]); // This hook is skipped on first render
```

This caused hooks to be called in different orders depending on the loading state.

## Solution

Moved the conditional return **after** all hooks:

```tsx
// ✅ CORRECT - All hooks called in same order every render
useEffect(() => { ... }, []);

useEffect(() => { ... }, [userPreferences.currency]);

// Now check after all hooks
if (isDataLoading && transactions.length === 0) {
  return <AnalyticsPageSkeleton />;
}
```

## Rules of Hooks Reminder

### ✅ Do:

1. Call hooks at the **top level** of your component
2. Call hooks in the **same order** on every render
3. Place conditional returns **after** all hooks

### ❌ Don't:

1. Call hooks inside conditions
2. Call hooks inside loops
3. Return early before all hooks are defined

## Example Pattern

```tsx
export default function Page() {
  // 1. ALL useState hooks first
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  // 2. ALL useEffect hooks next
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Another effect
  }, [dependency]);

  // 3. ALL useMemo/useCallback hooks
  const memoizedValue = useMemo(() => {}, []);

  // 4. NOW you can do conditional returns
  if (loading) return <Skeleton />;
  if (error) return <Error />;

  return <Content />;
}
```

## Fix Applied

**File:** `app/dashboard/analytics/page.tsx`  
**Lines:** Multiple adjustments

**Issue 1:** Conditional return before `useEffect`

- Fixed: Moved skeleton check after all `useEffect` hooks

**Issue 2:** Conditional return before `useMemo`

- Fixed: Moved skeleton check after `useMemo` hook (line ~440)

**Final placement:** After all hooks (useState, useEffect, useMemo), before the return statement.

## Status

✅ Fixed  
✅ TypeScript compilation successful  
✅ No React Hooks warnings  
✅ Ready for production

## Related Documentation

- [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [React Hooks FAQ](https://react.dev/learn/hooks-faq)
