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

    store.getInitialSelectFilter = vi.fn().mockReturnValue([
      { label: 'Optimized Resolution', value: 'optimized_resolution' },
      { label: 'Other Conclusion', value: 'other_conclusion' },
    ]);

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
      expect(statusSelect().props('orderedByIndex')).toBe(true);
      expect(statusSelect().props('multiple')).toBe(true);
      expect(
        statusSelect().props('multipleWithoutSelectsMessage'),
      ).toBeDefined();
      expect(statusSelect().props('autocomplete')).toBe(true);
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
      expect(options.length).toBe(6); // 1 default + 5 status options
    });
  });

  describe('Status selection functionality', () => {
    it('updates local status filter when select changes', async () => {
      const newStatusSelection = [
        { label: 'Optimized Resolution', value: 'optimized_resolution' },
        { label: 'In Progress', value: 'in_progress' },
      ];

      await statusSelect().vm.$emit('update:modelValue', newStatusSelection);
      await nextTick();

      expect(statusSelect().props('modelValue')).toEqual(newStatusSelection);
    });

    it('updates store temporary filters when status changes', async () => {
      const newStatusSelection = [
        {
          label: 'Transferred to Human Support',
          value: 'transferred_to_human_support',
        },
        { label: 'Unclassified', value: 'unclassified' },
      ];

      await statusSelect().vm.$emit('update:modelValue', newStatusSelection);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual([
        'transferred_to_human_support',
        'unclassified',
      ]);
    });

    it('handles empty status selection', async () => {
      const emptySelection = [];

      await statusSelect().vm.$emit('update:modelValue', emptySelection);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual([]);
    });

    it('handles single status selection', async () => {
      const singleSelection = [
        { label: 'Other Conclusion', value: 'other_conclusion' },
      ];

      await statusSelect().vm.$emit('update:modelValue', singleSelection);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual(['other_conclusion']);
    });
  });

  describe('Status options validation', () => {
    it('includes all expected status options', () => {
      const options = statusSelect().props('options');
      const expectedValues = [
        '',
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

    it('handles status options with empty values', async () => {
      const selectionWithEmpty = [
        { label: 'Conversations', value: '' },
        { label: 'Optimized Resolution', value: 'optimized_resolution' },
      ];

      await statusSelect().vm.$emit('update:modelValue', selectionWithEmpty);
      await nextTick();

      expect(store.temporaryFilters.status).toEqual([
        '',
        'optimized_resolution',
      ]);
    });
  });
});
