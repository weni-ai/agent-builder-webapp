import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import AIAnalysis from '../AIAnalysis.vue';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: { categorizationOfInstructions: true },
  }),
}));

const childStub = {
  template: '<div />',
};

const aiAnalysisT = (key) =>
  i18n.global.t(
    `agents.instructions.new_instruction_drawer.ai_analysis.${key}`,
  );

describe('NewInstructionDrawer/AIAnalysis.vue', () => {
  let wrapper;

  const SELECTORS = {
    loading: '[data-testid="ai-analysis-loading"]',
    error: '[data-testid="ai-analysis-error"]',
    errorIcon: '[data-testid="ai-analysis-error-icon"]',
    errorText: '[data-testid="ai-analysis-error-text"]',
    results: '[data-testid="ai-analysis-results"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const createWrapper = (suggestedByAI = {}) => {
    const pinia = createTestingPinia({
      stubActions: false,
      initialState: {
        Instructions: {
          instructionSuggestedByAI: {
            data: {
              instruction: '',
              classification: [],
              suggestion: '',
              suggested_category: '',
            },
            suggestionApplied: '',
            status: null,
            ...suggestedByAI,
          },
        },
      },
    });

    return shallowMount(AIAnalysis, {
      global: {
        plugins: [pinia],
        stubs: {
          SuggestedCategory: childStub,
          IssuesFound: childStub,
          SuggestedRewrite: childStub,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Loading state', () => {
    it('renders only the loading section when status is loading', () => {
      wrapper = createWrapper({ status: 'loading' });

      expect(find('loading').exists()).toBe(true);
      expect(find('error').exists()).toBe(false);
      expect(find('results').exists()).toBe(false);
    });
  });

  describe('Error state', () => {
    beforeEach(() => {
      wrapper = createWrapper({ status: 'error' });
    });

    it('renders only the error section when status is error', () => {
      expect(find('error').exists()).toBe(true);
      expect(find('loading').exists()).toBe(false);
      expect(find('results').exists()).toBe(false);
    });

    it('renders the error icon with the critical scheme', () => {
      const icon = find('errorIcon');

      expect(icon.exists()).toBe(true);
      expect(icon.attributes('icon')).toBe('cancel');
      expect(icon.attributes('scheme')).toBe('fg-critical');
    });

    it('renders the error message', () => {
      expect(find('errorText').text()).toBe(aiAnalysisT('error'));
    });
  });

  describe('Complete state', () => {
    it('renders only the results section when status is complete', () => {
      wrapper = createWrapper({ status: 'complete' });

      expect(find('results').exists()).toBe(true);
      expect(find('loading').exists()).toBe(false);
      expect(find('error').exists()).toBe(false);
    });
  });

  describe('Idle state', () => {
    it('renders none of the status sections when status is null', () => {
      wrapper = createWrapper({ status: null });

      expect(find('loading').exists()).toBe(false);
      expect(find('error').exists()).toBe(false);
      expect(find('results').exists()).toBe(false);
    });
  });
});
