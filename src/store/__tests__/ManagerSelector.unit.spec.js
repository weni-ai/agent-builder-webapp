import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useManagerSelectorStore } from '@/store/ManagerSelector';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      tunings: {
        manager: {
          read: vi.fn(),
          edit: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  },
}));

describe('ManagerSelector Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useManagerSelectorStore();
    vi.clearAllMocks();
  });

  describe('newManagerAcceptsComponents', () => {
    it('returns true when accept_components is undefined', () => {
      store.options = {
        currentManager: 'manager-2.6',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: { id: 'manager-2.6', label: 'Manager 2.6' },
          legacy: null,
        },
      };

      expect(store.newManagerAcceptsComponents).toBe(true);
    });

    it('returns false when accept_components is false', () => {
      store.options = {
        currentManager: 'manager-2.7',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: {
            id: 'manager-2.7',
            label: 'Manager 2.7',
            accept_components: false,
          },
          legacy: null,
        },
      };

      expect(store.newManagerAcceptsComponents).toBe(false);
    });

    it('returns true when accept_components is true', () => {
      store.options = {
        currentManager: 'manager-2.8',
        serverTime: '2026-01-08T13:00:00Z',
        managers: {
          new: {
            id: 'manager-2.8',
            label: 'Manager 2.8',
            accept_components: true,
          },
          legacy: null,
        },
      };

      expect(store.newManagerAcceptsComponents).toBe(true);
    });
  });
});
