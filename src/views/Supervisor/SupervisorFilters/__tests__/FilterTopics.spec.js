import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import FilterTopics from '../FilterTopics.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';

vi.mock('vue-router', () => ({
  useRoute: vi.fn().mockReturnValue({
    query: {
      topics: 'billing,support',
    },
  }),
}));

describe('FilterTopics.vue', () => {
  let wrapper;
  let store;

  const topicSelect = () =>
    wrapper.findComponent('[data-testid="topic-select"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          temporaryFilters: {
            topics: ['billing', 'support'],
          },
          topics: [
            { label: 'Billing', value: 'billing' },
            { label: 'Support', value: 'support' },
            { label: 'Technical', value: 'technical' },
            { label: 'General', value: 'general' },
          ],
        },
      },
    });

    store = useSupervisorStore();

    store.getInitialSelectFilter = vi.fn().mockReturnValue([
      { label: 'Billing', value: 'billing' },
      { label: 'Support', value: 'support' },
    ]);

    wrapper = mount(FilterTopics, {
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
      expect(topicSelect().exists()).toBe(true);
      expect(topicSelect().props('orderedByIndex')).toBe(true);
      expect(topicSelect().props('multiple')).toBe(true);
      expect(
        topicSelect().props('multipleWithoutSelectsMessage'),
      ).toBeDefined();
      expect(topicSelect().props('autocomplete')).toBe(true);
    });

    it('initializes with store topic values', () => {
      const modelValue = topicSelect().props('modelValue');
      expect(modelValue).toStrictEqual(
        store.getInitialSelectFilter('topics', wrapper.vm.topicOptions),
      );
      expect(Array.isArray(modelValue)).toBe(true);
    });

    it('provides correct topic options', () => {
      const options = topicSelect().props('options');
      expect(options).toStrictEqual(wrapper.vm.topicOptions);
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(5); // 1 default + 4 topic options
    });
  });

  describe('Topic selection functionality', () => {
    it('updates local topic filter when select changes', async () => {
      const newTopicSelection = [
        { label: 'Technical', value: 'technical' },
        { label: 'General', value: 'general' },
      ];

      await topicSelect().vm.$emit('update:modelValue', newTopicSelection);
      await nextTick();

      expect(topicSelect().props('modelValue')).toEqual(newTopicSelection);
    });

    it('updates store temporary filters when topics change', async () => {
      const newTopicSelection = [
        { label: 'Technical', value: 'technical' },
        { label: 'General', value: 'general' },
      ];

      await topicSelect().vm.$emit('update:modelValue', newTopicSelection);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['Technical', 'General']);
    });

    it('handles empty topic selection', async () => {
      const emptySelection = [];

      await topicSelect().vm.$emit('update:modelValue', emptySelection);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual([]);
    });

    it('handles single topic selection', async () => {
      const singleSelection = [{ label: 'Billing', value: 'billing' }];

      await topicSelect().vm.$emit('update:modelValue', singleSelection);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['Billing']);
    });
  });

  describe('Topic options validation', () => {
    it('includes all expected topic options', () => {
      const options = topicSelect().props('options');
      const expectedLabels = [
        'Topic', // default option
        'Billing',
        'Support',
        'Technical',
        'General',
      ];

      const actualLabels = options.map((option) => option.label);
      expectedLabels.forEach((expectedLabel) => {
        expect(actualLabels).toContain(expectedLabel);
      });
    });

    it('handles topic options with empty values', async () => {
      const selectionWithEmpty = [
        { label: 'Topic', value: '' },
        { label: 'Billing', value: 'billing' },
      ];

      await topicSelect().vm.$emit('update:modelValue', selectionWithEmpty);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['Topic', 'Billing']);
    });

    it('handles rapid consecutive topic changes', async () => {
      const selection1 = [{ label: 'Support', value: 'support' }];
      const selection2 = [{ label: 'Billing', value: 'billing' }];
      const selection3 = [{ label: 'Technical', value: 'technical' }];

      await topicSelect().vm.$emit('update:modelValue', selection1);
      await topicSelect().vm.$emit('update:modelValue', selection2);
      await topicSelect().vm.$emit('update:modelValue', selection3);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['Technical']);
    });

    it('handles topics from store data', () => {
      const options = topicSelect().props('options');
      const storeTopics = store.topics;

      storeTopics.forEach((storeTopic) => {
        const foundOption = options.find(
          (option) => option.label === storeTopic.label,
        );
        expect(foundOption).toBeDefined();
        expect(foundOption.value).toBe(storeTopic.value);
      });
    });
  });
});
