import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useRouter } from 'vue-router';

import Supervisor from '@/views/Supervisor/index.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';

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
  let featureFlagsStore;

  beforeEach(() => {
    const pinia = createTestingPinia();

    supervisorStore = useSupervisorStore();
    featureFlagsStore = useFeatureFlagsStore();

    vi.spyOn(featureFlagsStore, 'flags', 'get').mockReturnValue({
      supervisorExport: false,
      newSupervisor: true,
    });

    useRouter();

    wrapper = shallowMount(Supervisor, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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
