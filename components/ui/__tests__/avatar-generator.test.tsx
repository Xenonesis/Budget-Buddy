import { describe, it, expect } from 'vitest';
import { generateUserAvatar, getFallbackAvatar } from '../avatar-generator';

describe('Avatar Generator', () => {
  describe('generateUserAvatar', () => {
    it('should generate valid SVG data URL', () => {
      const avatar = generateUserAvatar('John Doe', 1);
      expect(avatar).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should extract initials from name', () => {
      const avatar = generateUserAvatar('John Doe', 1);
      expect(avatar).toContain('JD');
    });

    it('should extract initials from single name', () => {
      const avatar = generateUserAvatar('John', 1);
      expect(avatar).toContain('J');
    });

    it('should limit initials to 2 characters', () => {
      const avatar = generateUserAvatar('John Michael Doe', 1);
      expect(avatar).toContain('JM');
    });

    it('should convert initials to uppercase', () => {
      const avatar = generateUserAvatar('john doe', 1);
      expect(avatar).toContain('JD');
    });

    it('should use different colors for different IDs', () => {
      const avatar1 = generateUserAvatar('John Doe', 1);
      const avatar2 = generateUserAvatar('John Doe', 2);
      expect(avatar1).not.toBe(avatar2);
    });

    it('should use consistent colors for same ID', () => {
      const avatar1 = generateUserAvatar('John Doe', 5);
      const avatar2 = generateUserAvatar('Jane Smith', 5);
      // Both should use the same color (id % colors.length)
      // ID 5 maps to index 5 in the 10-color array - Cyan
      const expectedColor = '%2306b6d4'; // URL-encoded #06b6d4
      expect(avatar1).toContain(expectedColor);
      expect(avatar2).toContain(expectedColor);
    });

    it('should support custom size', () => {
      const avatar = generateUserAvatar('John Doe', 1, 64);
      // Check for URL-encoded width and height
      expect(avatar).toContain('width%3D%2264%22');
      expect(avatar).toContain('height%3D%2264%22');
    });

    it('should use default size of 48', () => {
      const avatar = generateUserAvatar('John Doe', 1);
      // Check for URL-encoded width and height
      expect(avatar).toContain('width%3D%2248%22');
      expect(avatar).toContain('height%3D%2248%22');
    });

    it('should encode SVG properly', () => {
      const avatar = generateUserAvatar('John Doe', 1);
      expect(avatar).not.toContain('<');
      expect(avatar).not.toContain('>');
      expect(avatar).toContain('%3C'); // Encoded <
      expect(avatar).toContain('%3E'); // Encoded >
    });

    it('should create circular avatars', () => {
      const avatar = generateUserAvatar('John Doe', 1);
      expect(avatar).toContain('circle');
    });

    it('should handle empty name gracefully', () => {
      const avatar = generateUserAvatar('', 1);
      expect(avatar).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should handle special characters in name', () => {
      const avatar = generateUserAvatar('José María', 1);
      expect(avatar).toMatch(/^data:image\/svg\+xml,/);
      expect(avatar).toContain('JM');
    });
  });

  describe('getFallbackAvatar', () => {
    it('should generate valid SVG data URL', () => {
      const avatar = getFallbackAvatar('John Doe');
      expect(avatar).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should extract first character as initial', () => {
      const avatar = getFallbackAvatar('John Doe');
      expect(avatar).toContain('J');
    });

    it('should convert initial to uppercase', () => {
      const avatar = getFallbackAvatar('john');
      expect(avatar).toContain('J');
    });

    it('should use gray color', () => {
      const avatar = getFallbackAvatar('John Doe');
      // Check for URL-encoded gray color
      expect(avatar).toContain('%236b7280');
    });

    it('should support custom size', () => {
      const avatar = getFallbackAvatar('John Doe', 64);
      // Check for URL-encoded width and height
      expect(avatar).toContain('width%3D%2264%22');
      expect(avatar).toContain('height%3D%2264%22');
    });

    it('should use default size of 48', () => {
      const avatar = getFallbackAvatar('John Doe');
      // Check for URL-encoded width and height
      expect(avatar).toContain('width%3D%2248%22');
      expect(avatar).toContain('height%3D%2248%22');
    });

    it('should encode SVG properly', () => {
      const avatar = getFallbackAvatar('John Doe');
      expect(avatar).not.toContain('<');
      expect(avatar).not.toContain('>');
    });

    it('should create circular avatars', () => {
      const avatar = getFallbackAvatar('John Doe');
      expect(avatar).toContain('circle');
    });

    it('should handle empty name', () => {
      const avatar = getFallbackAvatar('');
      expect(avatar).toMatch(/^data:image\/svg\+xml,/);
    });

    it('should always produce same avatar for same name', () => {
      const avatar1 = getFallbackAvatar('John Doe');
      const avatar2 = getFallbackAvatar('John Doe');
      expect(avatar1).toBe(avatar2);
    });
  });

  describe('Comparison', () => {
    it('should have different colors between generateUserAvatar and getFallbackAvatar', () => {
      const userAvatar = generateUserAvatar('John Doe', 1);
      const fallbackAvatar = getFallbackAvatar('John Doe');

      // User avatar uses color from palette (ID 1 = purple), fallback uses gray
      // Check for URL-encoded colors
      expect(userAvatar).toContain('%238b5cf6'); // Purple for ID 1
      expect(fallbackAvatar).toContain('%236b7280'); // Gray for fallback
    });

    it('should have different initials logic', () => {
      const userAvatar = generateUserAvatar('John Doe', 1);
      const fallbackAvatar = getFallbackAvatar('John Doe');

      // User avatar has 2 initials (JD), fallback has 1 (J)
      expect(userAvatar).toContain('JD');
      expect(fallbackAvatar).toContain('J');
      // Fallback should NOT have 'JD' as a string
      expect(fallbackAvatar.includes('JD')).toBe(false);
    });
  });
});
