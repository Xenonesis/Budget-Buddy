import { describe, it, expect } from 'vitest';
import {
  getNotificationTypeLabel,
  getNotificationPriorityColor,
  formatNotificationTime,
} from '@/lib/notification-utils';

describe('getNotificationTypeLabel', () => {
  it('should return correct label for bill_reminder', () => {
    const label = getNotificationTypeLabel('bill_reminder');
    expect(label).toBe('Bill Reminder');
  });

  it('should return correct label for budget_warning', () => {
    const label = getNotificationTypeLabel('budget_warning');
    expect(label).toBe('Budget Warning');
  });

  it('should return correct label for goal_achievement', () => {
    const label = getNotificationTypeLabel('goal_achievement');
    expect(label).toBe('Goal Achievement');
  });

  it('should return correct label for system_update', () => {
    const label = getNotificationTypeLabel('system_update');
    expect(label).toBe('System Update');
  });

  it('should return default label for unknown type', () => {
    const label = getNotificationTypeLabel('unknown_type');
    expect(label).toBe('Notification');
  });
});

describe('getNotificationPriorityColor', () => {
  it('should return red classes for urgent priority', () => {
    const color = getNotificationPriorityColor('urgent');
    expect(color).toContain('text-red-600');
    expect(color).toContain('bg-red-50');
  });

  it('should return orange classes for high priority', () => {
    const color = getNotificationPriorityColor('high');
    expect(color).toContain('text-orange-600');
    expect(color).toContain('bg-orange-50');
  });

  it('should return blue classes for medium priority', () => {
    const color = getNotificationPriorityColor('medium');
    expect(color).toContain('text-blue-600');
    expect(color).toContain('bg-blue-50');
  });

  it('should return gray classes for low priority', () => {
    const color = getNotificationPriorityColor('low');
    expect(color).toContain('text-gray-600');
    expect(color).toContain('bg-gray-50');
  });

  it('should return blue classes for unknown priority', () => {
    const color = getNotificationPriorityColor('unknown');
    expect(color).toContain('text-blue-600');
  });

  it('should include dark mode classes', () => {
    const color = getNotificationPriorityColor('urgent');
    expect(color).toContain('dark:bg-red-950/20');
  });
});

describe('formatNotificationTime', () => {
  it('should return "Just now" for current time', () => {
    const now = new Date().toISOString();
    const formatted = formatNotificationTime(now);
    expect(formatted).toBe('Just now');
  });

  it('should return minutes ago for recent times', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const formatted = formatNotificationTime(fiveMinutesAgo);
    expect(formatted).toBe('5m ago');
  });

  it('should return hours ago for times within 24 hours', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const formatted = formatNotificationTime(twoHoursAgo);
    expect(formatted).toBe('2h ago');
  });

  it('should return days ago for times within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const formatted = formatNotificationTime(threeDaysAgo);
    expect(formatted).toBe('3d ago');
  });

  it('should return date string for times over a week', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const formatted = formatNotificationTime(tenDaysAgo);
    // Should contain date parts
    expect(formatted).toMatch(/\d/);
  });

  it('should handle future dates gracefully', () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const formatted = formatNotificationTime(tomorrow);
    // Future dates should still return a valid string
    expect(typeof formatted).toBe('string');
  });
});
