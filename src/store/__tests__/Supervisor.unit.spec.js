import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSupervisorStore } from '../Supervisor';
import { useAlertStore } from '../Alert';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      supervisor: {
        conversations: {
          list: vi.fn(),
          getById: vi.fn(),
          export: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {
      start: '2023-01-01',
      end: '2023-01-31',
      search: '',
      status: '',
      csat: '',
      topics: '',
    },
  }),
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: {
    global: {
      t: vi.fn((key) => key),
    },
  },
}));

describe('Supervisor Store', () => {
  let store;
  let alertStore;

  beforeEach(() => {
    setActivePinia(createPinia());

    vi.clearAllMocks();

    store = useSupervisorStore();
    alertStore = useAlertStore();

    vi.spyOn(alertStore, 'add').mockImplementation(() => {});

    store.filters.start = '2023-01-01';
    store.filters.end = '2023-01-31';
  });

  describe('Initial state', () => {
    it('has the correct initial state for conversations', () => {
      expect(store.conversations).toEqual({
        status: null,
        data: {
          results: [],
        },
      });
    });

    it('has the correct initial state for selectedConversation', () => {
      expect(store.selectedConversation).toBeNull();
    });

    it('has the correct initial state for filters', () => {
      expect(store.filters).toEqual({
        start: '2023-01-01',
        end: '2023-01-31',
        search: '',
        status: [],
        csat: [],
        topics: [],
      });
    });
  });

  describe('Actions', () => {
    describe('loadConversations', () => {
      it('sets status to loading when started', async () => {
        nexusaiAPI.agent_builder.supervisor.conversations.list.mockReturnValue(
          new Promise(() => {}),
        );

        store.loadConversations();

        expect(store.conversations.status).toBe('loading');
      });

      it('fetches conversations successfully with default page', async () => {
        const mockApiResponse = {
          results: [
            { id: 1, title: 'Conversation 1' },
            { id: 2, title: 'Conversation 2' },
          ],
        };

        nexusaiAPI.agent_builder.supervisor.conversations.list.mockResolvedValue(
          mockApiResponse,
        );

        await store.loadConversations();

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.list,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          signal: expect.any(AbortSignal),
          hideGenericErrorAlert: true,
          filters: {
            page: 1,
            start: '01-01-2023',
            end: '31-01-2023',
            search: '',
            status: [],
            csat: [],
            topics: [],
          },
        });

        expect(store.conversations.status).toBe('complete');
        expect(store.conversations.data).toEqual({
          ...mockApiResponse,
          count: 2,
          results: mockApiResponse.results,
        });
      });

      it('fetches conversations with custom page number', async () => {
        const mockApiResponse = [
          { id: 3, title: 'Conversation 3' },
          { id: 4, title: 'Conversation 4' },
        ];

        nexusaiAPI.agent_builder.supervisor.conversations.list.mockResolvedValue(
          mockApiResponse,
        );

        await store.loadConversations(2);

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.list,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          signal: expect.any(AbortSignal),
          hideGenericErrorAlert: true,
          filters: {
            page: 2,
            start: '01-01-2023',
            end: '31-01-2023',
            search: '',
            status: [],
            csat: [],
            topics: [],
          },
        });
      });

      it('applies filters when fetching conversations', async () => {
        store.filters.search = 'test search';
        store.filters.status = 'test status';
        store.filters.csat = 'test csat';
        store.filters.topics = 'test topics';

        nexusaiAPI.agent_builder.supervisor.conversations.list.mockResolvedValue(
          [],
        );

        await store.loadConversations();

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.list,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          signal: expect.any(AbortSignal),
          hideGenericErrorAlert: true,
          filters: {
            page: 1,
            start: '01-01-2023',
            end: '31-01-2023',
            search: 'test search',
            status: 'test status',
            csat: 'test csat',
            topics: 'test topics',
          },
        });
      });

      it('handles errors when fetching conversations', async () => {
        nexusaiAPI.agent_builder.supervisor.conversations.list.mockRejectedValue(
          new Error('API Error'),
        );

        await store.loadConversations();

        expect(store.conversations.status).toBe('error');
        expect(store.conversations.data).toEqual({
          results: [],
        });
      });
    });

    describe('selectConversation', () => {
      beforeEach(() => {
        store.conversations.data = {
          results: [
            { id: 1, title: 'Conversation 1', urn: 'urn:1' },
            { id: 2, title: 'Conversation 2', urn: 'urn:2' },
          ],
        };
      });

      it('selects a conversation by ID', async () => {
        store.selectConversation(1);

        expect(store.selectedConversation).toEqual({
          data: {
            status: null,
          },
        });
      });

      it('clears selection when no ID provided', () => {
        store.selectedConversation = { id: 1 };
        store.selectConversation(null);

        expect(store.selectedConversation).toBeNull();
      });

      it('clears selection when undefined ID provided', () => {
        store.selectedConversation = { id: 1 };
        store.selectConversation(undefined);

        expect(store.selectedConversation).toBeNull();
      });

      it('handles non-existent conversation ID gracefully', () => {
        store.selectConversation(999);

        expect(store.selectedConversation).toEqual({
          ...undefined,
          data: {
            status: null,
          },
        });
      });
    });

    describe('loadSelectedConversationData', () => {
      beforeEach(() => {
        store.selectedConversation = {
          id: 1,
          created_on: '2023-01-01',
          urn: 'urn:test',
          start: '2023-01-01',
          end: '2023-01-31',
          data: {
            status: null,
            results: [],
          },
        };
      });

      it('returns early when no conversation is selected', async () => {
        store.selectedConversation = null;

        await store.loadSelectedConversationData();

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.getById,
        ).not.toHaveBeenCalled();
      });

      it('returns early when conversation data is already loading', async () => {
        store.selectedConversation.data.status = 'loading';

        await store.loadSelectedConversationData();

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.getById,
        ).not.toHaveBeenCalled();
      });

      it('returns early when next=true but no next page available', async () => {
        store.selectedConversation.data.next = null;

        await store.loadSelectedConversationData({ next: true });

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.getById,
        ).not.toHaveBeenCalled();
      });

      it('loads conversation data successfully (initial load)', async () => {
        const mockResponse = {
          results: [
            { id: 'msg1', text: 'Hello' },
            { id: 'msg2', text: 'Hi there' },
          ],
          next: 'next-token',
          count: 10,
        };

        nexusaiAPI.agent_builder.supervisor.conversations.getById.mockResolvedValue(
          mockResponse,
        );

        await store.loadSelectedConversationData();

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.getById,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          start: '2023-01-01',
          end: '2023-01-31',
          urn: 'urn:test',
          next: null,
        });

        expect(store.selectedConversation.data).toEqual({
          ...mockResponse,
          status: 'complete',
        });
      });

      it('loads conversation data successfully (next page)', async () => {
        store.selectedConversation.data = {
          status: null,
          results: [{ id: 'existing', text: 'Existing message' }],
          next: 'existing-token',
        };

        const mockResponse = {
          results: [
            { id: 'new1', text: 'New message 1' },
            { id: 'new2', text: 'New message 2' },
          ],
          next: 'new-token',
          count: 15,
        };

        nexusaiAPI.agent_builder.supervisor.conversations.getById.mockResolvedValue(
          mockResponse,
        );

        await store.loadSelectedConversationData({ next: true });

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.getById,
        ).toHaveBeenCalledWith({
          projectUuid: 'test-project-uuid',
          start: '2023-01-01',
          end: '2023-01-31',
          urn: 'urn:test',
          next: 'existing-token',
        });

        expect(store.selectedConversation.data.results).toEqual([
          { id: 'new1', text: 'New message 1' },
          { id: 'new2', text: 'New message 2' },
          { id: 'existing', text: 'Existing message' },
        ]);
        expect(store.selectedConversation.data.next).toBe('new-token');
        expect(store.selectedConversation.data.status).toBe('complete');
      });

      it('handles errors when loading conversation data', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        nexusaiAPI.agent_builder.supervisor.conversations.getById.mockRejectedValue(
          new Error('API Error'),
        );

        await store.loadSelectedConversationData();

        expect(store.selectedConversation.data.status).toBe('error');
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error loading conversation data:',
          expect.any(Error),
        );

        consoleErrorSpy.mockRestore();
      });

      it('handles errors gracefully when selectedConversation is null during error', async () => {
        const consoleErrorSpy = vi
          .spyOn(console, 'error')
          .mockImplementation(() => {});

        nexusaiAPI.agent_builder.supervisor.conversations.getById.mockImplementation(
          () => {
            store.selectedConversation = null;
            throw new Error('API Error');
          },
        );

        await store.loadSelectedConversationData();

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      });
    });

    describe('exportSupervisorData', () => {
      it('exports data successfully', async () => {
        nexusaiAPI.agent_builder.supervisor.conversations.export.mockResolvedValue();

        await store.exportSupervisorData({ token: 'test-token' });

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.export,
        ).toHaveBeenCalledWith({
          hideGenericErrorAlert: true,
          projectUuid: 'test-project-uuid',
          token: 'test-token',
        });

        expect(alertStore.add).toHaveBeenCalledWith({
          type: 'success',
          text: 'agent_builder.supervisor.export.success',
        });
      });

      it('handles export errors', async () => {
        nexusaiAPI.agent_builder.supervisor.conversations.export.mockRejectedValue(
          new Error('Export failed'),
        );

        await store.exportSupervisorData({ token: 'test-token' });

        expect(alertStore.add).toHaveBeenCalledWith({
          type: 'error',
          text: 'agent_builder.supervisor.export.error',
        });
      });

      it('works without token parameter', async () => {
        nexusaiAPI.agent_builder.supervisor.conversations.export.mockResolvedValue();

        await store.exportSupervisorData({});

        expect(
          nexusaiAPI.agent_builder.supervisor.conversations.export,
        ).toHaveBeenCalledWith({
          hideGenericErrorAlert: true,
          projectUuid: 'test-project-uuid',
          token: undefined,
        });
      });
    });
  });

  describe('Reactive State Management', () => {
    it('filters are reactive and maintain state', () => {
      expect(store.filters.start).toBe('2023-01-01');
      expect(store.filters.end).toBe('2023-01-31');

      store.filters.search = 'new search';
      store.filters.status = 'new status';
      store.filters.csat = 'new csat';
      store.filters.topics = 'new topics';

      expect(store.filters.search).toBe('new search');
      expect(store.filters.status).toBe('new status');
      expect(store.filters.csat).toBe('new csat');
      expect(store.filters.topics).toBe('new topics');
    });

    it('conversations maintains reactive state', () => {
      const testData = [{ id: 1, title: 'Test' }];

      store.conversations.data = testData;
      store.conversations.status = 'complete';

      expect(store.conversations.data).toEqual(testData);
      expect(store.conversations.status).toBe('complete');
    });

    it('selectedConversation maintains reactive state', () => {
      const conversation = { id: 1, title: 'Test Conversation' };

      store.selectedConversation = conversation;

      expect(store.selectedConversation).toEqual(conversation);

      store.selectedConversation = null;

      expect(store.selectedConversation).toBeNull();
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly in loadConversations', async () => {
      store.filters.start = '2023-06-15';
      store.filters.end = '2023-06-30';

      nexusaiAPI.agent_builder.supervisor.conversations.list.mockResolvedValue(
        [],
      );

      await store.loadConversations();

      expect(
        nexusaiAPI.agent_builder.supervisor.conversations.list,
      ).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        signal: expect.any(AbortSignal),
        hideGenericErrorAlert: true,
        filters: {
          page: 1,
          start: '15-06-2023',
          end: '30-06-2023',
          search: '',
          status: [],
          csat: [],
          topics: [],
        },
      });
    });
  });
});
