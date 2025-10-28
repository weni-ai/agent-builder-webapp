import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import ModalValidateInstruction from '../index.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('ModalValidateInstruction.vue', () => {
  let wrapper;
  let instructionsStore;

  const pinia = createTestingPinia({
    initialState: {
      Instructions: {
        newInstruction: {
          text: 'Test instruction text',
          status: null,
        },
        instructionSuggestedByAI: {
          data: {
            instruction: '',
            classification: '',
            reason: '',
            suggestion: '',
          },
          status: null,
        },
      },
    },
  });

  const SELECTORS = {
    modal: '[data-testid="modal-validate-instruction-by-ai"]',
    instructionTextarea: '[data-testid="modal-validate-instruction-textarea"]',
    instructionDivider: '[data-testid="modal-validate-instruction-divider"]',
    instructionValidationResults:
      '[data-testid="modal-validate-instruction-validation-results"]',
  };
  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);

  beforeEach(() => {
    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.addInstruction = vi.fn().mockResolvedValue({
      status: 'complete',
    });
    instructionsStore.getInstructionSuggestionByAI = vi.fn().mockResolvedValue({
      status: 'complete',
    });

    wrapper = mount(ModalValidateInstruction, {
      props: {
        modelValue: true,
      },
      global: {
        plugins: [pinia, i18n],
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

    it('renders the modal with correct props', () => {
      const modal = findComponent('modal');
      expect(modal.exists()).toBe(true);
      expect(modal.props('modelValue')).toBe(true);
      expect(modal.props('title')).toBe(
        i18n.global.t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.modal_title',
        ),
      );
      expect(modal.props('showCloseIcon')).toBe(true);
      expect(modal.props('showActionsDivider')).toBe(true);
      expect(modal.props('size')).toBe('lg');
    });

    it('renders the correct button props', () => {
      const modal = findComponent('modal');
      expect(modal.props('secondaryButtonProps').text).toBe(
        i18n.global.t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.cancel_button',
        ),
      );

      expect(modal.props('primaryButtonProps').text).toBe(
        i18n.global.t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.publish_button',
        ),
      );
      expect(modal.props('primaryButtonProps').disabled).toBe(false);
      expect(modal.props('primaryButtonProps').loading).toBe(false);
    });

    it('renders the instruction textarea with correct props', () => {
      const instructionTextarea = findComponent('instructionTextarea');
      expect(instructionTextarea.exists()).toBe(true);
      expect(instructionTextarea.props('modelValue')).toBe(
        instructionsStore.newInstruction.text,
      );
    });

    describe('Validation results rendering', () => {
      it('renders the instruction divider', () => {
        const instructionDivider = findComponent('instructionDivider');
        expect(instructionDivider.exists()).toBe(true);
      });

      it('renders the instruction validation results with correct props', () => {
        const instructionValidationResults = findComponent(
          'instructionValidationResults',
        );
        expect(instructionValidationResults.exists()).toBe(true);
      });

      it('does not render the instruction validation results when the instruction suggested by AI status is error', async () => {
        instructionsStore.instructionSuggestedByAI.status = 'error';
        await wrapper.vm.$nextTick();
        expect(findComponent('instructionValidationResults').exists()).toBe(
          false,
        );
      });
    });
  });

  describe('Modal interactions', () => {
    it('emits update:modelValue when modal is closed via close icon', async () => {
      await findComponent('modal').vm.$emit('update:model-value', false);

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('emits update:modelValue when secondary button is clicked', async () => {
      const modal = findComponent('modal');
      await modal.props('secondaryButtonProps').onClick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
  });

  describe('Publish instruction functionality', () => {
    it('calls addInstruction when primary button is clicked', async () => {
      const modal = findComponent('modal');
      await modal.props('primaryButtonProps').onClick();

      expect(instructionsStore.addInstruction).toHaveBeenCalled();
    });

    it('updates newInstruction.text before calling addInstruction', async () => {
      const modal = findComponent('modal');
      const newText = 'Updated instruction text';
      wrapper.vm.newInstruction = newText;

      await modal.props('primaryButtonProps').onClick();

      expect(instructionsStore.newInstruction.text).toBe(newText);
      expect(instructionsStore.addInstruction).toHaveBeenCalled();
    });
  });

  describe('Button disabled states', () => {
    it('disables primary button when instructionSuggestedByAI status is loading', async () => {
      instructionsStore.instructionSuggestedByAI.status = 'loading';
      await wrapper.vm.$nextTick();

      const modal = findComponent('modal');
      expect(modal.props('primaryButtonProps').disabled).toBe(true);
    });

    it('disables primary button when newInstruction is empty', async () => {
      wrapper.vm.newInstruction = '';
      await wrapper.vm.$nextTick();

      const modal = findComponent('modal');
      expect(modal.props('primaryButtonProps').disabled).toBe(true);
    });

    it('disables primary button when newInstruction is only whitespace', async () => {
      wrapper.vm.newInstruction = '   ';
      await wrapper.vm.$nextTick();

      const modal = findComponent('modal');
      expect(modal.props('primaryButtonProps').disabled).toBe(true);
    });

    it('enables primary button when newInstruction has valid text', async () => {
      instructionsStore.instructionSuggestedByAI.status = null;
      wrapper.vm.newInstruction = 'Valid instruction text';
      await wrapper.vm.$nextTick();

      const modal = findComponent('modal');
      expect(modal.props('primaryButtonProps').disabled).toBe(false);
    });
  });

  describe('Button loading states', () => {
    it('shows loading state on primary button when newInstruction status is loading', async () => {
      instructionsStore.newInstruction.status = 'loading';
      await wrapper.vm.$nextTick();

      const modal = findComponent('modal');
      expect(modal.props('primaryButtonProps').loading).toBe(true);
    });

    it('does not show loading state when newInstruction status is not loading', async () => {
      instructionsStore.newInstruction.status = null;
      await wrapper.vm.$nextTick();

      const modal = findComponent('modal');
      expect(modal.props('primaryButtonProps').loading).toBe(false);
    });
  });

  describe('onMounted behavior', () => {
    it('calls getInstructionSuggestionByAI when instruction is not suggested', () => {
      expect(instructionsStore.getInstructionSuggestionByAI).toHaveBeenCalled();
    });

    it('does not call getInstructionSuggestionByAI when instruction is already suggested', () => {
      vi.clearAllMocks();

      instructionsStore.instructionSuggestedByAI.data.instruction =
        'Test instruction text';
      instructionsStore.newInstruction.text = 'Test instruction text';

      wrapper = mount(ModalValidateInstruction, {
        props: {
          modelValue: true,
        },
      });

      expect(
        instructionsStore.getInstructionSuggestionByAI,
      ).not.toHaveBeenCalled();
    });
  });
});
