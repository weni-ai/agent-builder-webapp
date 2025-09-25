import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useRouter } from 'vue-router';

import Supervisor from '@/views/Supervisor/index.vue';
import { useSupervisorStore } from '@/store/Supervisor';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    query: {
      started_day: '2024-01-01',
      ended_day: '2024-01-31',
    },
  })),
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
  })),
}));

describe('Supervisor view', () => {
  let wrapper;
  let supervisorStore;

  beforeEach(() => {
    const pinia = createPinia();
    setActivePinia(pinia);

    supervisorStore = useSupervisorStore();

    useRouter();

    wrapper = shallowMount(Supervisor, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('matches snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders SupervisorHeader component', () => {
    expect(wrapper.findComponent('[data-testid="header"]').exists()).toBe(true);
  });

  it('renders SupervisorConversations component', () => {
    expect(
      wrapper
        .findComponent('[data-testid="supervisor-conversations"]')
        .exists(),
    ).toBe(true);
  });

  it('renders Conversation component when selectedConversation is present', async () => {
    expect(
      wrapper.findComponent('[data-testid="supervisor-conversation"]').exists(),
    ).toBe(false);

    supervisorStore.selectedConversation = {
      id: 1,
      title: 'Test Conversation',
    };

    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).toContain('supervisor--with-conversation');
    expect(
      wrapper.findComponent('[data-testid="supervisor-conversation"]').exists(),
    ).toBe(true);
  });
});
