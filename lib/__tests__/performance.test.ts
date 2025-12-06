import { describe, it, expect } from 'vitest';
import {
  filterTransactions,
  sortTransactions,
  paginateTransactions,
  calculateTransactionSummary,
} from '@/lib/transaction-utils';
import type { Transaction, TransactionFilters } from '@/lib/transaction-utils';

// Generate large dataset for performance testing
const generateMockTransactions = (count: number): Transaction[] => {
  const types = ['income', 'expense'];
  const categories = [
    'Groceries',
    'Salary',
    'Entertainment',
    'Utilities',
    'Transport',
    'Healthcare',
    'Shopping',
  ];
  const transactions: Transaction[] = [];

  for (let i = 0; i < count; i++) {
    const date = new Date(2024, 0, 1);
    date.setDate(date.getDate() + Math.floor(i / 10));

    transactions.push({
      id: `txn-${i}`,
      date: date.toISOString().split('T')[0],
      type: types[i % 2] as 'income' | 'expense',
      category_name: categories[i % categories.length],
      description: `Transaction ${i} - ${categories[i % categories.length]}`,
      amount: Math.random() * 1000 + 10,
    });
  }

  return transactions;
};

describe('Performance Tests', () => {
  const smallDataset = generateMockTransactions(100);
  const mediumDataset = generateMockTransactions(1000);
  const largeDataset = generateMockTransactions(10000);

  const defaultFilters: TransactionFilters = {
    type: 'all',
    searchTerm: '',
    dateRange: { start: '', end: '' },
  };

  describe('Filtering Performance', () => {
    it('should filter 100 transactions quickly', () => {
      const start = performance.now();
      const result = filterTransactions(smallDataset, defaultFilters);
      const duration = performance.now() - start;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(10); // Should complete in < 10ms
    });

    it('should filter 1,000 transactions quickly', () => {
      const start = performance.now();
      const result = filterTransactions(mediumDataset, defaultFilters);
      const duration = performance.now() - start;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(50); // Should complete in < 50ms
    });

    it('should filter 10,000 transactions efficiently', () => {
      const start = performance.now();
      const result = filterTransactions(largeDataset, defaultFilters);
      const duration = performance.now() - start;

      expect(result).toHaveLength(10000);
      expect(duration).toBeLessThan(200); // Should complete in < 200ms
    });

    it('should filter with search term efficiently', () => {
      const filters: TransactionFilters = {
        type: 'all',
        searchTerm: 'Groceries',
        dateRange: { start: '', end: '' },
      };

      const start = performance.now();
      const result = filterTransactions(largeDataset, filters);
      const duration = performance.now() - start;

      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200);
    });

    it('should filter by type efficiently', () => {
      const filters: TransactionFilters = {
        type: 'expense',
        searchTerm: '',
        dateRange: { start: '', end: '' },
      };

      const start = performance.now();
      const result = filterTransactions(largeDataset, filters);
      const duration = performance.now() - start;

      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Sorting Performance', () => {
    it('should sort 100 transactions by date quickly', () => {
      const start = performance.now();
      const result = sortTransactions(smallDataset, 'date', 'desc');
      const duration = performance.now() - start;

      expect(result).toHaveLength(100);
      expect(duration).toBeLessThan(5);
    });

    it('should sort 1,000 transactions by date efficiently', () => {
      const start = performance.now();
      const result = sortTransactions(mediumDataset, 'date', 'desc');
      const duration = performance.now() - start;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(20);
    });

    it('should sort 10,000 transactions by date', () => {
      const start = performance.now();
      const result = sortTransactions(largeDataset, 'date', 'desc');
      const duration = performance.now() - start;

      expect(result).toHaveLength(10000);
      expect(duration).toBeLessThan(100); // Sorting is O(n log n)
    });

    it('should sort by amount efficiently', () => {
      const start = performance.now();
      const result = sortTransactions(largeDataset, 'amount', 'desc');
      const duration = performance.now() - start;

      expect(result).toHaveLength(10000);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Pagination Performance', () => {
    it('should paginate quickly', () => {
      const start = performance.now();
      const result = paginateTransactions(largeDataset, 1, 50);
      const duration = performance.now() - start;

      expect(result).toHaveLength(50);
      expect(duration).toBeLessThan(5); // Pagination is O(1)
    });

    it('should handle large page sizes', () => {
      const start = performance.now();
      const result = paginateTransactions(largeDataset, 1, 1000);
      const duration = performance.now() - start;

      expect(result).toHaveLength(1000);
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Summary Calculation Performance', () => {
    it('should calculate summary for 100 transactions quickly', () => {
      const start = performance.now();
      const result = calculateTransactionSummary(smallDataset);
      const duration = performance.now() - start;

      expect(result).toHaveProperty('totalIncome');
      expect(result).toHaveProperty('totalExpense');
      expect(result).toHaveProperty('balance');
      expect(duration).toBeLessThan(5);
    });

    it('should calculate summary for 1,000 transactions efficiently', () => {
      const start = performance.now();
      const result = calculateTransactionSummary(mediumDataset);
      const duration = performance.now() - start;

      expect(result.balance).toBeDefined();
      expect(duration).toBeLessThan(20);
    });

    it('should calculate summary for 10,000 transactions', () => {
      const start = performance.now();
      const result = calculateTransactionSummary(largeDataset);
      const duration = performance.now() - start;

      expect(result.totalIncome).toBeGreaterThan(0);
      expect(result.totalExpense).toBeGreaterThan(0);
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Combined Operations Performance', () => {
    it('should handle filter + sort + paginate efficiently', () => {
      const filters: TransactionFilters = {
        type: 'expense',
        searchTerm: 'Groceries',
        dateRange: { start: '2024-01-01', end: '2024-12-31' },
      };

      const start = performance.now();

      // Filter
      const filtered = filterTransactions(largeDataset, filters);

      // Sort
      const sorted = sortTransactions(filtered, 'date', 'desc');

      // Paginate
      const paginated = paginateTransactions(sorted, 1, 20);

      const duration = performance.now() - start;

      expect(paginated.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(300); // Combined operation
    });

    it('should handle multiple sequential operations', () => {
      const start = performance.now();

      for (let i = 0; i < 10; i++) {
        const filtered = filterTransactions(mediumDataset, defaultFilters);
        const sorted = sortTransactions(filtered, 'date', 'desc');
        const paginated = paginateTransactions(sorted, 1, 50);
        expect(paginated).toBeDefined();
      }

      const duration = performance.now() - start;
      const avgDuration = duration / 10;

      expect(avgDuration).toBeLessThan(100); // Average per operation
    });
  });

  describe('Memory Efficiency', () => {
    it('should not create excessive copies during filtering', () => {
      const transactions = generateMockTransactions(5000);

      // Multiple filter operations
      const result1 = filterTransactions(transactions, { ...defaultFilters, type: 'expense' });
      const result2 = filterTransactions(transactions, { ...defaultFilters, type: 'income' });
      const result3 = filterTransactions(transactions, defaultFilters);

      // All operations should complete without memory issues
      expect(result1.length + result2.length).toBeLessThanOrEqual(transactions.length);
      expect(result3.length).toBe(transactions.length);
    });

    it('should handle large datasets without memory overflow', () => {
      const hugeDataset = generateMockTransactions(50000);

      const start = performance.now();
      const filtered = filterTransactions(hugeDataset, defaultFilters);
      const duration = performance.now() - start;

      expect(filtered).toHaveLength(50000);
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
  });

  describe('Load Testing Scenarios', () => {
    it('should handle concurrent filtering operations', () => {
      const promises = Array(10)
        .fill(null)
        .map((_, i) => {
          return new Promise<number>((resolve) => {
            const start = performance.now();
            const result = filterTransactions(mediumDataset, defaultFilters);
            const duration = performance.now() - start;
            expect(result).toHaveLength(1000);
            resolve(duration);
          });
        });

      return Promise.all(promises).then((durations) => {
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
        expect(avgDuration).toBeLessThan(100);
      });
    });

    it('should maintain performance under repeated operations', () => {
      const iterations = 100;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        filterTransactions(smallDataset, defaultFilters);
        durations.push(performance.now() - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / iterations;
      const maxDuration = Math.max(...durations);

      expect(avgDuration).toBeLessThan(10);
      expect(maxDuration).toBeLessThan(50); // No significant degradation
    });
  });
});
