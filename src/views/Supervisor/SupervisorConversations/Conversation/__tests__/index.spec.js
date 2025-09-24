import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import Conversation from '../index.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import { nextTick } from 'vue';

const mockConversationData = {
  basic: {
    urn: 'conversation-123',
    data: { status: 'complete', results: [] },
  },
  withMessages: {
    urn: 'conversation-456',
    data: {
      status: 'complete',
      results: [
        { id: 1, text: 'Hello', source_type: 'user' },
        { id: 2, text: 'Hi there!', source_type: 'agent' },
        { id: 3, text: 'How are you?', source_type: 'user' },
      ],
    },
  },
  loading: {
    urn: 'conversation-loading',
    data: { status: 'loading', results: null },
  },
  loadingWithResults: {
    urn: 'conversation-loading-with-results',
    data: {
      status: 'loading',
      results: [{ id: 1, text: 'Hello' }],
    },
  },
  withHumanSupport: {
    urn: 'conversation-human-support',
    human_support: true,
    data: {
      status: 'complete',
      results: [{ id: 1, text: 'Hello' }],
    },
  },
};

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

const createWrapper = (initialState = {}) => {
  const pinia = createTestingPinia({
    initialState: {
      Supervisor: {
        selectedConversation: {
          urn: 'conversation-123',
          data: { status: 'complete', results: [] },
        },
        ...initialState.supervisor,
      },
    },
  });

  return shallowMount(Conversation, {
    global: {
      plugins: [pinia],
      stubs: {
        UnnnicIntelligenceText: {
          template: '<div><slot /></div>',
        },
      },
    },
  });
};

describe('Conversation.vue', () => {
  let wrapper;
  let supervisorStore;

  const defineScroll = ({
    element = HTMLElement.prototype,
    scrollTo = vi.fn(),
    scrollHeight = 1000,
  } = {}) => {
    Object.defineProperty(element, 'scrollTo', {
      value: scrollTo,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(element, 'scrollHeight', {
      value: scrollHeight,
      writable: true,
      configurable: true,
    });
  };

  const conversation = () => wrapper.find('[data-testid="conversation"]');
  const conversationHeader = () =>
    wrapper.find('[data-testid="conversation-header"]');
  const messagesContainer = () =>
    wrapper.find('[data-testid="messages-container"]');
  const noMessagesFound = () =>
    wrapper.find('[data-testid="no-messages-found"]');
  const loadingMessages = () =>
    wrapper.findAll('[data-testid="loading-message"]');
  const messages = () => wrapper.findAll('[data-testid="message"]');
  const forwardedHumanSupport = () =>
    wrapper.find('[data-testid="forwarded-human-support"]');

  beforeEach(() => {
    vi.clearAllMocks();

    wrapper = createWrapper();
    supervisorStore = useSupervisorStore();
    supervisorStore.selectedConversation = mockConversationData.basic;

    defineScroll({});
  });

  describe('Component rendering', () => {
    it('renders correctly with basic structure', () => {
      expect(conversation().exists()).toBe(true);
      expect(conversationHeader().exists()).toBe(true);
      expect(messagesContainer().exists()).toBe(true);
    });
  });

  describe('Loading states', () => {
    it('shows loading skeleton when conversation is loading without results', async () => {
      supervisorStore.selectedConversation = mockConversationData.loading;

      await nextTick();

      expect(loadingMessages()).toHaveLength(3);
      expect(noMessagesFound().exists()).toBe(false);
      expect(messages()).toHaveLength(0);
    });

    it('shows messages when conversation is loading but has results', async () => {
      supervisorStore.selectedConversation =
        mockConversationData.loadingWithResults;

      await nextTick();

      expect(loadingMessages()).toHaveLength(0);
      expect(messages()).toHaveLength(1);
    });
  });

  describe('Empty states', () => {
    it('shows no messages found when results array is empty', async () => {
      supervisorStore.selectedConversation = mockConversationData.basic;

      await nextTick();

      expect(noMessagesFound().exists()).toBe(true);
      expect(loadingMessages()).toHaveLength(0);
      expect(messages()).toHaveLength(0);
    });
  });

  describe('Messages display', () => {
    it('renders message components for each conversation message', async () => {
      supervisorStore.selectedConversation = mockConversationData.withMessages;

      await nextTick();

      expect(messages()).toHaveLength(3);
      expect(noMessagesFound().exists()).toBe(false);
      expect(loadingMessages()).toHaveLength(0);
    });
  });

  describe('User interactions', () => {
    it('loads more data when scrolled to top of messages container', async () => {
      messagesContainer().element.scrollTop = 0;

      await messagesContainer().trigger('scroll');

      expect(supervisorStore.loadSelectedConversationData).toHaveBeenCalledWith(
        { next: true },
      );
    });

    it('does not load more data when scrolled but not at top', async () => {
      vi.clearAllMocks();

      messagesContainer().element.scrollTop = 100;

      await messagesContainer().trigger('scroll');

      expect(
        supervisorStore.loadSelectedConversationData,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Component lifecycle', () => {
    it('loads conversation data on mount', () => {
      expect(
        supervisorStore.loadSelectedConversationData,
      ).toHaveBeenCalledWith();
    });
  });

  describe('Edge cases', () => {
    it('handles null selected conversation gracefully', async () => {
      supervisorStore.selectedConversation = null;

      await nextTick();

      expect(conversation().exists()).toBe(true);
    });

    it('handles conversation without data property', () => {
      const incompleteConversation = { urn: 'test-conversation' };

      supervisorStore.selectedConversation = incompleteConversation;

      expect(conversation().exists()).toBe(true);
      expect(() => wrapper.vm).not.toThrow();
    });

    it('handles conversation with undefined results', () => {
      const conversationWithUndefinedResults = {
        urn: 'test-conversation',
        data: { status: 'complete', results: undefined },
      };

      supervisorStore.selectedConversation = conversationWithUndefinedResults;

      expect(conversation().exists()).toBe(true);
      expect(messages()).toHaveLength(0);
    });
  });
});
