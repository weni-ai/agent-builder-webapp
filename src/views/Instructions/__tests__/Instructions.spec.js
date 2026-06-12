import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';

import Instructions from '../index.vue';

const mockFlags = { categorizationOfInstructions: false };

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    get flags() {
      return mockFlags;
    },
  }),
}));

describe('Instructions.vue', () => {
  let wrapper;

  const SELECTORS = {
    categorization: '[data-testid="instructions-categorization"]',
    newInstruction: '[data-testid="new-instruction"]',
    instructionsSection: '[data-testid="instructions-section"]',
  };

  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);

  const createWrapper = (categorizationOfInstructions) => {
    mockFlags.categorizationOfInstructions = categorizationOfInstructions;

    return shallowMount(Instructions);
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('When categorization flag is disabled', () => {
    beforeEach(() => {
      wrapper = createWrapper(false);
    });

    it('renders the legacy new instruction and instructions section', () => {
      expect(findComponent('newInstruction').exists()).toBe(true);
      expect(findComponent('instructionsSection').exists()).toBe(true);
    });

    it('does not render the categorization layout', () => {
      expect(findComponent('categorization').exists()).toBe(false);
    });
  });

  describe('When categorization flag is enabled', () => {
    beforeEach(() => {
      wrapper = createWrapper(true);
    });

    it('renders the categorization layout', () => {
      expect(findComponent('categorization').exists()).toBe(true);
    });

    it('does not render the legacy components', () => {
      expect(findComponent('newInstruction').exists()).toBe(false);
      expect(findComponent('instructionsSection').exists()).toBe(false);
    });
  });
});
