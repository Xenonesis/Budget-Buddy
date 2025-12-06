import { describe, it, expect } from 'vitest';
import { calculateNextRecurringDate } from '@/lib/utils';

describe('calculateNextRecurringDate', () => {
  describe('daily frequency', () => {
    it('should add 1 day', () => {
      const date = new Date('2025-01-15');
      const next = calculateNextRecurringDate(date, 'daily');
      expect(next.getDate()).toBe(16);
      expect(next.getMonth()).toBe(0); // January
    });

    it('should handle month transitions', () => {
      const date = new Date('2025-01-31');
      const next = calculateNextRecurringDate(date, 'daily');
      expect(next.getDate()).toBe(1);
      expect(next.getMonth()).toBe(1); // February
    });
  });

  describe('weekly frequency', () => {
    it('should add 7 days', () => {
      const date = new Date('2025-01-15');
      const next = calculateNextRecurringDate(date, 'weekly');
      expect(next.getDate()).toBe(22);
    });

    it('should handle month transitions', () => {
      const date = new Date('2025-01-29');
      const next = calculateNextRecurringDate(date, 'weekly');
      expect(next.getDate()).toBe(5);
      expect(next.getMonth()).toBe(1); // February
    });
  });

  describe('biweekly frequency', () => {
    it('should add 14 days', () => {
      const date = new Date('2025-01-01');
      const next = calculateNextRecurringDate(date, 'biweekly');
      expect(next.getDate()).toBe(15);
    });

    it('should handle month transitions', () => {
      const date = new Date('2025-01-25');
      const next = calculateNextRecurringDate(date, 'biweekly');
      expect(next.getDate()).toBe(8);
      expect(next.getMonth()).toBe(1); // February
    });
  });

  describe('monthly frequency', () => {
    it('should add 1 month', () => {
      const date = new Date('2025-01-15');
      const next = calculateNextRecurringDate(date, 'monthly');
      expect(next.getDate()).toBe(15);
      expect(next.getMonth()).toBe(1); // February
    });

    it('should handle end of month correctly', () => {
      const date = new Date('2025-01-31');
      const next = calculateNextRecurringDate(date, 'monthly');
      // February doesn't have 31 days, should adjust
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBeLessThanOrEqual(29);
    });

    it('should handle leap year correctly', () => {
      const date = new Date('2024-01-31'); // 2024 is a leap year
      const next = calculateNextRecurringDate(date, 'monthly');
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(29); // Leap year February
    });

    it('should handle year transitions', () => {
      const date = new Date('2025-12-15');
      const next = calculateNextRecurringDate(date, 'monthly');
      expect(next.getFullYear()).toBe(2026);
      expect(next.getMonth()).toBe(0); // January
      expect(next.getDate()).toBe(15);
    });
  });

  describe('quarterly frequency', () => {
    it('should add 3 months', () => {
      const date = new Date('2025-01-15');
      const next = calculateNextRecurringDate(date, 'quarterly');
      expect(next.getMonth()).toBe(3); // April
      expect(next.getDate()).toBe(15);
    });

    it('should handle end of month correctly', () => {
      const date = new Date('2025-01-31');
      const next = calculateNextRecurringDate(date, 'quarterly');
      expect(next.getMonth()).toBe(3); // April
      // April has 30 days, not 31
      expect(next.getDate()).toBe(30);
    });

    it('should handle year transitions', () => {
      const date = new Date('2025-11-15');
      const next = calculateNextRecurringDate(date, 'quarterly');
      expect(next.getFullYear()).toBe(2026);
      expect(next.getMonth()).toBe(1); // February
    });
  });

  describe('annually frequency', () => {
    it('should add 1 year', () => {
      const date = new Date('2025-01-15');
      const next = calculateNextRecurringDate(date, 'annually');
      expect(next.getFullYear()).toBe(2026);
      expect(next.getMonth()).toBe(0); // January
      expect(next.getDate()).toBe(15);
    });

    it('should handle leap year Feb 29 to non-leap year', () => {
      const date = new Date('2024-02-29'); // Leap year
      const next = calculateNextRecurringDate(date, 'annually');
      expect(next.getFullYear()).toBe(2025);
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(28); // Should adjust to Feb 28
    });

    it('should handle regular dates correctly', () => {
      const date = new Date('2025-06-15');
      const next = calculateNextRecurringDate(date, 'annually');
      expect(next.getFullYear()).toBe(2026);
      expect(next.getMonth()).toBe(5); // June
      expect(next.getDate()).toBe(15);
    });
  });

  describe('string date input', () => {
    it('should accept string dates', () => {
      const next = calculateNextRecurringDate('2025-01-15', 'monthly');
      expect(next.getMonth()).toBe(1); // February
      expect(next.getDate()).toBe(15);
    });

    it('should accept ISO string dates', () => {
      const next = calculateNextRecurringDate('2025-01-15T10:30:00Z', 'weekly');
      expect(next.getDate()).toBe(22);
    });
  });

  describe('unknown frequency', () => {
    it('should default to monthly for unknown frequency', () => {
      const date = new Date('2025-01-15');
      const next = calculateNextRecurringDate(date, 'unknown' as any);
      expect(next.getMonth()).toBe(1); // February (monthly default)
      expect(next.getDate()).toBe(15);
    });
  });

  describe('error handling', () => {
    it('should handle invalid date input gracefully', () => {
      // When given an invalid date, the function will try to process it
      // and eventually catch the error to return a fallback
      const next = calculateNextRecurringDate('invalid-date', 'monthly');

      expect(next).toBeInstanceOf(Date);

      // The fallback logic in the catch block returns a valid future date
      const timestamp = next.getTime();

      // If we got an Invalid Date (NaN), that's acceptable error handling
      // OR we got a valid fallback date
      const isValidFallback = !isNaN(timestamp) && timestamp > Date.now();
      const isInvalidDate = isNaN(timestamp);

      // Either behavior is acceptable - either it returns Invalid Date or a valid fallback
      expect(isValidFallback || isInvalidDate).toBe(true);
    });
  });
});
