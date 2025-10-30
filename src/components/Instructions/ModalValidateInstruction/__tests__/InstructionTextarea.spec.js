import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import InstructionTextarea from '../InstructionTextarea.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('InstructionTextarea.vue', () => {
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
    container: '[data-testid="modal-validate-instruction-textarea"]',
    instructionTextarea: '[data-testid="instruction-textarea"]',
    revalidateButton: '[data-testid="revalidate-button"]',
  };
  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);

  beforeEach(() => {
    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.getInstructionSuggestionByAI = vi.fn().mockResolvedValue({
      status: 'complete',
    });

    wrapper = mount(InstructionTextarea, {
      props: {
        modelValue: 'Initial text',
      },
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

    it('renders the container wrapper', () => {
      expect(find('container').exists()).toBe(true);
      expect(find('container').classes()).toContain(
        'modal-validate-instruction__textarea',
      );
    });

    it('renders the textarea with correct placeholder', () => {
      const instructionTextarea = findComponent('instructionTextarea');
      expect(instructionTextarea.exists()).toBe(true);
      expect(instructionTextarea.props('placeholder')).toBe(
        i18n.global.t(
          'agent_builder.instructions.new_instruction.textarea.placeholder',
        ),
      );
    });

    it('renders the revalidate button with correct text', () => {
      const revalidateButton = findComponent('revalidateButton');
      expect(revalidateButton.exists()).toBe(true);
      expect(revalidateButton.text()).toBe(
        i18n.global.t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.re-validate_button',
        ),
      );
    });
  });

  describe('v-model binding', () => {
    it('displays the initial modelValue in textarea', () => {
      expect(findComponent('instructionTextarea').props('modelValue')).toBe(
        'Initial text',
      );
    });

    it('emits update:modelValue when textarea value changes', async () => {
      const instructionTextarea = findComponent('instructionTextarea');
      await instructionTextarea.setValue('Updated text');

      expect(instructionTextarea.emitted('update:modelValue')).toBeTruthy();
      expect(instructionTextarea.emitted('update:modelValue')[0]).toEqual([
        'Updated text',
      ]);
    });
  });

  describe('Button disabled states', () => {
    it('disables button when modelValue is empty', async () => {
      await wrapper.setProps({ modelValue: '' });

      expect(findComponent('revalidateButton').props('disabled')).toBe(true);
    });

    it('disables button when modelValue is only whitespace', async () => {
      await wrapper.setProps({ modelValue: '   ' });

      expect(findComponent('revalidateButton').props('disabled')).toBe(true);
    });

    it('disables button when modelValue equals newInstruction.text', async () => {
      await wrapper.setProps({ modelValue: 'Test instruction text' });

      expect(findComponent('revalidateButton').props('disabled')).toBe(true);
    });

    it('disables button when trimmed modelValue equals trimmed newInstruction.text', async () => {
      await wrapper.setProps({ modelValue: '  Test instruction text  ' });

      expect(findComponent('revalidateButton').props('disabled')).toBe(true);
    });

    it('enables button when modelValue has valid different text', async () => {
      await wrapper.setProps({ modelValue: 'Different instruction text' });

      expect(findComponent('revalidateButton').props('disabled')).toBe(false);
    });
  });

  describe('Button loading states', () => {
    it('shows loading state when instructionSuggestedByAI status is loading', async () => {
      instructionsStore.instructionSuggestedByAI.status = 'loading';
      await wrapper.vm.$nextTick();

      expect(findComponent('revalidateButton').props('loading')).toBe(true);
    });

    it('does not show loading state when instructionSuggestedByAI status is not loading', async () => {
      instructionsStore.instructionSuggestedByAI.status = null;
      await wrapper.vm.$nextTick();

      expect(findComponent('revalidateButton').props('loading')).toBe(false);
    });

    it('does not show loading state when instructionSuggestedByAI status is complete', async () => {
      instructionsStore.instructionSuggestedByAI.status = 'complete';
      await wrapper.vm.$nextTick();

      expect(findComponent('revalidateButton').props('loading')).toBe(false);
    });
  });

  describe('Revalidate functionality', () => {
    it('calls getInstructionSuggestionByAI when button is clicked', async () => {
      await wrapper.setProps({ modelValue: 'Different text' });
      await findComponent('revalidateButton').trigger('click');

      expect(
        instructionsStore.getInstructionSuggestionByAI,
      ).toHaveBeenCalledTimes(1);
    });

    it('does not call getInstructionSuggestionByAI when button is disabled', async () => {
      await wrapper.setProps({ modelValue: '' });
      vi.clearAllMocks();

      const revalidateButton = findComponent('revalidateButton');
      expect(revalidateButton.props('disabled')).toBe(true);

      await revalidateButton.trigger('click');

      expect(
        instructionsStore.getInstructionSuggestionByAI,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Computed property revalidateButtonTextDisabled', () => {
    it('returns true when modelValue is undefined', async () => {
      await wrapper.setProps({ modelValue: undefined });

      expect(findComponent('revalidateButton').props('disabled')).toBe(true);
    });

    it('returns true when modelValue is null', async () => {
      await wrapper.setProps({ modelValue: null });

      expect(findComponent('revalidateButton').props('disabled')).toBe(true);
    });

    it('returns false when modelValue has valid different text', async () => {
      await wrapper.setProps({ modelValue: 'Completely different text' });

      expect(findComponent('revalidateButton').props('disabled')).toBe(false);
    });
  });
});
