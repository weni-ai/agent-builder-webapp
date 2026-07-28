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

  const analysisSelect = () =>
    wrapper.findComponent('[data-testid="analysis-select"]');

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
    it('renders the analysis select', () => {
      expect(analysisSelect().exists()).toBe(true);
    });

    it('initializes with all conversations when isAmazing is null', () => {
      expect(analysisSelect().props('modelValue')).toBe('all_conversations');
    });

    it('initializes with amazing conversations when isAmazing is true', () => {
      wrapper.unmount();
      createWrapper(true);

      expect(analysisSelect().props('modelValue')).toBe(
        'amazing_conversations',
      );
    });

    it('provides correct analysis options', () => {
      const options = analysisSelect().props('options');

      expect(options).toStrictEqual([
        {
          label: i18n.global.t(
            'audit.conversations.filters.analysis.all_conversations',
          ),
          value: 'all_conversations',
        },
        {
          label: i18n.global.t(
            'audit.conversations.filters.analysis.amazing_conversations',
          ),
          value: 'amazing_conversations',
        },
      ]);
    });
  });

  describe('Analysis selection functionality', () => {
    it('sets isAmazing to true when amazing conversations is selected', async () => {
      await analysisSelect().vm.$emit(
        'update:modelValue',
        'amazing_conversations',
      );
      await nextTick();

      expect(store.temporaryFilters.isAmazing).toBe(true);
    });

    it('sets isAmazing to null when all conversations is selected', async () => {
      wrapper.unmount();
      createWrapper(true);

      await analysisSelect().vm.$emit('update:modelValue', 'all_conversations');
      await nextTick();

      expect(store.temporaryFilters.isAmazing).toBeNull();
    });
  });
});
