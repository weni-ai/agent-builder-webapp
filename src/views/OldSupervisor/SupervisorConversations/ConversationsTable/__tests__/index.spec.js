import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useOldSupervisorStore } from '@/store/OldSupervisor';
import { vi } from 'vitest';

import ConversationsTable from '@/views/OldSupervisor/SupervisorConversations/ConversationsTable/index.vue';
import ConversationInfos from '@/views/OldSupervisor/SupervisorConversations/ConversationsTable/ConversationInfos.vue';
import ConversationDate from '@/views/OldSupervisor/SupervisorConversations/ConversationsTable/ConversationDate.vue';
import Unnnic from '@weni/unnnic-system';

vi.mock('@/api/nexus/OldSupervisor', () => ({
  default: {
    conversations: {
      list: vi.fn().mockResolvedValue({
        results: [
          {
            id: '1',
            urn: 'conversation-123',
            created_on: '2023-05-15T14:30:00Z',
            last_message: 'This is the last message',
            human_support: false,
          },
          {
            id: '2',
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

describe('ConversationsTable.vue', () => {
  let wrapper;
  let supervisorStore;

  const pinia = createTestingPinia({
    initialState: {
      supervisor: {
        conversations: {
          data: null,
          status: null,
        },
        filters: {},
      },
    },
    stubActions: false,
  });

  const table = () =>
    wrapper.findComponent('[data-testid="conversations-table"]');

  beforeEach(() => {
    vi.clearAllMocks();

    supervisorStore = useOldSupervisorStore();

    supervisorStore.filters.start = '2023-01-01';
    supervisorStore.filters.end = '2023-01-31';

    wrapper = shallowMount(ConversationsTable, {
      global: {
        plugins: [pinia],
      },
    });
  });

  it('renders the component correctly', () => {
    expect(table().exists()).toBe(true);
  });

  it('loads conversations on mount', () => {
    expect(wrapper.vm.supervisorStore.loadConversations).toHaveBeenCalled();
  });

  it('correctly computes table rows from conversation data', () => {
    const tableRows = wrapper.vm.table.rows;

    expect(tableRows.length).toBe(2);
    expect(tableRows[0].id).toBe('1');
    expect(tableRows[1].id).toBe('2');
  });

  it('passes correct props to ConversationInfos component', () => {
    const tableRows = wrapper.vm.table.rows;
    const infoComponent = tableRows[0].content[0];

    expect(infoComponent.component).toBe(ConversationInfos);
    expect(infoComponent.props.urn).toBe('conversation-123');
    expect(infoComponent.props.lastMessage).toBe('This is the last message');
  });

  it('passes correct props to ConversationDate component', () => {
    const tableRows = wrapper.vm.table.rows;
    const dateComponent = tableRows[0].content[2];

    expect(dateComponent.component).toBe(ConversationDate);
    expect(dateComponent.props.date).toBe('2023-05-15T14:30:00Z');
  });

  it('configures tag correctly based on human_support', () => {
    const tableRows = wrapper.vm.table.rows;

    const noSupportTag = tableRows[0].content[1];
    expect(noSupportTag.component).toBe(Unnnic.unnnicTag);
    expect(noSupportTag.props.scheme).toBe('aux-green-500');
    expect(noSupportTag.props.leftIcon).toBe('check');
    expect(noSupportTag.props.text).toBe(
      wrapper.vm.$t('agent_builder.supervisor.attended_by_agent.title'),
    );

    const withSupportTag = tableRows[1].content[1];
    expect(withSupportTag.component).toBe(Unnnic.unnnicTag);
    expect(withSupportTag.props.scheme).toBe('aux-blue-500');
    expect(withSupportTag.props.leftIcon).toBe('forward');
    expect(withSupportTag.props.text).toBe(
      wrapper.vm.$t('agent_builder.supervisor.forwarded_human_support.title'),
    );
  });

  it('correctly sets pagination values', () => {
    expect(wrapper.vm.pagination.interval).toBe(15);
    expect(wrapper.vm.pagination.page).toBe(1);
  });
});
