import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Currency, formatAmount } from '../currency';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Currency Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('budget-currency', 'USD');
  });

  describe('Rendering', () => {
    it('should render currency value', () => {
      render(<Currency value={100} />);
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('should format currency with 2 decimal places', () => {
      render(<Currency value={100.5} />);
      const text = screen.getByText(/100\.50/);
      expect(text).toBeInTheDocument();
    });

    it('should render with USD symbol by default', () => {
      render(<Currency value={100} />);
      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Currency value={100} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Currency Codes', () => {
    it('should use currency override when provided', () => {
      render(<Currency value={100} currencyOverride="EUR" />);
      expect(screen.getByText(/€/)).toBeInTheDocument();
    });

    it('should handle GBP currency', () => {
      render(<Currency value={100} currencyOverride="GBP" />);
      expect(screen.getByText(/£/)).toBeInTheDocument();
    });

    it('should fall back to USD for unsupported currencies', () => {
      render(<Currency value={100} currencyOverride="XYZ" />);
      // Should still render something
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });
  });

  describe('Sign Display', () => {
    it('should show positive sign when showSign is true for positive values', () => {
      render(<Currency value={100} showSign={true} />);
      const text = screen.getByText(/\+/);
      expect(text).toBeInTheDocument();
    });

    it('should show negative sign for negative values', () => {
      render(<Currency value={-100} showSign={true} />);
      const text = screen.getByText(/-/);
      expect(text).toBeInTheDocument();
    });

    it('should not show sign when showSign is false', () => {
      const { container } = render(<Currency value={100} showSign={false} />);
      const text = container.textContent || '';
      expect(text).not.toContain('+');
    });
  });

  describe('Value Formatting', () => {
    it('should format large numbers with separators', () => {
      render(<Currency value={1234567.89} />);
      expect(screen.getByText(/1,234,567\.89/)).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(<Currency value={0} />);
      expect(screen.getByText(/0\.00/)).toBeInTheDocument();
    });

    it('should handle negative values', () => {
      render(<Currency value={-50.25} />);
      expect(screen.getByText(/50\.25/)).toBeInTheDocument();
    });

    it('should round to 2 decimal places', () => {
      render(<Currency value={10.999} />);
      expect(screen.getByText(/11\.00/)).toBeInTheDocument();
    });
  });
});

describe('formatAmount function', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('budget-currency', 'USD');
  });

  it('should format amount with default currency', () => {
    const formatted = formatAmount(100);
    expect(formatted).toContain('100');
    expect(formatted).toContain('$');
  });

  it('should format amount with custom currency', () => {
    const formatted = formatAmount(100, 'EUR');
    expect(formatted).toContain('100');
    expect(formatted).toContain('€');
  });

  it('should format large numbers correctly', () => {
    const formatted = formatAmount(1234567.89);
    expect(formatted).toContain('1,234,567.89');
  });

  it('should handle zero', () => {
    const formatted = formatAmount(0);
    expect(formatted).toContain('0.00');
  });

  it('should handle negative numbers', () => {
    const formatted = formatAmount(-100);
    expect(formatted).toContain('100');
  });

  it('should return string type', () => {
    const formatted = formatAmount(100);
    expect(typeof formatted).toBe('string');
  });
});
