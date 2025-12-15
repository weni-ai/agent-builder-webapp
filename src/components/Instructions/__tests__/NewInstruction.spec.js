import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import NewInstruction from '../NewInstruction.vue';
import i18n from '@/utils/plugins/i18n';
import { createTestingPinia } from '@pinia/testing';
import { useInstructionsStore } from '@/store/Instructions';

describe('NewInstruction.vue', () => {
  let wrapper;
  let instructionsStore;

  const pinia = createTestingPinia({
    initialState: {
      Instructions: {
        instructions: {
          data: [],
        },
        newInstruction: {
          text: '',
          status: null,
        },
        validateInstructionByAI: true,
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    instructionsStore = useInstructionsStore(pinia);

    wrapper = shallowMount(NewInstruction, {
      global: {
        plugins: [pinia],
      },
    });
  });

  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);
  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const translation = (key) =>
    i18n.global.t(`agent_builder.instructions.new_instruction.${key}`);

  const SELECTORS = {
    container: '[data-testid="new-instruction"]',
    title: '[data-testid="new-instruction-title"]',
    header: '[data-testid="new-instruction-header"]',
    switchValidateInstructionByAI:
      '[data-testid="new-instruction-switch-validate-instruction-by-ai"]',
    textarea: '[data-testid="new-instruction-textarea"]',
    addButton: '[data-testid="add-instruction-button"]',
    modalValidateInstruction:
      '[data-testid="modal-validate-instruction-by-ai"]',
  };

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders a title, description, textarea and add instruction button', () => {
      expect(find('container').exists()).toBe(true);
      expect(find('title').exists()).toBe(true);
      expect(find('header').exists()).toBe(true);
      expect(findComponent('switchValidateInstructionByAI').exists()).toBe(
        true,
      );
      expect(findComponent('textarea').exists()).toBe(true);
      expect(findComponent('addButton').exists()).toBe(true);
      expect(findComponent('modalValidateInstruction').exists()).toBe(false);
    });

    describe('Title rendering', () => {
      it('renders the correct title', () => {
        expect(find('title').text()).toBe(translation('title'));
      });
    });

    describe('Switch rendering', () => {
      it('renders the correct switch', () => {
        expect(
          findComponent('switchValidateInstructionByAI').props('modelValue'),
        ).toBe(true);
        expect(
          findComponent('switchValidateInstructionByAI').props('textRight'),
        ).toBe(translation('validate_instruction_by_ai.switch'));
      });
    });

    describe('Textarea rendering', () => {
      it('provides the correct props to textarea', () => {
        expect(findComponent('textarea').props('placeholder')).toBe(
          translation('textarea.placeholder'),
        );
        expect(findComponent('textarea').props('message')).toBe(
          translation('textarea.description'),
        );
      });
    });

    describe('Add button rendering', () => {
      it('disables the button when the textarea is empty', () => {
        expect(findComponent('addButton').props('disabled')).toBe(true);
      });
    });

    describe('User interaction', () => {
      it('switches the validate instruction by AI state when the switch is toggled', async () => {
        const switchComponent = findComponent('switchValidateInstructionByAI');
        expect(switchComponent.props('modelValue')).toBe(true);
        await switchComponent.vm.$emit('update:modelValue', false);
        expect(
          instructionsStore.updateValidateInstructionByAI,
        ).toHaveBeenCalledWith(false);
      });

      it('adds an instruction when the primary button is clicked when validate instruction by AI is disabled', async () => {
        instructionsStore.validateInstructionByAI = false;
        await findComponent('addButton').vm.$emit('click');
        expect(instructionsStore.addInstruction).toHaveBeenCalledWith();
      });

      it('does not add instruction when the primary button is clicked when validate instruction by AI is enabled', async () => {
        instructionsStore.validateInstructionByAI = true;
        await findComponent('addButton').vm.$emit('click');
        expect(instructionsStore.addInstruction).not.toHaveBeenCalled();
      });

      it('opens the modal validate instruction when the primary button is clicked when validate instruction by AI is enabled', async () => {
        expect(findComponent('modalValidateInstruction').exists()).toBe(false);
        instructionsStore.validateInstructionByAI = true;
        await findComponent('addButton').vm.$emit('click');
        expect(findComponent('modalValidateInstruction').exists()).toBe(true);
      });
    });
  });
});
