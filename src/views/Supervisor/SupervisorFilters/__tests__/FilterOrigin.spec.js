import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import FilterOrigin from '../FilterOrigin.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {},
  }),
}));

describe('FilterOrigin.vue', () => {
  let wrapper;
  let store;

  const originRadioGroup = () =>
    wrapper.findComponent('[data-testid="origin-radio-group"]');

  const createWrapper = (hasConversationStarter = null) => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          temporaryFilters: {
            hasConversationStarter,
          },
        },
      },
    });

    store = useSupervisorStore();

    wrapper = mount(FilterOrigin, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the origin radio group', () => {
      expect(originRadioGroup().exists()).toBe(true);
    });

    it('initializes with all conversations when hasConversationStarter is null', () => {
      expect(originRadioGroup().props('modelValue')).toBe('all_conversations');
    });

    it('initializes with conversation starter when hasConversationStarter is true', () => {
      wrapper.unmount();
      createWrapper(true);

      expect(originRadioGroup().props('modelValue')).toBe(
        'started_with_conversation_starter',
      );
    });

    it('provides correct origin options', () => {
      const allConversationsRadio = wrapper.findComponent(
        '[data-testid="origin-radio-all_conversations"]',
      );
      const conversationStarterRadio = wrapper.findComponent(
        '[data-testid="origin-radio-started_with_conversation_starter"]',
      );

      expect(allConversationsRadio.props('label')).toBe(
        i18n.global.t('audit.conversations.filters.origin.all_conversations'),
      );
      expect(allConversationsRadio.props('value')).toBe('all_conversations');
      expect(conversationStarterRadio.props('label')).toBe(
        i18n.global.t(
          'audit.conversations.filters.origin.started_with_conversation_starter',
        ),
      );
      expect(conversationStarterRadio.props('value')).toBe(
        'started_with_conversation_starter',
      );
    });
  });

  describe('Origin selection functionality', () => {
    it('sets hasConversationStarter to true when conversation starter is selected', async () => {
      await originRadioGroup().vm.$emit(
        'update:modelValue',
        'started_with_conversation_starter',
      );
      await nextTick();

      expect(store.temporaryFilters.hasConversationStarter).toBe(true);
    });

    it('sets hasConversationStarter to null when all conversations is selected', async () => {
      wrapper.unmount();
      createWrapper(true);

      await originRadioGroup().vm.$emit(
        'update:modelValue',
        'all_conversations',
      );
      await nextTick();

      expect(store.temporaryFilters.hasConversationStarter).toBeNull();
    });

    it('follows the store when hasConversationStarter is reset externally', async () => {
      wrapper.unmount();
      createWrapper(true);

      store.temporaryFilters.hasConversationStarter = null;
      await nextTick();

      expect(originRadioGroup().props('modelValue')).toBe('all_conversations');
      expect(store.temporaryFilters.hasConversationStarter).toBeNull();
    });
  });
});
