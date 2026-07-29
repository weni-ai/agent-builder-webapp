import { shallowMount, flushPromises } from '@vue/test-utils';
import { reactive } from 'vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { useRouter } from 'vue-router';

import Supervisor from '@/views/Supervisor/index.vue';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { useSupervisorStore } from '@/store/Supervisor';
import { moduleStorage } from '@/utils/storage';

const mockRoute = reactive({
  name: 'conversations',
  query: {
    started_day: '2024-01-01',
    ended_day: '2024-01-31',
  },
});

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');

  return {
    ...actual,
    useRoute: vi.fn(() => mockRoute),
    useRouter: vi.fn(() => ({
      replace: vi.fn(),
    })),
  };
});

vi.mock('@/utils/storage', () => ({
  moduleStorage: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
  },
}));

describe('Supervisor view', () => {
  let wrapper;
  let supervisorStore;
  let featureFlagsStore;

  const findHeader = () => wrapper.findComponent('[data-testid="header"]');
  const findConversations = () =>
    wrapper.findComponent('[data-testid="supervisor-conversations"]');
  const findConversation = () =>
    wrapper.findComponent('[data-testid="supervisor-conversation"]');
  const findRouterView = () => wrapper.findComponent({ name: 'RouterView' });
  const findIntroModal = () =>
    wrapper.findComponent('[data-testid="improvements-intro-modal"]');

  const createWrapper = ({
    conversationsImprovements = false,
    introModalSeen = null,
  } = {}) => {
    moduleStorage.getItem.mockImplementation((key) => {
      if (key === 'improvements-intro-modal-seen') {
        return introModalSeen;
      }

      return null;
    });

    const pinia = createTestingPinia({
      initialState: {
        FeatureFlags: {
          activeFeatures: conversationsImprovements ? ['improvements'] : [],
        },
      },
    });

    featureFlagsStore = useFeatureFlagsStore();
    featureFlagsStore.activeFeatures = conversationsImprovements
      ? ['improvements']
      : [];

    supervisorStore = useSupervisorStore();

    wrapper = shallowMount(Supervisor, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    mockRoute.name = 'conversations';
    vi.clearAllMocks();

    useRouter();
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  it('matches snapshot on conversations route', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('renders SupervisorHeader component', () => {
    expect(findHeader().exists()).toBe(true);
  });

  it('renders SupervisorConversations component on conversations route', () => {
    expect(findConversations().exists()).toBe(true);
    expect(findRouterView().exists()).toBe(false);
  });

  it('renders Conversation component when selectedConversation is present', async () => {
    expect(findConversation().exists()).toBe(false);

    supervisorStore.selectedConversation = {
      id: 1,
      title: 'Test Conversation',
    };

    await wrapper.vm.$nextTick();

    expect(wrapper.classes()).toContain('supervisor--with-conversation');
    expect(findConversation().exists()).toBe(true);
  });

  describe('improvements intro modal', () => {
    it('opens the modal when the improvements flag is enabled and storage is empty', async () => {
      await wrapper.unmount();
      createWrapper({ conversationsImprovements: true, introModalSeen: null });

      expect(moduleStorage.getItem).toHaveBeenCalledWith(
        'improvements-intro-modal-seen',
      );
      expect(findIntroModal().exists()).toBe(true);
      expect(wrapper.vm.isIntroModalOpen).toBe(true);
      expect(findIntroModal().props('open')).toBe(true);
    });

    it('does not open the modal when the storage flag is already set', async () => {
      await wrapper.unmount();
      createWrapper({ conversationsImprovements: true, introModalSeen: true });

      expect(findIntroModal().exists()).toBe(true);
      expect(wrapper.vm.isIntroModalOpen).toBe(false);
      expect(findIntroModal().props('open')).toBe(false);
    });

    it('does not mount the modal when the improvements flag is disabled', () => {
      expect(findIntroModal().exists()).toBe(false);
    });

    it('persists the seen flag when the modal is dismissed', async () => {
      await wrapper.unmount();
      createWrapper({ conversationsImprovements: true, introModalSeen: null });

      expect(wrapper.vm.isIntroModalOpen).toBe(true);

      await findIntroModal().vm.$emit('update:open', false);
      await wrapper.vm.$nextTick();

      expect(moduleStorage.setItem).toHaveBeenCalledWith(
        'improvements-intro-modal-seen',
        true,
      );
      expect(findIntroModal().props('open')).toBe(false);
    });
  });

  describe('improvements route', () => {
    beforeEach(async () => {
      mockRoute.name = 'improvements';
      await wrapper.unmount();
      createWrapper();
    });

    it('matches snapshot on improvements route', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders RouterView instead of SupervisorConversations', () => {
      expect(findConversations().exists()).toBe(false);
      expect(findRouterView().exists()).toBe(true);
    });

    it('does not render Conversation panel even when a conversation is selected', async () => {
      supervisorStore.selectedConversation = {
        id: 1,
        title: 'Test Conversation',
      };

      await wrapper.vm.$nextTick();

      expect(wrapper.classes()).not.toContain('supervisor--with-conversation');
      expect(findConversation().exists()).toBe(false);
    });
  });

  describe('Auto-load conversations without scrollbar', () => {
    let mockSpy;

    beforeEach(async () => {
      mockSpy = vi.fn();

      supervisorStore.conversations = {
        status: 'complete',
        data: {
          next: 'next-page-url',
          results: [{ uuid: '1' }, { uuid: '2' }],
        },
      };

      await flushPromises();

      wrapper.vm.scrollContainer = {
        scrollHeight: 500,
        clientHeight: 800,
        scrollTop: 0,
      };

      wrapper.vm.supervisorConversations = {
        loadMoreConversations: mockSpy,
      };

      wrapper.vm.isCheckingScroll = false;
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

    it('toggles scroll spacing class based on scrollbar presence', async () => {
      const content = wrapper.find('.supervisor__content');

      wrapper.vm.scrollContainer = {
        scrollHeight: 500,
        clientHeight: 800,
        scrollTop: 0,
      };

      wrapper.vm.updateHasScroll();
      await wrapper.vm.$nextTick();

      expect(content.classes()).not.toContain(
        'supervisor__content--with-scroll',
      );
      expect(wrapper.vm.hasScroll).toBe(false);

      wrapper.vm.scrollContainer.scrollHeight = 1000;
      wrapper.vm.updateHasScroll();
      await wrapper.vm.$nextTick();

      expect(content.classes()).toContain('supervisor__content--with-scroll');
      expect(wrapper.vm.hasScroll).toBe(true);
    });
  });

  describe('Scroll-based pagination', () => {
    let mockSpy;

    beforeEach(async () => {
      mockSpy = vi.fn();

      supervisorStore.conversations = {
        status: 'complete',
        data: {
          next: 'next-page-url',
          results: [{ uuid: '1' }, { uuid: '2' }],
        },
      };

      await flushPromises();

      wrapper.vm.scrollContainer = {
        scrollHeight: 1000,
        clientHeight: 800,
        scrollTop: 0,
      };

      wrapper.vm.supervisorConversations = {
        loadMoreConversations: mockSpy,
      };

      wrapper.vm.isCheckingScroll = false;
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
