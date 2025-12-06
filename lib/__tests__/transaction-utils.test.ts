import { describe, it, expect } from 'vitest';
import {
  filterTransactions,
  sortTransactions,
  paginateTransactions,
  calculateTransactionSummary,
  getProcessedTransactions,
  type Transaction,
  type TransactionFilters,
} from '@/lib/transaction-utils';

// Sample test data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-01-15',
    type: 'expense',
    category_name: 'Groceries',
    description: 'Walmart shopping',
    amount: 150.5,
  },
  {
    id: '2',
    date: '2025-01-10',
    type: 'income',
    category_name: 'Salary',
    description: 'Monthly salary',
    amount: 5000.0,
  },
  {
    id: '3',
    date: '2025-01-20',
    type: 'expense',
    category_name: 'Entertainment',
    description: 'Movie tickets',
    amount: 45.0,
  },
  {
    id: '4',
    date: '2025-01-05',
    type: 'expense',
    category_name: 'Utilities',
    description: 'Electric bill',
    amount: 120.0,
  },
  {
    id: '5',
    date: '2025-01-12',
    type: 'income',
    category_name: 'Freelance',
    description: 'Project payment',
    amount: 1500.0,
  },
];

describe('filterTransactions', () => {
  const defaultFilters: TransactionFilters = {
    type: 'all',
    searchTerm: '',
    dateRange: { start: '', end: '' },
  };

  it('should return all transactions with default filters', () => {
    const result = filterTransactions(mockTransactions, defaultFilters);
    expect(result).toHaveLength(5);
  });

  it('should filter by transaction type', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      type: 'expense',
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(3);
    expect(result.every((t) => t.type === 'expense')).toBe(true);
  });

  it('should filter by income type', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      type: 'income',
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(2);
    expect(result.every((t) => t.type === 'income')).toBe(true);
  });

  it('should filter by search term in description', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      searchTerm: 'salary',
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('salary');
  });

  it('should filter by search term in category', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      searchTerm: 'groceries',
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(1);
    expect(result[0].category_name).toBe('Groceries');
  });

  it('should filter by date range', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      dateRange: {
        start: '2025-01-10',
        end: '2025-01-15',
      },
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(3);
  });

  it('should filter by start date only', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      dateRange: {
        start: '2025-01-15',
        end: '',
      },
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(2); // Jan 15 and Jan 20
  });

  it('should apply multiple filters simultaneously', () => {
    const filters: TransactionFilters = {
      type: 'expense',
      searchTerm: 'bill',
      dateRange: { start: '', end: '' },
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('bill');
  });

  it('should be case-insensitive for search', () => {
    const filters: TransactionFilters = {
      ...defaultFilters,
      searchTerm: 'WALMART',
    };
    const result = filterTransactions(mockTransactions, filters);
    expect(result).toHaveLength(1);
  });
});

describe('sortTransactions', () => {
  it('should sort by date ascending', () => {
    const result = sortTransactions(mockTransactions, 'date', 'asc');
    expect(result[0].date).toBe('2025-01-05');
    expect(result[4].date).toBe('2025-01-20');
  });

  it('should sort by date descending', () => {
    const result = sortTransactions(mockTransactions, 'date', 'desc');
    expect(result[0].date).toBe('2025-01-20');
    expect(result[4].date).toBe('2025-01-05');
  });

  it('should sort by amount ascending', () => {
    const result = sortTransactions(mockTransactions, 'amount', 'asc');
    expect(result[0].amount).toBe(45.0);
    expect(result[4].amount).toBe(5000.0);
  });

  it('should sort by amount descending', () => {
    const result = sortTransactions(mockTransactions, 'amount', 'desc');
    expect(result[0].amount).toBe(5000.0);
    expect(result[4].amount).toBe(45.0);
  });

  it('should sort by category ascending', () => {
    const result = sortTransactions(mockTransactions, 'category', 'asc');
    expect(result[0].category_name).toBe('Entertainment');
  });

  it('should sort by description ascending', () => {
    const result = sortTransactions(mockTransactions, 'description', 'asc');
    expect(result[0].description).toBe('Electric bill');
  });

  it('should not mutate original array', () => {
    const original = [...mockTransactions];
    sortTransactions(mockTransactions, 'date', 'asc');
    expect(mockTransactions).toEqual(original);
  });
});

describe('paginateTransactions', () => {
  it('should return first page correctly', () => {
    const result = paginateTransactions(mockTransactions, 1, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('should return second page correctly', () => {
    const result = paginateTransactions(mockTransactions, 2, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('3');
    expect(result[1].id).toBe('4');
  });

  it('should return partial last page', () => {
    const result = paginateTransactions(mockTransactions, 3, 2);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('5');
  });

  it('should handle page size larger than array', () => {
    const result = paginateTransactions(mockTransactions, 1, 10);
    expect(result).toHaveLength(5);
  });

  it('should return empty array for out of bounds page', () => {
    const result = paginateTransactions(mockTransactions, 10, 2);
    expect(result).toHaveLength(0);
  });
});

describe('calculateTransactionSummary', () => {
  it('should calculate summary correctly', () => {
    const result = calculateTransactionSummary(mockTransactions);
    expect(result.totalIncome).toBe(6500.0); // 5000 + 1500
    expect(result.totalExpense).toBe(315.5); // 150.50 + 45 + 120
    expect(result.balance).toBe(6184.5); // 6500 - 315.50
  });

  it('should handle empty array', () => {
    const result = calculateTransactionSummary([]);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.balance).toBe(0);
  });

  it('should handle only expenses', () => {
    const expensesOnly = mockTransactions.filter((t) => t.type === 'expense');
    const result = calculateTransactionSummary(expensesOnly);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(315.5);
    expect(result.balance).toBe(-315.5);
  });

  it('should handle only income', () => {
    const incomeOnly = mockTransactions.filter((t) => t.type === 'income');
    const result = calculateTransactionSummary(incomeOnly);
    expect(result.totalIncome).toBe(6500.0);
    expect(result.totalExpense).toBe(0);
    expect(result.balance).toBe(6500.0);
  });
});

describe('getProcessedTransactions', () => {
  const defaultFilters: TransactionFilters = {
    type: 'all',
    searchTerm: '',
    dateRange: { start: '', end: '' },
  };

  it('should return complete processed result', () => {
    const result = getProcessedTransactions(mockTransactions, defaultFilters, 'date', 'desc', 1, 3);

    expect(result.transactions).toHaveLength(3);
    expect(result.totalItems).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  it('should apply filters, sorting, and pagination together', () => {
    const filters: TransactionFilters = {
      type: 'expense',
      searchTerm: '',
      dateRange: { start: '', end: '' },
    };

    const result = getProcessedTransactions(mockTransactions, filters, 'amount', 'asc', 1, 2);

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].amount).toBe(45.0); // Movie tickets
    expect(result.totalItems).toBe(3); // 3 expenses total
    expect(result.totalPages).toBe(2);
  });

  it('should calculate total pages correctly', () => {
    const result = getProcessedTransactions(mockTransactions, defaultFilters, 'date', 'asc', 1, 2);

    expect(result.totalPages).toBe(3); // 5 items / 2 per page = 3 pages
  });

  it('should handle last page with fewer items', () => {
    const result = getProcessedTransactions(mockTransactions, defaultFilters, 'date', 'asc', 3, 2);

    expect(result.transactions).toHaveLength(1);
  });
});
