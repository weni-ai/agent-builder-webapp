import { flushPromises, shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useSupervisorStore } from '@/store/Supervisor';
import { vi } from 'vitest';
import { nextTick } from 'vue';

import ConversationsTable from '../index.vue';
import { NEW_SOURCE } from '@/api/adapters/supervisor/conversationSources';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      supervisor: {
        conversations: {
          list: vi.fn().mockResolvedValue({
            results: [
              {
                uuid: '1',
                urn: 'conversation-123',
                created_on: '2023-05-15T14:30:00Z',
                last_message: 'This is the last message',
                human_support: false,
              },
              {
                uuid: '2',
                urn: 'conversation-456',
                created_on: '2023-05-16T10:00:00Z',
                last_message: 'Another message',
                human_support: true,
              },
            ],
            count: 2,
          }),
        },
      },
    },
  },
}));

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    whenUserAttributed: () => Promise.resolve(),
  }),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {
      start: '2023-01-01',
      end: '2023-01-31',
      search: '',
      type: '',
      conversationId: '',
    },
  }),
}));

const mockResultsWithSource = [
  {
    uuid: '1',
    urn: 'conversation-123',
    last_message: 'This is the last message',
    source: NEW_SOURCE,
  },
  {
    uuid: '2',
    urn: 'conversation-456',
    last_message: 'Another message',
    source: NEW_SOURCE,
  },
];

describe('ConversationsTable.vue', () => {
  let wrapper;
  let supervisorStore;

  const pinia = createTestingPinia({
    stubActions: false,
  });

  const table = () => wrapper.find('[data-testid="conversations-table"]');

  const conversationRows = () =>
    wrapper.findAllComponents('[data-testid="conversation-row"]');

  beforeEach(async () => {
    vi.clearAllMocks();

    wrapper = shallowMount(ConversationsTable, {
      global: {
        plugins: [pinia],
      },
    });

    supervisorStore = useSupervisorStore();
    supervisorStore.filters.start = '2023-01-01';
    supervisorStore.filters.end = '2023-01-31';

    await supervisorStore.loadConversations();
    await flushPromises();

    supervisorStore.conversations.data.results = mockResultsWithSource;
    supervisorStore.conversations.data.newNext = null;
    supervisorStore.conversations.data.legacyNext = null;
    supervisorStore.conversations.status = 'complete';

    await nextTick();
  });

  it('renders the component correctly', () => {
    expect(table().exists()).toBe(true);
    expect(conversationRows()).toHaveLength(2);
  });

  it('loads conversations on mount', () => {
    expect(supervisorStore.loadConversations).toHaveBeenCalled();
  });

  it('passes correct props to ConversationRow component', () => {
    const conversationRow = conversationRows()[0];

    expect(conversationRow.props().conversation.uuid).toBe('1');
    expect(conversationRow.props().conversation.last_message).toBe(
      'This is the last message',
    );
    expect(conversationRow.props().isSelected).toBe(false);
  });

  it('correctly handles row click', async () => {
    const conversationRow = conversationRows()[0];

    await conversationRow.trigger('click');

    expect(supervisorStore.selectedConversation).toMatchObject({
      uuid: '1',
    });
  });

  describe('showDivider', () => {
    const setConversations = async (results) => {
      supervisorStore.conversations.status = 'complete';
      supervisorStore.conversations.data.results = [...results];
      supervisorStore.conversations.data.count = results.length;
      await nextTick();
    };

    it('sets showDivider for all but the last row when there is no separator', async () => {
      await setConversations([
        { uuid: '1', source: NEW_SOURCE },
        { uuid: '2', source: NEW_SOURCE },
        { uuid: '3', source: NEW_SOURCE },
      ]);

      const rows = conversationRows();
      const showDividerValues = rows.map((row) => row.props('showDivider'));

      expect(showDividerValues).toEqual([true, true, false]);
    });

    it('skips the divider on the row before the separator', async () => {
      await setConversations([
        { uuid: '1', source: NEW_SOURCE },
        { uuid: '2', source: NEW_SOURCE },
        { uuid: '3', source: 'legacy' },
        { uuid: '4', source: 'legacy' },
      ]);

      const rows = conversationRows();
      const showDividerValues = rows.map((row) => row.props('showDivider'));

      expect(showDividerValues).toEqual([true, false, true, false]);
    });
  });
});
