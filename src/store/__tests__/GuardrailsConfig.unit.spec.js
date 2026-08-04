import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useGuardrailsConfigStore } from '@/store/GuardrailsConfig';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'project-uuid' }),
}));

vi.mock('@/store/Alert', () => ({
  useAlertStore: () => ({
    add: vi.fn(),
  }),
}));

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      guardrails_config: {
        read: vi.fn(),
        update: vi.fn(),
      },
    },
  },
}));

const storeConfig = {
  topics: [
    { id: 'politics', enabled: true },
    { id: 'hate', enabled: false },
  ],
  blockingMessage: 'Blocked message',
  writable: true,
};

describe('GuardrailsConfig store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGuardrailsConfigStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts with empty config and null status', () => {
    expect(store.topics).toEqual([]);
    expect(store.blockingMessage).toBe('');
    expect(store.writable).toBe(false);
    expect(store.status).toBeNull();
  });

  describe('fetchConfig', () => {
    it('loads normalized config into the store', async () => {
      nexusaiAPI.router.guardrails_config.read.mockResolvedValue(storeConfig);

      await store.fetchConfig();

      expect(nexusaiAPI.router.guardrails_config.read).toHaveBeenCalledWith({
        projectUuid: 'project-uuid',
      });
      expect(store.topics).toEqual(storeConfig.topics);
      expect(store.blockingMessage).toBe('Blocked message');
      expect(store.writable).toBe(true);
      expect(store.status).toBe('success');
    });

    it('sets error status when the request fails', async () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      nexusaiAPI.router.guardrails_config.read.mockRejectedValue(
        new Error('failed'),
      );

      await expect(store.fetchConfig()).rejects.toThrow('failed');

      expect(store.status).toBe('error');
      consoleError.mockRestore();
    });
  });

  describe('updateConfig', () => {
    it('sends camelCase data and updates local state', async () => {
      nexusaiAPI.router.guardrails_config.update.mockResolvedValue({
        ...storeConfig,
        topics: [
          { id: 'politics', enabled: false },
          { id: 'hate', enabled: false },
        ],
      });

      await store.updateConfig({
        categoryStates: { politics: false },
      });

      expect(nexusaiAPI.router.guardrails_config.update).toHaveBeenCalledWith({
        projectUuid: 'project-uuid',
        data: {
          categoryStates: { politics: false },
        },
      });
      expect(store.topics).toEqual([
        { id: 'politics', enabled: false },
        { id: 'hate', enabled: false },
      ]);
      expect(store.status).toBe('success');
    });

    it('shows an error alert and rethrows when the request fails', async () => {
      const error = new Error('failed');
      nexusaiAPI.router.guardrails_config.update.mockRejectedValue(error);

      await expect(
        store.updateConfig({ categoryStates: { politics: false } }),
      ).rejects.toThrow('failed');

      expect(store.status).toBe('error');
    });
  });

  describe('buildCategoryStatesDiff', () => {
    it('returns only changed topics', () => {
      const snapshot = [
        { id: 'politics', enabled: true },
        { id: 'hate', enabled: false },
      ];
      const draft = [
        { id: 'politics', enabled: false },
        { id: 'hate', enabled: true },
      ];

      expect(store.buildCategoryStatesDiff(draft, snapshot)).toEqual({
        politics: false,
        hate: true,
      });
    });

    it('returns empty diff when nothing changed', () => {
      const topics = [
        { id: 'politics', enabled: true },
        { id: 'hate', enabled: false },
      ];

      expect(store.buildCategoryStatesDiff(topics, topics)).toEqual({});
    });
  });
});
