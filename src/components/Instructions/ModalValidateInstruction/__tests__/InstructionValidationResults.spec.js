import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import InstructionValidationResults from '../InstructionValidationResults.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';
import { formatListToReadable } from '@/utils/formatters';

const SELECTORS = {
  title: '[data-testid="modal-validate-instruction-validation-results-title"]',
  loading:
    '[data-testid="modal-validate-instruction-validation-results-loading"]',
  toast: '[data-testid="modal-validate-instruction-validation-results-toast"]',
};

const MOCK_CLASSIFICATIONS = {
  duplicate: { name: 'duplicate', reason: 'Duplicate reason' },
  conflicting: { name: 'conflict', reason: 'Conflicts' },
  ambiguity: { name: 'ambiguity', reason: 'Ambiguity detected' },
  lackOfClarity: { name: 'lack_of_clarity', reason: 'Too vague' },
};

const getTranslation = (key) =>
  i18n.global.t(
    `agent_builder.instructions.new_instruction.validate_instruction_by_ai.results.${key}`,
  );

describe('InstructionValidationResults.vue', () => {
  let wrapper;
  let instructionsStore;
  let pinia;

  const setStoreStatus = async (status, classification = []) => {
    instructionsStore.instructionSuggestedByAI.status = status;
    instructionsStore.instructionSuggestedByAI.data.classification =
      classification;
    await wrapper.vm.$nextTick();
  };

  const findAllToasts = () => wrapper.findAllComponents(SELECTORS.toast);

  beforeEach(() => {
    pinia = createTestingPinia({
      initialState: {
        Instructions: {
          newInstruction: {
            text: 'Test instruction text',
            status: null,
          },
          instructionSuggestedByAI: {
            data: {
              instruction: '',
              classification: [],
              suggestion: '',
            },
            status: null,
          },
        },
      },
    });

    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.getInstructionSuggestionByAI = vi
      .fn()
      .mockResolvedValue({ status: 'complete' });

    wrapper = mount(InstructionValidationResults, {
      global: {
        plugins: [pinia],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders the title correctly', () => {
      const title = wrapper.find(SELECTORS.title);

      expect(title.exists()).toBe(true);
      expect(title.text()).toBe(getTranslation('title'));
    });
  });

  describe('Loading state', () => {
    it('renders loading skeleton when status is "loading"', async () => {
      await setStoreStatus('loading');

      expect(wrapper.find(SELECTORS.loading).exists()).toBe(true);
      expect(findAllToasts()).toHaveLength(0);
    });
  });

  describe('Success state', () => {
    it('renders success toast when status is "complete" and classification is empty', async () => {
      await setStoreStatus('complete', []);

      const toasts = findAllToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].props('type')).toBe('success');
      expect(toasts[0].props('title')).toBe(
        getTranslation('no_problems_found'),
      );
    });
  });

  describe('Warning state', () => {
    it('renders one warning toast when classification contains items and the title is the formatted list of the classification names', async () => {
      const classifications = [
        MOCK_CLASSIFICATIONS.duplicate,
        MOCK_CLASSIFICATIONS.conflicting,
        MOCK_CLASSIFICATIONS.ambiguity,
        MOCK_CLASSIFICATIONS.lackOfClarity,
      ];

      await setStoreStatus('complete', classifications);

      const toasts = findAllToasts();
      const expectedTitles = [
        getTranslation('duplicate'),
        getTranslation('conflicts'),
        getTranslation('ambiguity'),
        getTranslation('lack_of_clarity'),
      ];

      expect(toasts).toHaveLength(1);
      toasts.forEach((toast, index) => {
        expect(toast.props('type')).toBe('warning');
        expect(toast.props('title')).toBe(formatListToReadable(expectedTitles));
      });
    });

    it('renders the correct description for each warning toast', async () => {
      const classifications = [
        MOCK_CLASSIFICATIONS.duplicate,
        MOCK_CLASSIFICATIONS.ambiguity,
      ];

      await setStoreStatus('complete', classifications);

      const toasts = findAllToasts();
      expect(toasts[0].props('description')).toBe(
        MOCK_CLASSIFICATIONS.duplicate.reason,
      );
    });
  });

  describe('Empty state', () => {
    it('renders nothing when status is null', async () => {
      await setStoreStatus(null);

      expect(findAllToasts()).toHaveLength(0);
      expect(wrapper.find(SELECTORS.loading).exists()).toBe(false);
    });
  });

  describe('Reactivity', () => {
    it('updates toasts when classification array changes', async () => {
      await setStoreStatus('complete', []);

      expect(findAllToasts()).toHaveLength(1);
      expect(findAllToasts()[0].props('type')).toBe('success');

      await setStoreStatus('complete', [MOCK_CLASSIFICATIONS.conflicting]);

      const toasts = findAllToasts();
      expect(toasts).toHaveLength(1);
      expect(toasts[0].props('type')).toBe('warning');
      expect(toasts[0].props('title')).toBe(getTranslation('conflicts'));
    });
  });
});
