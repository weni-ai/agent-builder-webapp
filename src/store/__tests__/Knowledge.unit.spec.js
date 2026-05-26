import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useKnowledgeStore } from '@/store/Knowledge';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    knowledge: {
      texts: {
        list: vi.fn(),
        read: vi.fn(),
      },
    },
  },
}));

const buildItem = ({ uuid, last_updated_at, title = `Title ${uuid}` }) => ({
  uuid,
  title,
  text: `Text body of ${uuid}`,
  last_updated_at,
});

describe('Knowledge Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    store = useKnowledgeStore();
  });

  describe('initial state', () => {
    it('starts with empty contentTexts data, no status, no cursor and no search term', () => {
      expect(store.contentTexts).toEqual({
        data: [],
        status: null,
        next: null,
        searchTerm: '',
      });
    });
  });

  describe('loadContentTexts', () => {
    it('loads the first page, orders by last_updated_at desc and stores the next cursor', async () => {
      nexusaiAPI.knowledge.texts.list.mockResolvedValue({
        data: {
          results: [
            buildItem({ uuid: '1', last_updated_at: '2024-01-01T00:00:00Z' }),
            buildItem({ uuid: '2', last_updated_at: '2024-03-01T00:00:00Z' }),
            buildItem({ uuid: '3', last_updated_at: '2024-02-01T00:00:00Z' }),
          ],
          next: 'http://nexus.example.com/?cursor=abc',
        },
      });

      await store.loadContentTexts();

      expect(nexusaiAPI.knowledge.texts.list).toHaveBeenCalledTimes(1);
      expect(nexusaiAPI.knowledge.texts.list).toHaveBeenCalledWith();

      expect(store.contentTexts.status).toBe('complete');
      expect(store.contentTexts.next).toBe(
        'http://nexus.example.com/?cursor=abc',
      );
      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        '2',
        '3',
        '1',
      ]);
    });

    it('sets status to loading while the request is pending', () => {
      let resolveRequest;
      nexusaiAPI.knowledge.texts.list.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      store.loadContentTexts();

      expect(store.contentTexts.status).toBe('loading');

      resolveRequest({ data: { results: [], next: null } });
    });

    it('marks status as error and clears data when the request fails', async () => {
      nexusaiAPI.knowledge.texts.list.mockRejectedValue(new Error('boom'));

      await store.loadContentTexts();

      expect(store.contentTexts.status).toBe('error');
      expect(store.contentTexts.data).toEqual([]);
      expect(store.contentTexts.next).toBeNull();
    });

    it('accepts a response without results and produces an empty list', async () => {
      nexusaiAPI.knowledge.texts.list.mockResolvedValue({ data: {} });

      await store.loadContentTexts();

      expect(store.contentTexts.status).toBe('complete');
      expect(store.contentTexts.data).toEqual([]);
      expect(store.contentTexts.next).toBeNull();
    });
  });

  describe('loadNextContentTexts', () => {
    beforeEach(async () => {
      nexusaiAPI.knowledge.texts.list.mockResolvedValueOnce({
        data: {
          results: [
            buildItem({ uuid: '1', last_updated_at: '2024-03-01T00:00:00Z' }),
            buildItem({ uuid: '2', last_updated_at: '2024-02-01T00:00:00Z' }),
          ],
          next: 'http://nexus.example.com/?cursor=page-2',
        },
      });

      await store.loadContentTexts();
      nexusaiAPI.knowledge.texts.list.mockClear();
    });

    it('forwards the stored next cursor to the API and appends results ordered by last_updated_at', async () => {
      nexusaiAPI.knowledge.texts.list.mockResolvedValueOnce({
        data: {
          results: [
            buildItem({ uuid: '3', last_updated_at: '2024-05-01T00:00:00Z' }),
            buildItem({ uuid: '4', last_updated_at: '2024-01-15T00:00:00Z' }),
          ],
          next: null,
        },
      });

      await store.loadNextContentTexts();

      expect(nexusaiAPI.knowledge.texts.list).toHaveBeenCalledWith({
        next: 'http://nexus.example.com/?cursor=page-2',
      });

      expect(store.contentTexts.status).toBe('complete');
      expect(store.contentTexts.next).toBeNull();
      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        '3',
        '1',
        '2',
        '4',
      ]);
    });

    it('deduplicates items that come back from the next page', async () => {
      nexusaiAPI.knowledge.texts.list.mockResolvedValueOnce({
        data: {
          results: [
            buildItem({ uuid: '2', last_updated_at: '2024-02-01T00:00:00Z' }),
            buildItem({ uuid: '5', last_updated_at: '2024-04-01T00:00:00Z' }),
          ],
          next: null,
        },
      });

      await store.loadNextContentTexts();

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        '5',
        '1',
        '2',
      ]);
    });

    it('does nothing when there is no next cursor', async () => {
      store.contentTexts.next = null;

      await store.loadNextContentTexts();

      expect(nexusaiAPI.knowledge.texts.list).not.toHaveBeenCalled();
    });

    it('does nothing when another request is already loading', async () => {
      store.contentTexts.status = 'loading';

      await store.loadNextContentTexts();

      expect(nexusaiAPI.knowledge.texts.list).not.toHaveBeenCalled();
    });

    it('marks status as error when the request fails and keeps the existing data', async () => {
      nexusaiAPI.knowledge.texts.list.mockRejectedValueOnce(new Error('boom'));

      await store.loadNextContentTexts();

      expect(store.contentTexts.status).toBe('error');
      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        '1',
        '2',
      ]);
    });
  });

  describe('getContentText', () => {
    it('returns the cached item without calling the API when the uuid is already loaded', async () => {
      const cached = buildItem({
        uuid: 'cached-uuid',
        last_updated_at: '2024-04-01T00:00:00Z',
      });
      store.contentTexts.data = [cached];

      const result = await store.getContentText('cached-uuid');

      expect(result).toEqual(cached);
      expect(nexusaiAPI.knowledge.texts.read).not.toHaveBeenCalled();
      expect(store.contentTexts.data).toHaveLength(1);
    });

    it('fetches the item from the API when it is not cached and inserts it into data ordered by last_updated_at', async () => {
      store.contentTexts.data = [
        buildItem({ uuid: '1', last_updated_at: '2024-01-01T00:00:00Z' }),
        buildItem({ uuid: '2', last_updated_at: '2024-05-01T00:00:00Z' }),
      ];

      const fetched = buildItem({
        uuid: '3',
        last_updated_at: '2024-03-01T00:00:00Z',
      });
      nexusaiAPI.knowledge.texts.read.mockResolvedValue({ data: fetched });

      const result = await store.getContentText('3');

      expect(nexusaiAPI.knowledge.texts.read).toHaveBeenCalledWith({
        uuid: '3',
      });
      expect(result).toEqual(fetched);
      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        '2',
        '3',
        '1',
      ]);
    });

    it('propagates the error when the read request fails', async () => {
      nexusaiAPI.knowledge.texts.read.mockRejectedValue(new Error('boom'));

      await expect(store.getContentText('missing-uuid')).rejects.toThrow(
        'boom',
      );
      expect(store.contentTexts.data).toEqual([]);
    });
  });
});
