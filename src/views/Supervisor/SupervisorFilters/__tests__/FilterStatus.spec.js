import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import FilterStatus from '../FilterStatus.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {
      status: 'optimized_resolution,other_conclusion',
    },
  }),
}));

describe('FilterStatus.vue', () => {
  let wrapper;
  let store;

  const statusSelect = () =>
    wrapper.findComponent('[data-testid="status-select"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          temporaryFilters: {
            status: ['optimized_resolution', 'other_conclusion'],
          },
        },
      },
    });

    store = useSupervisorStore();

    store.getInitialSelectFilter = vi
      .fn()
      .mockReturnValue(['optimized_resolution', 'other_conclusion']);

    wrapper = mount(FilterStatus, {
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
      expect(statusSelect().exists()).toBe(true);
      expect(statusSelect().props('clearable')).toBe(true);
    });

    it('initializes with store status values', () => {
      const modelValue = statusSelect().props('modelValue');
      expect(modelValue).toStrictEqual(
        store.getInitialSelectFilter('status', wrapper.vm.statusOptions),
      );
      expect(Array.isArray(modelValue)).toBe(true);
    });

    it('provides correct status options', () => {
      const options = statusSelect().props('options');
      expect(options).toStrictEqual(wrapper.vm.statusOptions);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(5);
    });
  });

  describe('Status selection functionality', () => {
    it('updates local status filter when select changes', async () => {
      const newStatusSelection = ['optimized_resolution', 'in_progress'];

      await statusSelect().vm.$emit('update:modelValue', newStatusSelection);
      await nextTick();

      expect(statusSelect().props('modelValue')).toEqual(newStatusSelection);
    });

    it('updates store temporary filters when status changes', async () => {
      const newStatusSelection = [
        'transferred_to_human_support',
        'unclassified',
      ];

      await statusSelect().vm.$emit('update:modelValue', newStatusSelection);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual([
        'transferred_to_human_support',
        'unclassified',
      ]);
    });

    it('handles empty status selection', async () => {
      await statusSelect().vm.$emit('update:modelValue', []);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual([]);
    });

    it('handles single status selection', async () => {
      await statusSelect().vm.$emit('update:modelValue', ['other_conclusion']);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual(['other_conclusion']);
    });
  });

  describe('Status options validation', () => {
    it('includes all expected status options', () => {
      const options = statusSelect().props('options');
      const expectedValues = [
        'optimized_resolution',
        'other_conclusion',
        'transferred_to_human_support',
        'in_progress',
        'unclassified',
      ];

      const actualValues = options.map((option) => option.value);
      expectedValues.forEach((expectedValue) => {
        expect(actualValues).toContain(expectedValue);
      });
    });
  });
});
