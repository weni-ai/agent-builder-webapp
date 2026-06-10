import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import CategoriesView from '../CategoriesView.vue';
import CategoryAccordion from '../CategoryAccordion.vue';
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

describe('CategoriesView.vue', () => {
  let wrapper;

  const SELECTORS = {
    loading: '[data-testid="categories-view-loading"]',
    empty: '[data-testid="categories-view-empty"]',
    resultsCount: '[data-testid="categories-view-results-count"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const createWrapper = ({ instructionsState = {}, props = {} } = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          instructions: { data: [], status: 'complete' },
          categories: [],
          searchTerm: '',
          activeInstructionsView: 'categories',
          ...instructionsState,
        },
      },
    });

    useInstructionsStore();

    return shallowMount(CategoriesView, {
      props,
      global: { plugins: [pinia] },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders skeleton loaders while loading', () => {
    wrapper = createWrapper({ props: { isLoading: true } });

    expect(find('loading').exists()).toBe(true);
    expect(wrapper.findAllComponents(CategoryAccordion)).toHaveLength(0);
  });

  it('renders an accordion for each group from the store', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
          ],
          status: 'complete',
        },
        categories: [{ id: 10, name: 'Sales' }],
      },
    });

    const accordions = wrapper.findAllComponents(CategoryAccordion);
    expect(accordions).toHaveLength(2);
    expect(
      wrapper
        .find('[data-testid="categories-view-group-category-10"]')
        .exists(),
    ).toBe(true);
  });

  it('shows the no-results count message when the search has no matches', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: { data: [], status: 'complete' },
        categories: [],
        searchTerm: 'no-match-term',
      },
    });

    expect(find('resultsCount').text()).toBe(
      i18n.global.t('agents.instructions.view.results_count', { count: 0 }),
    );
    expect(find('empty').exists()).toBe(false);
    expect(wrapper.findAllComponents(CategoryAccordion)).toHaveLength(0);
  });

  it('expands only the first group by default and does not force expansion', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
            { id: 2, text: 'Support A', category: { id: 20, name: 'Support' } },
          ],
          status: 'complete',
        },
        categories: [
          { id: 10, name: 'Sales' },
          { id: 20, name: 'Support' },
        ],
      },
    });

    const accordions = wrapper.findAllComponents(CategoryAccordion);
    expect(accordions[0].props('initiallyExpanded')).toBe(true);
    expect(
      accordions.slice(1).every((a) => a.props('initiallyExpanded') === false),
    ).toBe(true);
    expect(accordions.every((a) => a.props('forceExpanded') === false)).toBe(
      true,
    );
  });

  it('shows the results count and forces groups expanded while searching', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            {
              id: 1,
              text: 'unicorn alpha',
              category: { id: 10, name: 'Sales' },
            },
            {
              id: 2,
              text: 'unicorn beta',
              category: { id: 10, name: 'Sales' },
            },
          ],
          status: 'complete',
        },
        categories: [{ id: 10, name: 'Sales' }],
        searchTerm: 'unicorn',
      },
    });

    expect(find('resultsCount').text()).toBe(
      i18n.global.t('agents.instructions.view.results_count', { count: 2 }),
    );
    expect(
      wrapper
        .findAllComponents(CategoryAccordion)
        .every((a) => a.props('forceExpanded') === true),
    ).toBe(true);
  });

  it('does not show the results count when not searching', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
          ],
          status: 'complete',
        },
        categories: [{ id: 10, name: 'Sales' }],
      },
    });

    expect(find('resultsCount').exists()).toBe(false);
  });

  it('forwards the delete-category event from an accordion', async () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
          ],
          status: 'complete',
        },
        categories: [{ id: 10, name: 'Sales' }],
      },
    });

    const group = { key: 'category-10' };
    await wrapper
      .findComponent(CategoryAccordion)
      .vm.$emit('delete-category', group);

    expect(wrapper.emitted('delete-category')).toEqual([[group]]);
  });
});
