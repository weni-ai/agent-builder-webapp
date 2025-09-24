import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';

import PreviewLogsFilters from '../PreviewLogsFilters.vue';
import i18n from '@/utils/plugins/i18n';

vi.mock('lodash', () => ({
  debounce: vi.fn((fn) => fn),
}));

describe('PreviewLogsFilters.vue', () => {
  let wrapper;

  const filterButton = () => wrapper.find('[data-testid="filter-logs-button"]');
  const filtersSection = () =>
    wrapper.find('[data-testid="filter-logs-fields"]');
  const searchInput = () =>
    wrapper.findComponent('[data-testid="logs-search-input"]');
  const categoryFilter = () =>
    wrapper.findComponent('[data-testid="logs-category-filter"]');
  const filterIcon = () =>
    wrapper.findComponent('[data-testid="filter-logs-icon"]');

  const mockLogs = [
    { id: 1, message: 'Test log 1', category: 'knowledge' },
    { id: 2, message: 'Test log 2', category: 'thinking' },
    { id: 3, message: 'Test log 3', category: 'tool' },
  ];

  beforeEach(() => {
    wrapper = shallowMount(PreviewLogsFilters, {
      props: {
        logs: mockLogs,
      },
      global: {
        stubs: {
          UnnnicIntelligenceText: {
            template: '<p><slot /></p>',
          },
        },
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders correctly when logs are provided', () => {
      expect(wrapper.exists()).toBe(true);
      expect(filterButton().exists()).toBe(true);
    });

    it('does not render when logs array is empty', async () => {
      await wrapper.setProps({ logs: [] });
      expect(
        wrapper.find('[data-testid="preview-details-logs"]').exists(),
      ).toBe(false);
    });

    it('renders filter button with correct text', () => {
      const filterButtonText = filterButton();
      expect(filterButtonText.text()).toBe(
        i18n.global.t('agent_builder.traces.filter_logs.title'),
      );
    });

    it('renders search input with correct placeholder', () => {
      expect(searchInput().props('placeholder')).toBe(
        i18n.global.t('agent_builder.traces.filter_logs.placeholder'),
      );
    });

    it('renders category filter', () => {
      expect(categoryFilter().exists()).toBe(true);
    });
  });

  describe('Filter toggle functionality', () => {
    it('initially hides the filters section', () => {
      expect(filtersSection().isVisible()).toBe(false);
    });

    it('shows filters section when filter button is clicked', async () => {
      await filterButton().trigger('click');
      expect(wrapper.vm.showFilters).toBe(true);
    });

    it('toggles filter icon rotation when expanded', async () => {
      expect(filterIcon().classes()).not.toContain(
        'filter-button__icon--expanded',
      );

      await filterButton().trigger('click');
      expect(filterIcon().classes()).toContain('filter-button__icon--expanded');
    });

    it('adds expanded class to filter button when expanded', async () => {
      expect(filterButton().classes()).not.toContain(
        'header__filter-button--expanded',
      );

      await filterButton().trigger('click');
      expect(filterButton().classes()).toContain(
        'header__filter-button--expanded',
      );
    });
  });

  describe('Search functionality', () => {
    beforeEach(async () => {
      await filterButton().trigger('click');
    });

    it('updates searchTerm when input value changes', async () => {
      expect(wrapper.vm.searchTerm).toBe('');
      await searchInput().setValue('test search');
      expect(wrapper.vm.searchTerm).toBe('test search');
    });

    it('emits filters-changed event when search term changes', async () => {
      await searchInput().setValue('test search');
      await nextTick();

      expect(wrapper.emitted('filters-changed')).toBeTruthy();
      expect(wrapper.emitted('filters-changed')[0][0]).toEqual({
        searchTerm: 'test search',
        selectedCategories: [],
      });
    });
  });

  describe('Category filter functionality', () => {
    beforeEach(async () => {
      await filterButton().trigger('click');
    });

    it('has correct category options', () => {
      const expectedCategories = [
        'knowledge',
        'thinking',
        'delegating_to_agent',
        'forwarding_to_manager',
        'tool',
        'sending_final_response',
        'sending_response_for_manager',
        'applying_guardrails',
      ];

      const categoryOptions = wrapper.vm.categoryOptions;

      expect(categoryOptions[0]).toEqual({
        value: '',
        label: i18n.global.t(
          'agent_builder.traces.filter_logs.categories.placeholder',
        ),
      });

      expectedCategories.forEach((category, index) => {
        expect(categoryOptions[index + 1]).toEqual({
          value: category,
          label: i18n.global.t(
            `agent_builder.traces.filter_logs.categories.${category}`,
          ),
        });
      });
    });

    it('emits filters-changed event when categories change', async () => {
      const testCategories = [{ value: 'knowledge' }, { value: 'thinking' }];
      wrapper.vm.selectedCategories = testCategories;
      await nextTick();

      expect(wrapper.emitted('filters-changed')).toBeTruthy();
      const lastEmittedEvent = wrapper
        .emitted('filters-changed')
        .slice(-1)[0][0];
      expect(lastEmittedEvent.selectedCategories).toEqual([
        'knowledge',
        'thinking',
      ]);
    });
  });

  describe('Event emissions', () => {
    it('emits filters-changed with correct structure', async () => {
      await filterButton().trigger('click');
      await searchInput().setValue('test');
      wrapper.vm.selectedCategories = [{ value: 'knowledge' }];
      await nextTick();

      const emittedEvent = wrapper.emitted('filters-changed').slice(-1)[0][0];
      expect(emittedEvent).toEqual({
        searchTerm: 'test',
        selectedCategories: ['knowledge'],
      });
    });

    it('emits filters-changed when logs prop changes', async () => {
      const newLogs = [
        ...mockLogs,
        { id: 4, message: 'New log', category: 'tool' },
      ];
      await wrapper.setProps({ logs: newLogs });

      expect(wrapper.emitted('filters-changed')).toBeTruthy();
    });
  });

  describe('Computed properties', () => {
    it('computes categoryOptions correctly', () => {
      const options = wrapper.vm.categoryOptions;

      expect(options.length).toBe(9);
      expect(options[0].value).toBe('');
      expect(options[1].value).toBe('knowledge');
      expect(options[2].value).toBe('thinking');
    });
  });

  describe('Component state management', () => {
    it('initializes with correct default values', () => {
      expect(wrapper.vm.searchTerm).toBe('');
      expect(wrapper.vm.selectedCategories).toEqual([]);
      expect(wrapper.vm.showFilters).toBe(false);
    });

    it('maintains state when filters are toggled', async () => {
      await filterButton().trigger('click');
      await searchInput().setValue('persistent search');
      wrapper.vm.selectedCategories = [{ value: 'knowledge' }];

      await filterButton().trigger('click');
      await filterButton().trigger('click');

      expect(wrapper.vm.searchTerm).toBe('persistent search');
      expect(wrapper.vm.selectedCategories).toEqual([{ value: 'knowledge' }]);
    });
  });

  describe('Transition behavior', () => {
    it('applies correct transition classes', async () => {
      expect(filtersSection().classes()).toContain('filters__fields');

      await filterButton().trigger('click');
      expect(wrapper.find('.filters-slide-enter-active')).toBeDefined();
    });
  });
});
