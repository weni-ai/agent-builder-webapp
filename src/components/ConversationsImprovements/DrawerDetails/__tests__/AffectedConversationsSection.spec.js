import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import i18n from '@/utils/plugins/i18n';
import { useImprovementsStore } from '@/store/Improvements';
import { useSupervisorStore } from '@/store/Supervisor';

import AffectedConversationsSection from '../AffectedConversationsSection.vue';

const mockReplace = vi.fn().mockResolvedValue(undefined);

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    ...actual,
    useRouter: () => ({
      replace: mockReplace,
    }),
    useRoute: () => ({
      query: {},
    }),
  };
});

describe('AffectedConversationsSection.vue', () => {
  let wrapper;
  let improvementsStore;
  let supervisorStore;

  const baseConversation = {
    uuid: 'conversation-uuid-1',
    contactUrn: 'whatsapp:5511999999999',
    contactName: 'Alessandra',
    messages: [
      {
        uuid: 'message-uuid-1',
        id: '1',
        text: 'Hello',
        source: 'incoming',
        createdAt: '2026-06-23T09:44:26-03:00',
      },
    ],
  };

  const createWrapper = (props = {}) => {
    const pinia = createTestingPinia({
      stubActions: true,
    });

    improvementsStore = useImprovementsStore(pinia);
    supervisorStore = useSupervisorStore(pinia);

    vi.spyOn(improvementsStore, 'fetchAffectedConversations');
    vi.spyOn(improvementsStore, 'resetAffectedConversations');

    wrapper = mount(AffectedConversationsSection, {
      props: {
        open: true,
        improvementUuid: 'improvement-uuid-1',
        ...props,
      },
      global: {
        plugins: [pinia],
        stubs: {
          AffectedConversationItem: {
            template:
              '<div data-testid="affected-conversation-item-stub" :data-uuid="conversation.uuid" @click="$emit(\'view-full\')" />',
            props: ['conversation', 'isExpanded', 'isFirst', 'isLast'],
            emits: ['toggle', 'view-full'],
          },
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  const elements = {
    section: () =>
      wrapper.find(
        '[data-testid="improvement-drawer-affected-conversations-section"]',
      ),
    title: () =>
      wrapper.find(
        '[data-testid="improvement-drawer-affected-conversations-title"]',
      ),
    skeletons: () =>
      wrapper.findAll('[data-testid^="affected-conversations-skeleton-"]'),
    list: () => wrapper.find('[data-testid="affected-conversations-list"]'),
    items: () =>
      wrapper.findAll('[data-testid="affected-conversation-item-stub"]'),
    pagination: () =>
      wrapper.find('[data-testid="affected-conversations-pagination"]'),
  };

  it('renders the section title', () => {
    createWrapper();

    expect(elements.section().exists()).toBe(true);
    expect(elements.title().text()).toBe(
      i18n.global.t('audit.improvements.drawer.affected_conversations_title'),
    );
  });

  it('fetches affected conversations when the drawer opens', async () => {
    createWrapper();

    await nextTick();

    expect(improvementsStore.fetchAffectedConversations).toHaveBeenCalledWith(
      'improvement-uuid-1',
      1,
    );
  });

  it('resets affected conversations when the drawer closes', async () => {
    createWrapper();

    await wrapper.setProps({ open: false });
    await nextTick();

    expect(improvementsStore.resetAffectedConversations).toHaveBeenCalled();
  });

  it('renders loading skeletons while fetching', async () => {
    createWrapper();

    improvementsStore.affectedConversations.status = 'loading';
    await nextTick();

    expect(elements.skeletons()).toHaveLength(3);
  });

  it('renders the conversation list when status is error', async () => {
    createWrapper();

    improvementsStore.affectedConversations.status = 'error';
    await nextTick();

    expect(elements.list().exists()).toBe(true);
  });

  it('renders an empty conversation list when there are no conversations', async () => {
    createWrapper();

    improvementsStore.affectedConversations.status = 'complete';
    improvementsStore.affectedConversations.data = {
      count: 0,
      results: [],
    };
    await nextTick();

    expect(elements.list().exists()).toBe(true);
    expect(elements.items()).toHaveLength(0);
  });

  it('renders the conversation list and pagination when data is available', async () => {
    createWrapper();

    improvementsStore.affectedConversations.status = 'complete';
    improvementsStore.affectedConversations.page = 1;
    improvementsStore.affectedConversations.data = {
      count: 25,
      results: [baseConversation],
    };
    await nextTick();

    expect(elements.list().exists()).toBe(true);
    expect(elements.items()).toHaveLength(1);
    expect(elements.pagination().exists()).toBe(true);
  });

  it('fetches the selected page when pagination changes', async () => {
    createWrapper();

    improvementsStore.affectedConversations.status = 'complete';
    improvementsStore.affectedConversations.page = 1;
    improvementsStore.affectedConversations.data = {
      count: 25,
      results: [baseConversation],
    };
    await nextTick();

    const paginationComponent = wrapper.findComponent(
      '[data-testid="affected-conversations-pagination"]',
    );

    expect(paginationComponent.props('max')).toBe(3);
    expect(paginationComponent.props('modelValue')).toBe(1);

    vi.mocked(improvementsStore.fetchAffectedConversations).mockClear();

    await paginationComponent.vm.$emit('update:model-value', 2);
    await nextTick();

    expect(improvementsStore.fetchAffectedConversations).toHaveBeenCalledWith(
      'improvement-uuid-1',
      2,
    );
  });

  it('navigates to conversations and closes the drawer on view full', async () => {
    createWrapper();

    improvementsStore.affectedConversations.status = 'complete';
    improvementsStore.affectedConversations.data = {
      count: 1,
      results: [baseConversation],
    };
    await nextTick();

    await elements.items()[0].trigger('click');
    await nextTick();

    expect(supervisorStore.selectedConversation).toEqual({
      uuid: 'conversation-uuid-1',
      urn: 'whatsapp:5511999999999',
      username: 'Alessandra',
      source: 'v2',
      data: { status: null },
    });
    expect(supervisorStore.queryConversationUuid).toBe('conversation-uuid-1');
    expect(mockReplace).toHaveBeenCalledWith({
      name: 'conversations',
      query: {},
    });
    expect(wrapper.emitted('close-drawer')).toEqual([[]]);
  });
});
