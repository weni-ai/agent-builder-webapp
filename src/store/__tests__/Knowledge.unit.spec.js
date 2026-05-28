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
        patch: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
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

    it('orders by the most recent activity, falling back to created_at when the item was never edited', async () => {
      nexusaiAPI.knowledge.texts.list.mockResolvedValue({
        data: {
          results: [
            {
              uuid: 'edited-older',
              title: 'Edited but older',
              created_at: '2024-01-01T00:00:00Z',
              last_updated_at: '2024-02-01T00:00:00Z',
            },
            {
              uuid: 'created-newer',
              title: 'Just created and newer',
              created_at: '2024-04-01T00:00:00Z',
            },
            {
              uuid: 'edited-newest',
              title: 'Edited and newest',
              created_at: '2024-03-01T00:00:00Z',
              last_updated_at: '2024-05-01T00:00:00Z',
            },
          ],
          next: null,
        },
      });

      await store.loadContentTexts();

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        'edited-newest',
        'created-newer',
        'edited-older',
      ]);
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

    it('fetches from the API when the cached item came from the list endpoint and has no text body', async () => {
      store.contentTexts.data = [
        {
          uuid: 'partial-uuid',
          title: 'From list',
          last_updated_at: '2024-04-01T00:00:00Z',
        },
      ];

      nexusaiAPI.knowledge.texts.read.mockResolvedValue({
        data: {
          uuid: 'partial-uuid',
          title: 'From list',
          text: 'Hydrated body',
          last_updated_at: '2024-04-01T00:00:00Z',
        },
      });

      const result = await store.getContentText('partial-uuid');

      expect(nexusaiAPI.knowledge.texts.read).toHaveBeenCalledWith({
        uuid: 'partial-uuid',
      });
      expect(result.text).toBe('Hydrated body');

      const cached = store.contentTexts.data.find(
        ({ uuid }) => uuid === 'partial-uuid',
      );
      expect(cached.text).toBe('Hydrated body');
    });

    it('propagates the error when the read request fails', async () => {
      nexusaiAPI.knowledge.texts.read.mockRejectedValue(new Error('boom'));

      await expect(store.getContentText('missing-uuid')).rejects.toThrow(
        'boom',
      );
      expect(store.contentTexts.data).toEqual([]);
    });
  });

  describe('patchContentText', () => {
    beforeEach(() => {
      store.contentTexts.data = [
        buildItem({
          uuid: 'text-1',
          title: 'Original title',
          last_updated_at: '2024-01-01T00:00:00Z',
        }),
        buildItem({
          uuid: 'text-2',
          title: 'Other title',
          last_updated_at: '2024-03-01T00:00:00Z',
        }),
      ];
    });

    it('forwards only the title in the payload to the API', async () => {
      nexusaiAPI.knowledge.texts.patch.mockResolvedValue({
        data: {
          uuid: 'text-1',
          title: 'Renamed',
          text: 'Text body of text-1',
          last_updated_at: '2024-02-01T00:00:00Z',
        },
      });

      await store.patchContentText('text-1', { title: 'Renamed' });

      expect(nexusaiAPI.knowledge.texts.patch).toHaveBeenCalledTimes(1);
      expect(nexusaiAPI.knowledge.texts.patch).toHaveBeenCalledWith({
        uuid: 'text-1',
        payload: { title: 'Renamed' },
      });

      const payload = nexusaiAPI.knowledge.texts.patch.mock.calls[0][0].payload;
      expect(payload).not.toHaveProperty('text');
    });

    it('updates only the title locally without overwriting the cached text body', async () => {
      nexusaiAPI.knowledge.texts.patch.mockResolvedValue({
        data: {
          uuid: 'text-1',
          title: 'Renamed',
          last_updated_at: '2024-04-01T00:00:00Z',
        },
      });

      await store.patchContentText('text-1', { title: 'Renamed' });

      const updated = store.contentTexts.data.find(
        ({ uuid }) => uuid === 'text-1',
      );

      expect(updated.title).toBe('Renamed');
      expect(updated.text).toBe('Text body of text-1');
      expect(updated.last_updated_at).toBe('2024-04-01T00:00:00Z');
    });

    it('reorders the list by last_updated_at after a successful patch', async () => {
      nexusaiAPI.knowledge.texts.patch.mockResolvedValue({
        data: {
          uuid: 'text-1',
          title: 'Renamed',
          last_updated_at: '2024-05-01T00:00:00Z',
        },
      });

      await store.patchContentText('text-1', { title: 'Renamed' });

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        'text-1',
        'text-2',
      ]);
    });

    it('returns the API data when the patch succeeds', async () => {
      const apiData = {
        uuid: 'text-1',
        title: 'Renamed',
        last_updated_at: '2024-04-01T00:00:00Z',
      };
      nexusaiAPI.knowledge.texts.patch.mockResolvedValue({ data: apiData });

      const result = await store.patchContentText('text-1', {
        title: 'Renamed',
      });

      expect(result).toEqual(apiData);
    });

    it('propagates the error and keeps the cached item unchanged when the patch fails', async () => {
      nexusaiAPI.knowledge.texts.patch.mockRejectedValue(new Error('boom'));

      await expect(
        store.patchContentText('text-1', { title: 'Renamed' }),
      ).rejects.toThrow('boom');

      const cached = store.contentTexts.data.find(
        ({ uuid }) => uuid === 'text-1',
      );
      expect(cached.title).toBe('Original title');
    });

    it('forwards only the text in the payload when patching the body', async () => {
      nexusaiAPI.knowledge.texts.patch.mockResolvedValue({
        data: {
          uuid: 'text-1',
          text: 'New body',
          last_updated_at: '2024-04-01T00:00:00Z',
        },
      });

      await store.patchContentText('text-1', { text: 'New body' });

      expect(nexusaiAPI.knowledge.texts.patch).toHaveBeenCalledWith({
        uuid: 'text-1',
        payload: { text: 'New body' },
      });

      const payload = nexusaiAPI.knowledge.texts.patch.mock.calls[0][0].payload;
      expect(payload).not.toHaveProperty('title');
    });

    it('updates only the text locally without overwriting the cached title', async () => {
      nexusaiAPI.knowledge.texts.patch.mockResolvedValue({
        data: {
          uuid: 'text-1',
          text: 'New body',
          last_updated_at: '2024-04-01T00:00:00Z',
        },
      });

      await store.patchContentText('text-1', { text: 'New body' });

      const updated = store.contentTexts.data.find(
        ({ uuid }) => uuid === 'text-1',
      );

      expect(updated.text).toBe('New body');
      expect(updated.title).toBe('Original title');
      expect(updated.last_updated_at).toBe('2024-04-01T00:00:00Z');
    });
  });

  describe('createContentText', () => {
    it('forwards both text and title to the create endpoint', async () => {
      nexusaiAPI.knowledge.texts.create.mockResolvedValue({
        data: buildItem({
          uuid: 'new-1',
          title: 'My title',
          last_updated_at: '2024-05-01T00:00:00Z',
        }),
      });

      await store.createContentText({
        text: 'Body text',
        title: 'My title',
      });

      expect(nexusaiAPI.knowledge.texts.create).toHaveBeenCalledTimes(1);
      expect(nexusaiAPI.knowledge.texts.create).toHaveBeenCalledWith({
        text: 'Body text',
        title: 'My title',
      });
    });

    it('inserts the newly created item at the top, ordered by last_updated_at', async () => {
      store.contentTexts.data = [
        buildItem({ uuid: '1', last_updated_at: '2024-02-01T00:00:00Z' }),
        buildItem({ uuid: '2', last_updated_at: '2024-01-01T00:00:00Z' }),
      ];

      nexusaiAPI.knowledge.texts.create.mockResolvedValue({
        data: buildItem({
          uuid: 'new-1',
          last_updated_at: '2024-06-01T00:00:00Z',
        }),
      });

      await store.createContentText({ text: 'Body' });

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        'new-1',
        '1',
        '2',
      ]);
    });

    it('returns the created item from the API response', async () => {
      const apiData = buildItem({
        uuid: 'new-1',
        last_updated_at: '2024-06-01T00:00:00Z',
      });
      nexusaiAPI.knowledge.texts.create.mockResolvedValue({ data: apiData });

      const result = await store.createContentText({ text: 'Body' });

      expect(result).toEqual(apiData);
    });

    it('propagates the error and does not mutate the list when the create fails', async () => {
      store.contentTexts.data = [
        buildItem({ uuid: '1', last_updated_at: '2024-02-01T00:00:00Z' }),
      ];

      nexusaiAPI.knowledge.texts.create.mockRejectedValue(new Error('boom'));

      await expect(store.createContentText({ text: 'Body' })).rejects.toThrow(
        'boom',
      );

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual(['1']);
    });
  });

  describe('deleteContentText', () => {
    beforeEach(() => {
      store.contentTexts.data = [
        buildItem({ uuid: 'text-1', last_updated_at: '2024-03-01T00:00:00Z' }),
        buildItem({ uuid: 'text-2', last_updated_at: '2024-02-01T00:00:00Z' }),
        buildItem({ uuid: 'text-3', last_updated_at: '2024-01-01T00:00:00Z' }),
      ];
    });

    it('forwards the uuid to the delete endpoint', async () => {
      nexusaiAPI.knowledge.texts.delete.mockResolvedValue({ data: null });

      await store.deleteContentText('text-2');

      expect(nexusaiAPI.knowledge.texts.delete).toHaveBeenCalledTimes(1);
      expect(nexusaiAPI.knowledge.texts.delete).toHaveBeenCalledWith({
        uuid: 'text-2',
      });
    });

    it('removes the item from the local list after a successful delete', async () => {
      nexusaiAPI.knowledge.texts.delete.mockResolvedValue({ data: null });

      await store.deleteContentText('text-2');

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        'text-1',
        'text-3',
      ]);
    });

    it('is a no-op on the local list when the uuid is not found', async () => {
      nexusaiAPI.knowledge.texts.delete.mockResolvedValue({ data: null });

      await store.deleteContentText('missing-uuid');

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        'text-1',
        'text-2',
        'text-3',
      ]);
    });

    it('propagates the error and keeps the item in the list when the delete fails', async () => {
      nexusaiAPI.knowledge.texts.delete.mockRejectedValue(new Error('boom'));

      await expect(store.deleteContentText('text-2')).rejects.toThrow('boom');

      expect(store.contentTexts.data.map(({ uuid }) => uuid)).toEqual([
        'text-1',
        'text-2',
        'text-3',
      ]);
    });
  });
});
