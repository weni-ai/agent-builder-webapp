import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import InstructionsCategorization from '../index.vue';
import InstructionsResultsCount from '../InstructionsResultsCount.vue';
import ModalRemoveCategory from '@/components/Instructions/ModalRemoveCategory.vue';
import { useInstructionsStore } from '@/store/Instructions';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: { categorizationOfInstructions: true },
  }),
}));

const viewT = (key) => i18n.global.t(`agents.instructions.view.${key}`);

describe('InstructionsCategorization/index.vue', () => {
  let wrapper;
  let instructionsStore;

  const SELECTORS = {
    search: '[data-testid="instructions-search"]',
    segmented: '[data-testid="instructions-view-segmented"]',
    triggerCategories: '[data-testid="instructions-view-trigger-categories"]',
    triggerList: '[data-testid="instructions-view-trigger-list"]',
    categoriesView: '[data-testid="instructions-categories-view"]',
    listView: '[data-testid="instructions-list-view"]',
    loading: '[data-testid="instructions-loading"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const createWrapper = (instructionsState = {}, view = 'categories') => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          instructions: { data: [], status: 'complete', ...instructionsState },
          activeInstructionsView: view,
          searchTerm: '',
        },
      },
    });

    instructionsStore = useInstructionsStore();

    return shallowMount(InstructionsCategorization, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicTabs: { template: '<div v-bind="$attrs"><slot /></div>' },
          SegmentedControlList: { template: '<div><slot /></div>' },
          SegmentedControlTrigger: {
            inheritAttrs: false,
            template: '<button v-bind="$attrs"><slot /></button>',
          },
        },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('Toolbar rendering', () => {
    it('renders the search input with the localized placeholder', () => {
      expect(find('search').exists()).toBe(true);
      expect(findComponent('search').props('placeholder')).toBe(
        viewT('search_placeholder'),
      );
    });

    it('renders both segmented control triggers with localized labels', () => {
      expect(find('triggerCategories').text()).toBe(
        viewT('segmented.categories'),
      );
      expect(find('triggerList').text()).toBe(viewT('segmented.list'));
    });

    it('renders the categories view by default', () => {
      expect(find('categoriesView').exists()).toBe(true);
      expect(find('listView').exists()).toBe(false);
    });

    it('renders the shared results count above the views', () => {
      expect(wrapper.findComponent(InstructionsResultsCount).exists()).toBe(
        true,
      );
    });

    it('renders the list view when the list view is active', () => {
      wrapper = createWrapper({}, 'list');

      expect(find('listView').exists()).toBe(true);
      expect(find('categoriesView').exists()).toBe(false);
    });
  });

  describe('Delete category', () => {
    const removeModal = () => wrapper.findComponent(ModalRemoveCategory);

    it('does not render the remove category modal by default', () => {
      expect(removeModal().exists()).toBe(false);
    });

    it('opens the remove category modal with the selected category', async () => {
      await findComponent('categoriesView').vm.$emit('delete-category', {
        key: 'category-10',
        categoryId: 10,
        label: 'Sales',
      });

      expect(removeModal().exists()).toBe(true);
      expect(removeModal().props('category')).toEqual({
        id: 10,
        name: 'Sales',
      });
    });

    it('unmounts the remove category modal when it closes', async () => {
      await findComponent('categoriesView').vm.$emit('delete-category', {
        key: 'category-10',
        categoryId: 10,
        label: 'Sales',
      });

      expect(removeModal().exists()).toBe(true);

      await removeModal().vm.$emit('update:model-value', false);

      expect(removeModal().exists()).toBe(false);
    });
  });

  describe('View toggle', () => {
    it('updates the active view in the store when the segmented control changes', async () => {
      await findComponent('segmented').vm.$emit('update:modelValue', 'list');

      expect(instructionsStore.activeInstructionsView).toBe('list');
    });
  });

  describe('Search', () => {
    it('binds the search input to the store search term', async () => {
      await findComponent('search').vm.$emit('update:modelValue', 'tracking');

      expect(instructionsStore.searchTerm).toBe('tracking');
    });
  });

  describe('Loading instructions', () => {
    it('loads instructions on mount when status is null', () => {
      wrapper = createWrapper({ status: null });

      expect(instructionsStore.loadInstructions).toHaveBeenCalledTimes(1);
    });

    it('does not load instructions when they are already loaded', () => {
      expect(instructionsStore.loadInstructions).not.toHaveBeenCalled();
    });

    it('renders the shared loading state and hides the views while loading', () => {
      wrapper = createWrapper({ status: 'loading' });

      expect(find('loading').exists()).toBe(true);
      expect(find('categoriesView').exists()).toBe(false);
      expect(find('listView').exists()).toBe(false);
    });
  });
});
