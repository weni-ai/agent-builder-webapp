import { flushPromises, mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useSupervisorStore } from '@/store/Supervisor';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import ConversationsTable from '../index.vue';
import ConversationRow from '../ConversationRow.vue';
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
                start: '2023-05-15T14:30:00Z',
                last_message: 'This is the last message',
                human_support: false,
              },
              {
                uuid: '2',
                urn: 'conversation-456',
                start: '2023-05-16T10:00:00Z',
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
    start: '2023-05-15T14:30:00Z',
    source: NEW_SOURCE,
  },
  {
    uuid: '2',
    urn: 'conversation-456',
    last_message: 'Another message',
    start: '2023-05-16T10:00:00Z',
    source: NEW_SOURCE,
  },
];

describe('ConversationsTable.vue', () => {
  let wrapper;
  let supervisorStore;

  const pinia = createTestingPinia({
    stubActions: false,
  });

  const setConversations = (results) => {
    supervisorStore.conversations.data.results = [...results];
    supervisorStore.conversations.data.count = results.length;
    supervisorStore.conversations.data.newNext = null;
    supervisorStore.conversations.data.legacyNext = null;
    supervisorStore.conversations.status = 'complete';
  };

  const createWrapper = async () => {
    supervisorStore = useSupervisorStore();
    supervisorStore.filters.start = '2023-01-01';
    supervisorStore.filters.end = '2023-01-31';
    setConversations(mockResultsWithSource);

    wrapper = mount(ConversationsTable, {
      global: {
        plugins: [pinia],
      },
    });

    await flushPromises();
    setConversations(mockResultsWithSource);
    await nextTick();
  };

  const elements = {
    table: () => wrapper.find('[data-testid="conversations-table"]'),
    emptyState: () => wrapper.find('[data-testid="conversations-table-empty"]'),
    conversationRows: () => wrapper.findAll('[data-testid="conversation-row"]'),
    conversationRowComponents: () => wrapper.findAllComponents(ConversationRow),
    columnHeader: (column) =>
      wrapper.find(`[data-testid="conversation-table-head-${column}"]`),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('renders the table with conversation rows', () => {
    expect(elements.table().exists()).toBe(true);
    expect(elements.conversationRows()).toHaveLength(2);
  });

  it('renders the column headers', () => {
    expect(elements.columnHeader('contact').text()).toBe('Contact');
    expect(elements.columnHeader('status').text()).toBe('Status');
    expect(elements.columnHeader('feedback').text()).toBe('Feedback');
    expect(elements.columnHeader('date').text()).toBe('Date');
    expect(elements.columnHeader('hour').text()).toBe('Hour');
  });

  it('loads conversations on mount', () => {
    expect(supervisorStore.loadConversations).toHaveBeenCalled();
  });

  it('passes correct props to ConversationRow component', () => {
    const conversationRow = elements.conversationRowComponents()[0];

    expect(conversationRow.props('conversation').uuid).toBe('1');
    expect(conversationRow.props('conversation').last_message).toBe(
      'This is the last message',
    );
    expect(conversationRow.props('isSelected')).toBe(false);
  });

  it('selects the conversation when a row is clicked', async () => {
    const conversationRow = elements.conversationRowComponents()[0];

    await conversationRow.trigger('click');

    expect(supervisorStore.selectedConversation).toMatchObject({
      uuid: '1',
    });
  });

  it('renders the empty state when there are no conversations', async () => {
    setConversations([]);
    await nextTick();

    expect(elements.emptyState().exists()).toBe(true);
    expect(elements.conversationRows()).toHaveLength(0);
  });
});
