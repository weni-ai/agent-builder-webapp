import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import FilterCsat from '../FilterCsat.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {
      csat: 'very_satisfied,satisfied',
    },
  }),
}));

describe('FilterCsat.vue', () => {
  let wrapper;
  let store;

  const csatSelect = () => wrapper.findComponent('[data-testid="csat-select"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          temporaryFilters: {
            csat: ['very_satisfied', 'satisfied'],
          },
        },
      },
    });

    store = useSupervisorStore();

    store.getInitialSelectFilter = vi
      .fn()
      .mockReturnValue(['very_satisfied', 'satisfied']);

    wrapper = mount(FilterCsat, {
      global: {
        plugins: [pinia, i18n],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders with correct props', () => {
      expect(csatSelect().exists()).toBe(true);
      expect(csatSelect().props('clearable')).toBe(true);
    });

    it('initializes with store csat values', () => {
      const modelValue = csatSelect().props('modelValue');
      expect(modelValue).toStrictEqual(
        store.getInitialSelectFilter('csat', wrapper.vm.csatOptions),
      );
      expect(Array.isArray(modelValue)).toBe(true);
    });

    it('provides correct csat options', () => {
      const options = csatSelect().props('options');
      expect(options).toStrictEqual(wrapper.vm.csatOptions);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(5);
    });
  });

  describe('CSAT selection functionality', () => {
    it('updates local csat filter when select changes', async () => {
      const newCsatSelection = ['neutral', 'dissatisfied'];

      await csatSelect().vm.$emit('update:modelValue', newCsatSelection);
      await nextTick();

      expect(csatSelect().props('modelValue')).toEqual(newCsatSelection);
    });

    it('updates store temporary filters when csat changes', async () => {
      const newCsatSelection = ['very_dissatisfied', 'neutral'];

      await csatSelect().vm.$emit('update:modelValue', newCsatSelection);
      await nextTick();

      expect(store.temporaryFilters.csat).toEqual([
        'very_dissatisfied',
        'neutral',
      ]);
    });

    it('handles empty csat selection', async () => {
      await csatSelect().vm.$emit('update:modelValue', []);
      await nextTick();

      expect(store.temporaryFilters.csat).toEqual([]);
    });

    it('handles single csat selection', async () => {
      await csatSelect().vm.$emit('update:modelValue', ['very_satisfied']);
      await nextTick();

      expect(store.temporaryFilters.csat).toEqual(['very_satisfied']);
    });
  });

  describe('CSAT options validation', () => {
    it('includes all expected csat options', () => {
      const options = csatSelect().props('options');
      const expectedValues = [
        'very_satisfied',
        'satisfied',
        'neutral',
        'dissatisfied',
        'very_dissatisfied',
      ];

      const actualValues = options.map((option) => option.value);
      expectedValues.forEach((expectedValue) => {
        expect(actualValues).toContain(expectedValue);
      });
    });
  });
});
