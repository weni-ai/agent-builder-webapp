import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import CategoriesView from '../CategoriesView.vue';
import CategoryAccordion from '../CategoryAccordion.vue';
import { useInstructionsStore } from '@/store/Instructions';

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

  it('forces groups expanded while searching', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            {
              id: 1,
              text: 'unicorn alpha',
              category: { id: 10, name: 'Sales' },
            },
          ],
          status: 'complete',
        },
        categories: [{ id: 10, name: 'Sales' }],
        searchTerm: 'unicorn',
      },
    });

    expect(
      wrapper
        .findAllComponents(CategoryAccordion)
        .every((a) => a.props('forceExpanded') === true),
    ).toBe(true);
  });

  it('forwards the edit event from an accordion', async () => {
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

    const instruction = { id: 1 };
    await wrapper
      .findComponent(CategoryAccordion)
      .vm.$emit('edit', instruction);

    expect(wrapper.emitted('edit')).toEqual([[instruction]]);
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
