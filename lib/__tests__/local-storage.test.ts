import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { saveToLocalStorage, getFromLocalStorage, queueOfflineChange, isOnline } from '@/lib/utils';

describe('Local Storage Utilities', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    // Create a mock localStorage
    localStorageMock = {};

    const localStoragePrototype = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value;
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      },
      length: 0,
      key: () => null,
    };

    Object.defineProperty(global, 'localStorage', {
      value: localStoragePrototype,
      writable: true,
    });
  });

  afterEach(() => {
    localStorageMock = {};
  });

  describe('saveToLocalStorage', () => {
    it('should save data to localStorage', () => {
      const data = { name: 'Test', value: 123 };
      saveToLocalStorage('test-key', data);

      const stored = localStorageMock['test-key'];
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored).data).toEqual(data);
    });

    it('should save data with expiry time', () => {
      const data = { name: 'Test' };
      saveToLocalStorage('test-key', data, 60); // 60 minutes TTL

      const stored = JSON.parse(localStorageMock['test-key']);
      expect(stored.expiry).toBeTruthy();
      expect(stored.expiry).toBeGreaterThan(Date.now());
    });

    it('should save data without expiry when TTL is 0', () => {
      const data = { name: 'Test' };
      saveToLocalStorage('test-key', data, 0);

      const stored = JSON.parse(localStorageMock['test-key']);
      expect(stored.expiry).toBeNull();
    });

    it('should handle various data types', () => {
      saveToLocalStorage('string', 'test string');
      saveToLocalStorage('number', 42);
      saveToLocalStorage('boolean', true);
      saveToLocalStorage('array', [1, 2, 3]);
      saveToLocalStorage('object', { key: 'value' });

      expect(JSON.parse(localStorageMock['string']).data).toBe('test string');
      expect(JSON.parse(localStorageMock['number']).data).toBe(42);
      expect(JSON.parse(localStorageMock['boolean']).data).toBe(true);
      expect(JSON.parse(localStorageMock['array']).data).toEqual([1, 2, 3]);
      expect(JSON.parse(localStorageMock['object']).data).toEqual({ key: 'value' });
    });
  });

  describe('getFromLocalStorage', () => {
    it('should retrieve saved data', () => {
      const data = { name: 'Test', value: 123 };
      saveToLocalStorage('test-key', data);

      const retrieved = getFromLocalStorage('test-key');
      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = getFromLocalStorage('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should return null for expired data', () => {
      const data = { name: 'Test' };
      // Manually create expired data
      const expiredItem = {
        data,
        expiry: Date.now() - 1000, // Expired 1 second ago
      };
      localStorageMock['expired-key'] = JSON.stringify(expiredItem);

      const retrieved = getFromLocalStorage('expired-key');
      expect(retrieved).toBeNull();
      expect(localStorageMock['expired-key']).toBeUndefined();
    });

    it('should retrieve non-expired data', () => {
      const data = { name: 'Test' };
      saveToLocalStorage('test-key', data, 60); // 60 minutes in future

      const retrieved = getFromLocalStorage('test-key');
      expect(retrieved).toEqual(data);
    });

    it('should retrieve data without expiry', () => {
      const data = { name: 'Test' };
      const item = { data, expiry: null };
      localStorageMock['test-key'] = JSON.stringify(item);

      const retrieved = getFromLocalStorage('test-key');
      expect(retrieved).toEqual(data);
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock['corrupted'] = 'not valid json {';

      const retrieved = getFromLocalStorage('corrupted');
      expect(retrieved).toBeNull();
    });
  });

  describe('queueOfflineChange', () => {
    it('should queue a create change', () => {
      const change = {
        type: 'create' as const,
        entity: 'transaction' as const,
        data: { id: '123', amount: 100 },
      };

      queueOfflineChange(change);

      const queued = getFromLocalStorage('budget_tracker_offline_changes');
      expect(queued).toHaveLength(1);
      expect(queued[0].type).toBe('create');
      expect(queued[0].entity).toBe('transaction');
    });

    it('should queue multiple changes', () => {
      queueOfflineChange({
        type: 'create',
        entity: 'transaction',
        data: { id: '1', amount: 100 },
      });
      queueOfflineChange({
        type: 'update',
        entity: 'transaction',
        data: { id: '2', amount: 200 },
      });
      queueOfflineChange({
        type: 'delete',
        entity: 'category',
        data: { id: '3' },
      });

      const queued = getFromLocalStorage('budget_tracker_offline_changes');
      expect(queued).toHaveLength(3);
    });

    it('should add timestamp to changes', () => {
      const before = Date.now();
      queueOfflineChange({
        type: 'create',
        entity: 'transaction',
        data: { id: '123' },
      });
      const after = Date.now();

      const queued = getFromLocalStorage('budget_tracker_offline_changes');
      expect(queued[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(queued[0].timestamp).toBeLessThanOrEqual(after);
    });

    it('should add ID if not present', () => {
      queueOfflineChange({
        type: 'create',
        entity: 'transaction',
        data: { amount: 100 },
      });

      const queued = getFromLocalStorage('budget_tracker_offline_changes');
      expect(queued[0].id).toBeTruthy();
    });

    it('should preserve existing ID if present', () => {
      queueOfflineChange({
        type: 'create',
        entity: 'transaction',
        data: { id: 'existing-id', amount: 100 },
      });

      const queued = getFromLocalStorage('budget_tracker_offline_changes');
      expect(queued[0].id).toBe('existing-id');
    });
  });

  describe('isOnline', () => {
    it('should return true when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOnline()).toBe(true);
    });

    it('should return false when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOnline()).toBe(false);
    });
  });
});
