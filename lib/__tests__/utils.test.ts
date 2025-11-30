import { describe, it, expect } from 'vitest';
import { cn, formatDate, getUserTimezone, getRandomColor } from '@/lib/utils';

describe('cn (classnames utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const result = formatDate('2025-01-15');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('should format Date object correctly', () => {
    const date = new Date(2025, 0, 15);
    const result = formatDate(date);
    expect(result).toContain('Jan');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('getUserTimezone', () => {
  it('should return a valid timezone string', () => {
    const timezone = getUserTimezone();
    expect(typeof timezone).toBe('string');
    expect(timezone.length).toBeGreaterThan(0);
  });
});

describe('getRandomColor', () => {
  it('should return a hex color', () => {
    const color = getRandomColor('test');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should return consistent color for same input', () => {
    const color1 = getRandomColor('groceries');
    const color2 = getRandomColor('groceries');
    expect(color1).toBe(color2);
  });

  it('should return different colors for different inputs', () => {
    const color1 = getRandomColor('groceries');
    const color2 = getRandomColor('entertainment');
    expect(color1).not.toBe(color2);
  });
});
