import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import Form from '../Form.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('NewInstructionDrawer/Form.vue', () => {
  let wrapper;
  let instructionsStore;

  const SELECTORS = {
    form: '[data-testid="new-instruction-drawer-form"]',
    textarea: '[data-testid="new-instruction-drawer-textarea"]',
    validateButton: '[data-testid="new-instruction-drawer-validate-button"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const translation = (key) =>
    i18n.global.t(`agents.instructions.new_instruction_drawer.${key}`);

  const createWrapper = (initialState = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          newInstruction: {
            text: '',
            status: null,
          },
          instructionSuggestedByAI: {
            status: null,
          },
          ...initialState,
        },
      },
    });

    instructionsStore = useInstructionsStore(pinia);

    return shallowMount(Form, {
      global: {
        plugins: [pinia],
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders the form, textarea and validate button', () => {
      expect(find('form').exists()).toBe(true);
      expect(find('textarea').exists()).toBe(true);
      expect(findComponent('validateButton').exists()).toBe(true);
    });

    it('renders the validate button with the correct text', () => {
      expect(findComponent('validateButton').props('text')).toBe(
        translation('validate'),
      );
    });

    it('binds the textarea value to the store newInstruction text', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'My instruction', status: null },
      });
      expect(find('textarea').element.value).toBe('My instruction');
    });
  });

  describe('Validate button states', () => {
    it('disables the validate button when the text is empty', () => {
      expect(findComponent('validateButton').props('disabled')).toBe(true);
    });

    it('disables the validate button when the text is only whitespace', () => {
      wrapper = createWrapper({
        newInstruction: { text: '   ', status: null },
      });
      expect(findComponent('validateButton').props('disabled')).toBe(true);
    });

    it('enables the validate button when the text has content and there is no suggestion status', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'Valid text', status: null },
      });
      expect(findComponent('validateButton').props('disabled')).toBe(false);
    });

    it('disables the validate button when the suggestion status is loading', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'Valid text', status: null },
        instructionSuggestedByAI: { status: 'loading' },
      });
      expect(findComponent('validateButton').props('disabled')).toBe(true);
    });

    it('disables the validate button when the suggestion status is complete', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'Valid text', status: null },
        instructionSuggestedByAI: { status: 'complete' },
      });
      expect(findComponent('validateButton').props('disabled')).toBe(true);
    });

    it('enables the validate button when the suggestion status is error and the text has content', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'Valid text', status: null },
        instructionSuggestedByAI: { status: 'error' },
      });
      expect(findComponent('validateButton').props('disabled')).toBe(false);
    });
  });

  describe('User interaction', () => {
    it('requests the AI suggestion with the current text when the form is submitted', async () => {
      wrapper = createWrapper({
        newInstruction: { text: 'Validate me', status: null },
      });

      await find('form').trigger('submit');

      expect(
        instructionsStore.getInstructionSuggestionByAI,
      ).toHaveBeenCalledWith('Validate me');
    });
  });

  describe('onMounted behavior', () => {
    it('focuses the textarea on mount', () => {
      const focusSpy = vi.spyOn(HTMLTextAreaElement.prototype, 'focus');

      wrapper = createWrapper();

      expect(focusSpy).toHaveBeenCalled();

      focusSpy.mockRestore();
    });
  });
});
