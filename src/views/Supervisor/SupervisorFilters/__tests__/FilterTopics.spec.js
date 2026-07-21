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

    store.getInitialSelectFilter = vi
      .fn()
      .mockReturnValue(['billing', 'support']);

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
      expect(topicSelect().props('enableSearch')).toBe(true);
      expect(topicSelect().props('clearable')).toBe(true);
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
      expect(options.length).toBe(5); // 1 unclassified + 4 topic options
    });

    it('provides a fixed unclassified topic option', () => {
      const options = topicSelect().props('options');
      const unclassifiedOption = options.find(
        (option) => option.value === 'unclassified',
      );

      expect(unclassifiedOption).toStrictEqual({
        label: 'Not classified',
        value: 'unclassified',
      });
    });
  });

  describe('Topic selection functionality', () => {
    it('updates local topic filter when select changes', async () => {
      const newTopicSelection = ['technical', 'general'];

      await topicSelect().vm.$emit('update:modelValue', newTopicSelection);
      await nextTick();

      expect(topicSelect().props('modelValue')).toEqual(newTopicSelection);
    });

    it('updates store temporary filters when topics change', async () => {
      const newTopicSelection = ['technical', 'general'];

      await topicSelect().vm.$emit('update:modelValue', newTopicSelection);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['Technical', 'General']);
    });

    it('handles empty topic selection', async () => {
      await topicSelect().vm.$emit('update:modelValue', []);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual([]);
    });

    it('handles single topic selection', async () => {
      await topicSelect().vm.$emit('update:modelValue', ['billing']);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['Billing']);
    });

    it('stores the unclassified topic by its id', async () => {
      await topicSelect().vm.$emit('update:modelValue', ['unclassified']);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual(['unclassified']);
    });

    it('stores the unclassified topic by id alongside regular topics by label', async () => {
      await topicSelect().vm.$emit('update:modelValue', [
        'unclassified',
        'billing',
      ]);
      await nextTick();

      expect(store.temporaryFilters.topics).toEqual([
        'unclassified',
        'Billing',
      ]);
    });
  });

  describe('Topic options validation', () => {
    it('includes all expected topic options', () => {
      const options = topicSelect().props('options');
      const expectedLabels = [
        'Not classified',
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

    it('handles rapid consecutive topic changes', async () => {
      await topicSelect().vm.$emit('update:modelValue', ['support']);
      await topicSelect().vm.$emit('update:modelValue', ['billing']);
      await topicSelect().vm.$emit('update:modelValue', ['technical']);
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
