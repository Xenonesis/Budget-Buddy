# 🔌 API Reference

Budget Buddy provides a comprehensive API for managing your financial data. This reference covers all available endpoints, data models, and integration patterns.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Data Models](#data-models)
- [Endpoints](#endpoints)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 Authentication

Budget Buddy uses Supabase Auth for secure authentication. All API requests require a valid JWT token.

### Getting Started

```typescript
import { supabase } from '@/lib/supabase'

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current session
const { data: { session } } = await supabase.auth.getSession()
```

### Authentication Methods

| Method | Description |
|--------|-------------|
| `signInWithPassword` | Email/password authentication |
| `signInWithOAuth` | Social provider authentication |
| `signUp` | Create new account |
| `signOut` | Sign out current user |
| `resetPasswordForEmail` | Password reset |

## 📊 Data Models

### Transaction

```typescript
interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'income' | 'expense'
  category_id: string
  description?: string
  date: string
  created_at: string
  updated_at: string
}
```

### Category

```typescript
interface Category {
  id: string
  name: string
  icon?: string
  type: 'income' | 'expense' | 'both'
  is_active: boolean
  user_id?: string
  created_at: string
  updated_at: string
}
```

### Budget

```typescript
interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  period: 'weekly' | 'monthly' | 'yearly'
  created_at: string
  updated_at: string
}
```

### Profile

```typescript
interface Profile {
  id: string
  email?: string
  name?: string
  currency?: string
  timezone?: string
  ai_api_key?: string
  ai_model?: string
  notification_preferences?: object
  created_at: string
  updated_at: string
}
```

## 🛠️ Endpoints

### Transactions

#### Get All Transactions

```typescript
const { data, error } = await supabase
  .from('transactions')
  .select(`
    *,
    categories (
      id,
      name,
      icon,
      type
    )
  `)
  .order('date', { ascending: false })
```

#### Create Transaction

```typescript
const { data, error } = await supabase
  .from('transactions')
  .insert({
    amount: 50.00,
    type: 'expense',
    category_id: 'category-uuid',
    description: 'Coffee',
    date: '2024-01-15'
  })
```

#### Update Transaction

```typescript
const { data, error } = await supabase
  .from('transactions')
  .update({
    amount: 55.00,
    description: 'Coffee and pastry'
  })
  .eq('id', 'transaction-uuid')
```

#### Delete Transaction

```typescript
const { data, error } = await supabase
  .from('transactions')
  .delete()
  .eq('id', 'transaction-uuid')
```

### Categories

#### Get Categories

```typescript
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('name')
```

#### Create Category

```typescript
const { data, error } = await supabase
  .from('categories')
  .insert({
    name: 'Groceries',
    icon: '🛒',
    type: 'expense'
  })
```

### Budgets

#### Get Budgets with Spending

```typescript
const { data, error } = await supabase
  .from('budgets')
  .select(`
    *,
    categories (
      id,
      name,
      icon
    )
  `)
```

#### Create Budget

```typescript
const { data, error } = await supabase
  .from('budgets')
  .insert({
    category_id: 'category-uuid',
    amount: 500.00,
    period: 'monthly'
  })
```

### Analytics

#### Monthly Spending Summary

```typescript
const { data, error } = await supabase
  .from('monthly_spending')
  .select('*')
  .eq('user_id', userId)
  .gte('month', '2024-01-01')
```

#### Budget vs Actual

```typescript
const { data, error } = await supabase
  .from('budget_vs_actual')
  .select('*')
  .eq('user_id', userId)
```

## 🔄 Real-time Subscriptions

Budget Buddy supports real-time updates using Supabase subscriptions.

### Subscribe to Transaction Changes

```typescript
const subscription = supabase
  .channel('transactions')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'transactions',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Transaction changed:', payload)
      // Update your UI
    }
  )
  .subscribe()

// Cleanup
subscription.unsubscribe()
```

### Subscribe to Budget Changes

```typescript
const budgetSubscription = supabase
  .channel('budgets')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'budgets',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      console.log('Budget changed:', payload)
    }
  )
  .subscribe()
```

## 🚨 Error Handling

### Common Error Patterns

```typescript
async function handleApiCall() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('API Error:', error)
    
    // Handle specific error types
    if (error.code === 'PGRST116') {
      // No rows returned
      return []
    }
    
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('Duplicate entry')
    }
    
    throw error
  }
}
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `PGRST116` | No rows returned | Handle empty results |
| `23505` | Unique constraint violation | Check for duplicates |
| `42501` | Insufficient privileges | Check RLS policies |
| `23503` | Foreign key violation | Verify referenced records exist |

## ⚡ Rate Limiting

Supabase implements rate limiting to ensure fair usage:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Real-time connections**: 100 concurrent connections

### Best Practices

1. **Batch Operations**: Group multiple operations when possible
2. **Caching**: Cache frequently accessed data
3. **Pagination**: Use pagination for large datasets
4. **Debouncing**: Debounce user input for search/filter operations

```typescript
// Example: Debounced search
import { debounce } from 'lodash'

const debouncedSearch = debounce(async (query: string) => {
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .ilike('description', `%${query}%`)
    .limit(20)
  
  setSearchResults(data)
}, 300)
```

## 🔧 Advanced Usage

### Filtering and Sorting

```typescript
// Complex filtering
const { data } = await supabase
  .from('transactions')
  .select('*')
  .eq('type', 'expense')
  .gte('amount', 100)
  .gte('date', '2024-01-01')
  .lte('date', '2024-01-31')
  .order('date', { ascending: false })
  .limit(50)
```

### Aggregations

```typescript
// Sum transactions by category
const { data } = await supabase
  .from('transactions')
  .select(`
    category_id,
    categories(name),
    amount.sum()
  `)
  .eq('type', 'expense')
  .gte('date', '2024-01-01')
  .group('category_id')
```

### Upsert Operations

```typescript
// Insert or update
const { data, error } = await supabase
  .from('categories')
  .upsert({
    id: 'category-uuid',
    name: 'Updated Category',
    icon: '📝'
  })
```

## 🧪 Testing

### Mock Supabase Client

```typescript
// For testing
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      data: mockData,
      error: null
    })),
    insert: jest.fn(() => ({
      data: mockData,
      error: null
    }))
  }))
}
```

### Integration Tests

```typescript
describe('Transaction API', () => {
  test('should create transaction', async () => {
    const transaction = {
      amount: 100,
      type: 'expense',
      category_id: 'test-category',
      description: 'Test transaction'
    }
    
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
    
    expect(error).toBeNull()
    expect(data).toBeDefined()
  })
})
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgREST API Reference](https://postgrest.org/en/stable/api.html)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🤝 Contributing

Found an issue with the API? Want to suggest improvements?

1. Check existing [issues](https://github.com/Xenonesis/Budget-Tracker-/issues)
2. Create a new issue with detailed description
3. Submit a pull request with fixes or improvements

---

*For more detailed examples and advanced usage patterns, check out our [GitHub repository](https://github.com/Xenonesis/Budget-Tracker-).*