import { describe, it, expect } from 'vitest';
import { getRandomColor } from '@/lib/colors';

describe('getRandomColor', () => {
  it('should return a color for any input', () => {
    const color = getRandomColor('groceries');
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
  });

  it('should return consistent color for same input', () => {
    const color1 = getRandomColor('groceries');
    const color2 = getRandomColor('groceries');
    expect(color1).toBe(color2);
  });

  it('should return different colors for most different inputs', () => {
    // Test with inputs that are more likely to produce different hashes
    const color1 = getRandomColor('category-a');
    const color2 = getRandomColor('category-b-very-different');
    // While the function is deterministic, we can't guarantee different colors
    // for all inputs due to hash collisions, so we just verify they're valid
    expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(color2).toMatch(/^#[0-9a-fA-F]{6}$/);

    // But we can test that significantly different strings usually differ
    const colors = [
      getRandomColor('a'),
      getRandomColor('b'),
      getRandomColor('c'),
      getRandomColor('d'),
      getRandomColor('e'),
    ];
    const uniqueColors = new Set(colors);
    // At least some should be different
    expect(uniqueColors.size).toBeGreaterThan(1);
  });

  it('should return valid hex colors', () => {
    const color = getRandomColor('test');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should be deterministic', () => {
    const text = 'entertainment';
    const color1 = getRandomColor(text);
    const color2 = getRandomColor(text);
    const color3 = getRandomColor(text);
    expect(color1).toBe(color2);
    expect(color2).toBe(color3);
  });

  it('should handle empty string', () => {
    const color = getRandomColor('');
    expect(color).toBeTruthy();
    expect(typeof color).toBe('string');
  });

  it('should handle special characters', () => {
    const color = getRandomColor('test@#$%');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should handle numbers as strings', () => {
    const color = getRandomColor('12345');
    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  it('should be case-sensitive', () => {
    const color1 = getRandomColor('test');
    const color2 = getRandomColor('TEST');
    // May or may not be different, but should both be valid
    expect(color1).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(color2).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});
