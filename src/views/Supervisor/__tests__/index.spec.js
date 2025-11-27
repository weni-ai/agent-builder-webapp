import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useRouter } from 'vue-router';

import Supervisor from '@/views/Supervisor/index.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRoute: vi.fn(() => ({
      query: {
        started_day: '2024-01-01',
        ended_day: '2024-01-31',
      },
    })),
    useRouter: vi.fn(() => ({
      replace: vi.fn(),
    })),
  };
});

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

  describe('Auto-load conversations without scrollbar', () => {
    let mockSpy;

    beforeEach(async () => {
      mockSpy = vi.fn();

      wrapper.vm.scrollContainer = {
        scrollHeight: 500,
        clientHeight: 800,
        scrollTop: 0,
      };

      wrapper.vm.supervisorConversations = {
        loadMoreConversations: mockSpy,
      };

      wrapper.vm.isCheckingScroll = false;

      supervisorStore.conversations = {
        status: 'complete',
        data: {
          next: 'next-page-url',
          results: [{ uuid: '1' }, { uuid: '2' }],
        },
      };
    });

    it('should call loadMoreConversations when there is no scrollbar', async () => {
      const initialCalls = mockSpy.mock.calls.length;

      await wrapper.vm.checkAndLoadMoreIfNeeded();

      expect(mockSpy).toHaveBeenCalledTimes(initialCalls + 1);
    });

    it.each([
      {
        description: 'when there is no scrollbar',
        setup: () => {
          wrapper.vm.scrollContainer.scrollHeight = 1000;
          wrapper.vm.scrollContainer.clientHeight = 800;
        },
      },
      {
        description: 'when there is no next page',
        setup: () => {
          supervisorStore.conversations.data.next = null;
        },
      },
      {
        description: 'when status is loading',
        setup: () => {
          supervisorStore.conversations.status = 'loading';
        },
      },
      {
        description: 'when status is error',
        setup: () => {
          supervisorStore.conversations.status = 'error';
        },
      },
      {
        description: 'when multiple simultaneous checks occur (debounce)',
        setup: () => {
          wrapper.vm.isCheckingScroll = true;
        },
      },
      {
        description: 'when scrollContainer is not available',
        setup: () => {
          wrapper.vm.scrollContainer = null;
        },
      },
    ])(
      'should not call loadMoreConversations $description',
      async ({ setup }) => {
        setup();

        const initialCalls = mockSpy.mock.calls.length;

        await wrapper.vm.checkAndLoadMoreIfNeeded();

        expect(mockSpy).toHaveBeenCalledTimes(initialCalls);
      },
    );

    it('should reset isCheckingScroll flag after check completes', async () => {
      expect(wrapper.vm.isCheckingScroll).toBe(false);

      const checkPromise = wrapper.vm.checkAndLoadMoreIfNeeded();
      expect(wrapper.vm.isCheckingScroll).toBe(true);

      await checkPromise;

      expect(wrapper.vm.isCheckingScroll).toBe(false);
    });
  });

  describe('Scroll-based pagination', () => {
    let mockSpy;

    beforeEach(async () => {
      mockSpy = vi.fn();

      wrapper.vm.scrollContainer = {
        scrollHeight: 1000,
        clientHeight: 800,
        scrollTop: 0,
      };

      wrapper.vm.supervisorConversations = {
        loadMoreConversations: mockSpy,
      };

      wrapper.vm.isCheckingScroll = false;

      supervisorStore.conversations = {
        status: 'complete',
        data: {
          next: 'next-page-url',
          results: [{ uuid: '1' }, { uuid: '2' }],
        },
      };
    });

    it('should call loadMoreConversations when scrolled to bottom', async () => {
      wrapper.vm.scrollContainer.scrollTop = 190;

      await wrapper.vm.loadConversations();

      expect(mockSpy).toHaveBeenCalledOnce();
    });

    it.each([
      {
        description: 'when not scrolled to bottom',
        setup: () => {
          wrapper.vm.scrollContainer.scrollTop = 100;
        },
      },
      {
        description: 'when there is no next page',
        setup: () => {
          wrapper.vm.scrollContainer.scrollTop = 190;
          supervisorStore.conversations.data.next = null;
        },
      },
      {
        description: 'when status is loading',
        setup: () => {
          wrapper.vm.scrollContainer.scrollTop = 190;
          supervisorStore.conversations.status = 'loading';
        },
      },
    ])(
      'should not call loadMoreConversations $description',
      async ({ setup }) => {
        setup();

        await wrapper.vm.loadConversations();

        expect(mockSpy).not.toHaveBeenCalled();
      },
    );
  });
});
