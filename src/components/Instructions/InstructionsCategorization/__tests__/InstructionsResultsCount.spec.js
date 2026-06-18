import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import InstructionsResultsCount from '../InstructionsResultsCount.vue';
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

describe('InstructionsResultsCount.vue', () => {
  let wrapper;

  const SELECTOR = '[data-testid="instructions-results-count"]';
  const find = () => wrapper.find(SELECTOR);

  const createWrapper = (instructionsState = {}) => {
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

    return shallowMount(InstructionsResultsCount, {
      global: { plugins: [pinia] },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('shows the matching instructions count while searching', () => {
    wrapper = createWrapper({
      instructions: {
        data: [
          { id: 1, text: 'unicorn alpha', category: { id: 10, name: 'Sales' } },
          { id: 2, text: 'unicorn beta', category: { id: 10, name: 'Sales' } },
        ],
        status: 'complete',
      },
      categories: [{ id: 10, name: 'Sales' }],
      searchTerm: 'unicorn',
    });

    expect(find().text()).toBe(
      i18n.global.t('agents.instructions.view.results_count', { count: 2 }),
    );
  });

  it('shows the no-results message when the search has no matches', () => {
    wrapper = createWrapper({
      instructions: { data: [], status: 'complete' },
      categories: [],
      searchTerm: 'no-match-term',
    });

    expect(find().text()).toBe(
      i18n.global.t('agents.instructions.view.results_count', { count: 0 }),
    );
  });

  it('renders nothing when not searching', () => {
    wrapper = createWrapper({
      instructions: {
        data: [{ id: 1, text: 'Sales A', category: { id: 10, name: 'Sales' } }],
        status: 'complete',
      },
      categories: [{ id: 10, name: 'Sales' }],
    });

    expect(find().exists()).toBe(false);
  });
});
