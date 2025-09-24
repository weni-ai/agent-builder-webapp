import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import PreviewLogsSection from '../PreviewLogsSection.vue';
import { usePreviewStore } from '@/store/Preview';
import i18n from '@/utils/plugins/i18n';

describe('PreviewLogsSection.vue', () => {
  let wrapper;
  let previewStore;

  const previewLogsSection = () =>
    wrapper.find('[data-testid="preview-details-logs"]');
  const previewLogsFilters = () =>
    wrapper.findComponent('[data-testid="preview-logs-filters"]');
  const previewLogs = () =>
    wrapper.findComponent('[data-testid="preview-logs"]');
  const emptyMessage = () =>
    wrapper.find('[data-testid="preview-logs-section-empty"]');

  const mockLogs = [
    {
      id: 1,
      data: { message: 'Knowledge search result' },
      config: { category: 'knowledge', summary: 'Searching knowledge base' },
    },
    {
      id: 2,
      data: { message: 'Agent thinking process' },
      config: { category: 'thinking', summary: 'Processing user request' },
    },
    {
      id: 3,
      data: { message: 'Tool execution' },
      config: { category: 'tool', summary: 'Executing search tool' },
    },
    {
      id: 4,
      data: { message: 'Final response' },
      config: {
        category: 'sending_final_response',
        summary: 'Sending response to user',
      },
    },
  ];

  beforeEach(() => {
    const pinia = createTestingPinia();

    wrapper = shallowMount(PreviewLogsSection, {
      global: {
        plugins: [pinia],
      },
    });

    previewStore = usePreviewStore();
    previewStore.collaboratorsLogs = mockLogs;
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders correctly with required components', () => {
      expect(previewLogsSection().exists()).toBe(true);
      expect(previewLogsFilters().exists()).toBe(true);
      expect(previewLogs().exists()).toBe(true);
    });

    it('passes logs to PreviewLogsFilters component', () => {
      expect(previewLogsFilters().props('logs')).toEqual(mockLogs);
    });

    it('initially shows all logs in PreviewLogs component', () => {
      expect(previewLogs().props('logs')).toEqual(mockLogs);
    });

    it('does not show empty message initially', () => {
      expect(emptyMessage().exists()).toBe(false);
    });
  });

  describe('Store integration', () => {
    it('gets logs from preview store', () => {
      expect(wrapper.vm.logs).toEqual(mockLogs);
    });

    it('updates filtered logs when store logs change', async () => {
      const newLogs = [
        ...mockLogs,
        {
          id: 5,
          data: { message: 'New log entry' },
          config: { category: 'knowledge', summary: 'New knowledge search' },
        },
      ];

      previewStore.collaboratorsLogs = newLogs;
      await nextTick();

      expect(wrapper.vm.filteredLogs).toEqual(newLogs);
      expect(previewLogs().props('logs')).toEqual(newLogs);
    });
  });

  describe('Filter functionality', () => {
    it('filters logs by category correctly', async () => {
      const filtersChangedEvent = {
        searchTerm: '',
        selectedCategories: ['knowledge'],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      const expectedFilteredLogs = mockLogs.filter(
        (log) => log.config.category === 'knowledge',
      );

      expect(wrapper.vm.filteredLogs).toEqual(expectedFilteredLogs);
      expect(previewLogs().props('logs')).toEqual(expectedFilteredLogs);
    });

    it('filters logs by search term in data correctly', async () => {
      const filtersChangedEvent = {
        searchTerm: 'thinking',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      const expectedFilteredLogs = mockLogs.filter((log) =>
        JSON.stringify(log.data).toLowerCase().includes('thinking'),
      );

      expect(wrapper.vm.filteredLogs).toEqual(expectedFilteredLogs);
      expect(previewLogs().props('logs')).toEqual(expectedFilteredLogs);
    });

    it('filters logs by search term in summary correctly', async () => {
      const filtersChangedEvent = {
        searchTerm: 'user request',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      const expectedFilteredLogs = mockLogs.filter((log) =>
        log.config.summary.toLowerCase().includes('user request'),
      );

      expect(wrapper.vm.filteredLogs).toEqual(expectedFilteredLogs);
      expect(previewLogs().props('logs')).toEqual(expectedFilteredLogs);
    });

    it('applies both category and search term filters', async () => {
      const filtersChangedEvent = {
        searchTerm: 'search',
        selectedCategories: ['knowledge', 'tool'],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      const expectedFilteredLogs = mockLogs.filter((log) => {
        const matchesCategory = ['knowledge', 'tool'].includes(
          log.config.category,
        );
        const searchTermLower = 'search';
        const matchesSearchTerm =
          JSON.stringify(log.data).toLowerCase().includes(searchTermLower) ||
          log.config.summary.toLowerCase().includes(searchTermLower);

        return matchesCategory && matchesSearchTerm;
      });

      expect(wrapper.vm.filteredLogs).toEqual(expectedFilteredLogs);
      expect(previewLogs().props('logs')).toEqual(expectedFilteredLogs);
    });

    it('handles case-insensitive search correctly', async () => {
      const filtersChangedEvent = {
        searchTerm: 'KNOWLEDGE',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      const expectedFilteredLogs = mockLogs.filter(
        (log) =>
          JSON.stringify(log.data).toLowerCase().includes('knowledge') ||
          log.config.summary.toLowerCase().includes('knowledge'),
      );

      expect(wrapper.vm.filteredLogs).toEqual(expectedFilteredLogs);
    });

    it('trims whitespace from search term', async () => {
      const filtersChangedEvent = {
        searchTerm: '  thinking  ',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      expect(wrapper.vm.searchTerm).toBe('  thinking  ');

      const expectedFilteredLogs = mockLogs.filter(
        (log) =>
          JSON.stringify(log.data).toLowerCase().includes('thinking') ||
          log.config.summary.toLowerCase().includes('thinking'),
      );

      expect(wrapper.vm.filteredLogs).toEqual(expectedFilteredLogs);
    });
  });

  describe('Empty state handling', () => {
    it('shows empty message when no logs match search term', async () => {
      const filtersChangedEvent = {
        searchTerm: 'nonexistent',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );
      await nextTick();

      expect(emptyMessage().exists()).toBe(true);
      expect(emptyMessage().text()).toBe(
        i18n.global.t('agent_builder.traces.filter_logs.no_logs_found'),
      );
      expect(previewLogs().exists()).toBe(false);
    });

    it('shows empty message when no logs match selected categories', async () => {
      const filtersChangedEvent = {
        searchTerm: '',
        selectedCategories: ['nonexistent_category'],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );
      await nextTick();

      expect(emptyMessage().exists()).toBe(true);
      expect(previewLogs().exists()).toBe(false);
    });

    it('shows empty message when both filters result in no matches', async () => {
      const filtersChangedEvent = {
        searchTerm: 'nonexistent',
        selectedCategories: ['knowledge'],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );
      await nextTick();

      expect(emptyMessage().exists()).toBe(true);
      expect(previewLogs().exists()).toBe(false);
    });

    it('does not show empty message when no filters are applied', async () => {
      const filtersChangedEvent = {
        searchTerm: '',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );
      await nextTick();

      expect(emptyMessage().exists()).toBe(false);
      expect(previewLogs().exists()).toBe(true);
    });

    it('hides empty message and shows logs when filters are cleared', async () => {
      const noMatchFilters = {
        searchTerm: 'nonexistent',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit('filters-changed', noMatchFilters);
      await nextTick();

      expect(emptyMessage().exists()).toBe(true);
      expect(previewLogs().exists()).toBe(false);

      const clearedFilters = {
        searchTerm: '',
        selectedCategories: [],
      };

      await previewLogsFilters().vm.$emit('filters-changed', clearedFilters);
      await nextTick();

      expect(emptyMessage().exists()).toBe(false);
      expect(previewLogs().exists()).toBe(true);
      expect(previewLogs().props('logs')).toEqual(mockLogs);
    });
  });

  describe('Event handling', () => {
    it('emits scroll-to-bottom when PreviewLogs emits scroll-to-bottom', async () => {
      await previewLogs().vm.$emit('scroll-to-bottom');

      expect(wrapper.emitted('scroll-to-bottom')).toBeTruthy();
      expect(wrapper.emitted('scroll-to-bottom')).toHaveLength(1);
    });

    it('updates component state when filters change', async () => {
      const filtersChangedEvent = {
        searchTerm: 'test search',
        selectedCategories: ['knowledge', 'tool'],
      };

      expect(wrapper.vm.searchTerm).toBe('');
      expect(wrapper.vm.selectedCategories).toEqual([]);

      await previewLogsFilters().vm.$emit(
        'filters-changed',
        filtersChangedEvent,
      );

      expect(wrapper.vm.searchTerm).toBe('test search');
      expect(wrapper.vm.selectedCategories).toEqual(['knowledge', 'tool']);
    });
  });

  describe('Edge cases', () => {
    it('handles empty logs array correctly', async () => {
      previewStore.collaboratorsLogs = [];
      await nextTick();

      expect(wrapper.vm.logs).toEqual([]);
      expect(wrapper.vm.filteredLogs).toEqual([]);
      expect(previewLogs().props('logs')).toEqual([]);
    });
  });
});
