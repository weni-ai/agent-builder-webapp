import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import ListView from '../ListView.vue';
import ListInstructionRow from '../ListInstructionRow.vue';
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

describe('ListView.vue', () => {
  let wrapper;

  const SELECTORS = {
    columns: '[data-testid="list-view-columns"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const createWrapper = ({ instructionsState = {} } = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          instructions: { data: [], status: 'complete' },
          categories: [],
          searchTerm: '',
          ...instructionsState,
        },
      },
    });

    useInstructionsStore();

    return shallowMount(ListView, {
      global: { plugins: [pinia] },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the column headers with localized labels', () => {
    wrapper = createWrapper();

    expect(find('columns').text()).toContain(viewT('list_columns.instruction'));
    expect(find('columns').text()).toContain(viewT('list_columns.category'));
  });

  it('renders a row for every flat instruction', () => {
    wrapper = createWrapper({
      instructionsState: {
        instructions: {
          data: [
            { id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } },
            { id: 2, text: 'Loose B', category: null },
          ],
          status: 'complete',
        },
        categories: [{ id: 10, name: 'Sales' }],
      },
    });

    // 2 custom/uncategorized rows + the mocked default instructions
    expect(
      wrapper.findAllComponents(ListInstructionRow).length,
    ).toBeGreaterThanOrEqual(2);
    expect(wrapper.find('[data-testid="list-view-row-1"]').exists()).toBe(true);
  });

  it('forwards the edit event from a row', async () => {
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

    const row = { id: 1 };
    await wrapper.findComponent(ListInstructionRow).vm.$emit('edit', row);

    expect(wrapper.emitted('edit')).toEqual([[row]]);
  });
});
