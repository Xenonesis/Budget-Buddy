import { describe, it, expect } from 'vitest';
import { generateCSVContent, calculateNextExportDate } from '@/lib/export-utils';
import type { Transaction, ExportColumns } from '@/lib/export-utils';

describe('Export Utilities', () => {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      user_id: 'user1',
      type: 'expense',
      category_id: 'cat1',
      category_name: 'Groceries',
      amount: 150.5,
      description: 'Weekly shopping',
      date: '2025-01-15',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      user_id: 'user1',
      type: 'income',
      category_id: 'cat2',
      category_name: 'Salary',
      amount: 5000.0,
      description: 'Monthly salary',
      date: '2025-01-10',
      created_at: '2025-01-10T09:00:00Z',
    },
    {
      id: '3',
      user_id: 'user1',
      type: 'expense',
      category_id: 'cat3',
      category_name: 'Entertainment',
      amount: 45.0,
      description: 'Movie tickets',
      date: '2025-01-20',
      created_at: '2025-01-20T18:00:00Z',
    },
  ];

  const allColumns: ExportColumns = {
    date: true,
    type: true,
    category: true,
    description: true,
    amount: true,
  };

  describe('generateCSVContent', () => {
    it('should generate CSV with all columns', () => {
      const csv = generateCSVContent(mockTransactions, allColumns);

      expect(csv).toContain('Date,Type,Category,Description,Amount');
      expect(csv).toContain('Groceries');
      expect(csv).toContain('Weekly shopping');
      expect(csv).toContain('150.50');
    });

    it('should include all transactions', () => {
      const csv = generateCSVContent(mockTransactions, allColumns);

      const lines = csv.split('\n').filter((line) => line.trim());
      // Header + 3 transactions
      expect(lines.length).toBe(4);
    });

    it('should handle selective columns', () => {
      const selectedColumns: ExportColumns = {
        date: true,
        type: false,
        category: true,
        description: false,
        amount: true,
      };

      const csv = generateCSVContent(mockTransactions, selectedColumns);

      expect(csv).toContain('Date,Category,Amount');
      expect(csv).not.toContain('Type');
      expect(csv).not.toContain('Description');
    });

    it('should format dates correctly', () => {
      const csv = generateCSVContent(mockTransactions, allColumns);

      // Dates are formatted, so check for month abbreviations
      expect(csv).toMatch(/Jan.*15.*2025/);
      expect(csv).toMatch(/Jan.*10.*2025/);
      expect(csv).toMatch(/Jan.*20.*2025/);
    });

    it('should format amounts with 2 decimal places', () => {
      const csv = generateCSVContent(mockTransactions, allColumns);

      expect(csv).toContain('150.50');
      expect(csv).toContain('5000.00');
      expect(csv).toContain('45.00');
    });

    it('should handle empty transaction list', () => {
      const csv = generateCSVContent([], allColumns);

      expect(csv).toContain('Date,Type,Category,Description,Amount');
      const lines = csv.split('\n').filter((line) => line.trim());
      expect(lines.length).toBe(1); // Only header
    });

    it('should escape commas in descriptions', () => {
      const transactionWithComma: Transaction[] = [
        {
          id: '4',
          user_id: 'user1',
          type: 'expense',
          category_id: 'cat1',
          category_name: 'Food',
          amount: 25.0,
          description: 'Coffee, tea, and snacks',
          date: '2025-01-15',
          created_at: '2025-01-15T10:00:00Z',
        },
      ];

      const csv = generateCSVContent(transactionWithComma, allColumns);

      expect(csv).toContain('"Coffee, tea, and snacks"');
    });

    it('should handle transactions without category names', () => {
      const transactionWithoutCategory: Transaction[] = [
        {
          id: '5',
          user_id: 'user1',
          type: 'expense',
          category_id: 'cat1',
          amount: 50.0,
          description: 'Misc expense',
          date: '2025-01-15',
          created_at: '2025-01-15T10:00:00Z',
        },
      ];

      const csv = generateCSVContent(transactionWithoutCategory, allColumns);

      expect(csv).toBeTruthy();
      expect(csv).toContain('Misc expense');
      expect(csv).toContain('Uncategorized');
    });

    it('should include both income and expense types', () => {
      const csv = generateCSVContent(mockTransactions, allColumns);

      expect(csv).toContain('income');
      expect(csv).toContain('expense');
    });

    it('should throw error when no columns selected', () => {
      const noColumns: ExportColumns = {
        date: false,
        type: false,
        category: false,
        description: false,
        amount: false,
      };

      expect(() => generateCSVContent(mockTransactions, noColumns)).toThrow();
    });
  });

  describe('calculateNextExportDate', () => {
    it('should calculate next weekly export date', () => {
      const day = 1; // Monday
      const next = calculateNextExportDate('weekly', day);

      expect(next).toBeInstanceOf(Date);
      expect(next.getDay()).toBe(1); // Monday
      expect(next.getTime()).toBeGreaterThan(Date.now());
    });

    it('should calculate next monthly export date', () => {
      const day = 15; // 15th of month
      const next = calculateNextExportDate('monthly', day);

      expect(next).toBeInstanceOf(Date);
      expect(next.getDate()).toBe(15);
      expect(next.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle end of month for monthly exports', () => {
      const day = 31; // Last day of month
      const next = calculateNextExportDate('monthly', day);

      expect(next).toBeInstanceOf(Date);
      // Should handle months with fewer than 31 days
      expect(next.getDate()).toBeGreaterThan(0);
      expect(next.getDate()).toBeLessThanOrEqual(31);
    });

    it('should return future date for weekly exports', () => {
      const next = calculateNextExportDate('weekly', 3); // Wednesday

      expect(next.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return future date for monthly exports', () => {
      const next = calculateNextExportDate('monthly', 20);

      expect(next.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle day 0 for weekly (Sunday)', () => {
      const next = calculateNextExportDate('weekly', 0);

      expect(next.getDay()).toBe(0); // Sunday
    });

    it('should handle first day of month', () => {
      const next = calculateNextExportDate('monthly', 1);

      expect(next.getDate()).toBe(1);
    });
  });
});
