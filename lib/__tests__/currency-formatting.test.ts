import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { formatCurrency } from '@/lib/store';

describe('formatCurrency', () => {
  // Store original localStorage
  const originalLocalStorage = global.localStorage;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: (key: string) => {
        if (key === 'budget-currency') return 'USD';
        return null;
      },
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null,
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  it('should format currency with USD by default', () => {
    const result = formatCurrency(100);
    expect(result).toContain('100');
    expect(result).toContain('$');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0.00');
  });

  it('should format negative amounts', () => {
    const result = formatCurrency(-50.25);
    expect(result).toContain('50.25');
    expect(result).toContain('-');
  });

  it('should format large numbers with proper separators', () => {
    const result = formatCurrency(1234567.89);
    expect(result).toContain('1,234,567.89');
  });

  it('should format small decimal amounts', () => {
    const result = formatCurrency(0.99);
    expect(result).toContain('0.99');
  });

  it('should round to 2 decimal places', () => {
    const result = formatCurrency(10.999);
    expect(result).toContain('11.00');
  });

  it('should handle different currency codes', () => {
    const resultUSD = formatCurrency(100, 'USD');
    expect(resultUSD).toContain('$');

    const resultEUR = formatCurrency(100, 'EUR');
    expect(resultEUR).toContain('€');

    const resultGBP = formatCurrency(100, 'GBP');
    expect(resultGBP).toContain('£');
  });

  it('should handle invalid currency by falling back to USD', () => {
    const result = formatCurrency(100, 'INVALID');
    // Should not throw and should return something
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('should format fractional cents correctly', () => {
    const result = formatCurrency(10.5);
    expect(result).toContain('10.50');
  });

  it('should handle very large numbers', () => {
    const result = formatCurrency(999999999.99);
    expect(result).toContain('999,999,999.99');
  });
});
