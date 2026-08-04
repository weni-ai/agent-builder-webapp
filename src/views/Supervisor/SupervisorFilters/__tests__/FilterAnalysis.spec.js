import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import FilterAnalysis from '../FilterAnalysis.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {},
  }),
}));

describe('FilterAnalysis.vue', () => {
  let wrapper;
  let store;

  const analysisRadioGroup = () =>
    wrapper.findComponent('[data-testid="analysis-radio-group"]');

  const createWrapper = (isAmazing = null) => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          temporaryFilters: {
            isAmazing,
          },
        },
      },
    });

    store = useSupervisorStore();

    wrapper = mount(FilterAnalysis, {
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
    it('renders the analysis radio group', () => {
      expect(analysisRadioGroup().exists()).toBe(true);
    });

    it('initializes with all conversations when isAmazing is null', () => {
      expect(analysisRadioGroup().props('modelValue')).toBe(
        'all_conversations',
      );
    });

    it('initializes with amazing conversations when isAmazing is true', () => {
      wrapper.unmount();
      createWrapper(true);

      expect(analysisRadioGroup().props('modelValue')).toBe(
        'amazing_conversations',
      );
    });

    it('provides correct analysis options', () => {
      const allConversationsRadio = wrapper.findComponent(
        '[data-testid="analysis-radio-all_conversations"]',
      );
      const amazingConversationsRadio = wrapper.findComponent(
        '[data-testid="analysis-radio-amazing_conversations"]',
      );

      expect(allConversationsRadio.props('label')).toBe(
        i18n.global.t(
          'audit.conversations.filters.analysis.all_conversations',
        ),
      );
      expect(allConversationsRadio.props('value')).toBe('all_conversations');
      expect(amazingConversationsRadio.props('label')).toBe(
        i18n.global.t(
          'audit.conversations.filters.analysis.amazing_conversations',
        ),
      );
      expect(amazingConversationsRadio.props('value')).toBe(
        'amazing_conversations',
      );
    });
  });

  describe('Analysis selection functionality', () => {
    it('sets isAmazing to true when amazing conversations is selected', async () => {
      await analysisRadioGroup().vm.$emit(
        'update:modelValue',
        'amazing_conversations',
      );
      await nextTick();

      expect(store.temporaryFilters.isAmazing).toBe(true);
    });

    it('sets isAmazing to null when all conversations is selected', async () => {
      wrapper.unmount();
      createWrapper(true);

      await analysisRadioGroup().vm.$emit(
        'update:modelValue',
        'all_conversations',
      );
      await nextTick();

      expect(store.temporaryFilters.isAmazing).toBeNull();
    });

    it('follows the store when isAmazing is reset externally', async () => {
      wrapper.unmount();
      createWrapper(true);

      store.temporaryFilters.isAmazing = null;
      await nextTick();

      expect(analysisRadioGroup().props('modelValue')).toBe('all_conversations');
      expect(store.temporaryFilters.isAmazing).toBeNull();
    });
  });
});
