import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import Unnnic from '@weni/unnnic-system';

import ConversationsSearch from '../ConversationsSearch.vue';
import { useOldSupervisorStore } from '@/store/OldSupervisor';
import i18n from '@/utils/plugins/i18n';

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

describe('ConversationsSearch.vue', () => {
  let wrapper;
  let store;

  const input = () => wrapper.findComponent('[data-testid="search-input"]');

  beforeEach(() => {
    const pinia = createTestingPinia({
      initialState: {
        Supervisor: {
          filters: {
            start: '',
            end: '',
            search: '',
            type: '',
          },
        },
      },
    });

    wrapper = shallowMount(ConversationsSearch, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicInput: Unnnic.unnnicInput,
        },
      },
    });

    store = useOldSupervisorStore();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders UnnnicInput with correct props', () => {
      expect(input().exists()).toBe(true);
      expect(input().props('iconLeft')).toBe('search');
      expect(input().props('placeholder')).toBe(
        i18n.global.t('agent_builder.supervisor.search'),
      );
    });

    it('initializes with empty search value', () => {
      expect(input().props('modelValue')).toBe('');
    });
  });

  describe('Search functionality', () => {
    it('updates local search value when input changes', async () => {
      await input().vm.$emit('update:modelValue', 'test search');
      await nextTick();

      expect(input().props('modelValue')).toBe('test search');
    });

    it('updates store filter when search value changes', async () => {
      await input().vm.$emit('update:modelValue', 'conversation search');
      await nextTick();

      expect(store.filters.search).toBe('conversation search');
    });

    it('handles empty search input', async () => {
      await input().vm.$emit('update:modelValue', 'some text');
      await nextTick();
      expect(store.filters.search).toBe('some text');

      await input().vm.$emit('update:modelValue', '');
      await nextTick();
      expect(store.filters.search).toBe('');
    });

    it('handles special characters in search', async () => {
      const specialText = '!@#$%^&*()_+-={}[]|\\:";\'<>?,./';

      await input().vm.$emit('update:modelValue', specialText);
      await nextTick();

      expect(store.filters.search).toBe(specialText);
    });
  });

  describe('Edge cases', () => {
    it('handles very long search strings', async () => {
      const longText = 'a'.repeat(1000);

      await input().vm.$emit('update:modelValue', longText);
      await nextTick();

      expect(store.filters.search).toBe(longText);
    });

    it('handles rapid consecutive input changes', async () => {
      await input().vm.$emit('update:modelValue', 'search1');
      await input().vm.$emit('update:modelValue', 'search2');
      await input().vm.$emit('update:modelValue', 'search3');
      await nextTick();

      expect(store.filters.search).toBe('search3');
    });
  });
});
