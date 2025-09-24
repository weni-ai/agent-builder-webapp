import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import ModalRemoveInstruction from '../ModalRemoveInstruction.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('ModalRemoveInstruction.vue', () => {
  let wrapper;
  let instructionsStore;

  const pinia = createTestingPinia({
    initialState: {
      Instructions: {
        instructions: {
          data: [],
        },
      },
    },
  });

  const mockInstruction = {
    id: 'test-instruction-id',
    text: 'Test instruction text',
    status: null,
  };

  const SELECTORS = {
    modal: '[data-testid="modal"]',
    description: '[data-testid="description"]',
  };
  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);

  beforeEach(() => {
    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.removeInstruction = vi.fn().mockResolvedValue({
      status: 'complete',
    });

    wrapper = mount(ModalRemoveInstruction, {
      props: {
        modelValue: true,
        instruction: mockInstruction,
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

    it('renders the modal with correct props', () => {
      const modal = findComponent('modal');
      expect(modal.exists()).toBe(true);
      expect(modal.props('modelValue')).toBe(true);
      expect(modal.props('title')).toBe(
        i18n.global.t('agent_builder.instructions.remove_instruction.title'),
      );
      expect(modal.props('showCloseIcon')).toBe(true);
      expect(modal.props('icon')).toBe('warning');
      expect(modal.props('iconScheme')).toBe('aux-red-500');
      expect(modal.props('size')).toBe('sm');
    });

    it('renders the correct description', () => {
      expect(find('description').exists()).toBe(true);
      expect(find('description').text()).toBe(
        i18n.global.t(
          'agent_builder.instructions.remove_instruction.modal_description',
        ),
      );
    });

    it('renders the correct button props', () => {
      const modal = findComponent('modal');
      expect(modal.props('secondaryButtonProps')).toEqual({
        text: i18n.global.t(
          'agent_builder.instructions.remove_instruction.cancel',
        ),
      });

      expect(modal.props('primaryButtonProps')).toEqual({
        text: i18n.global.t(
          'agent_builder.instructions.remove_instruction.remove',
        ),
        loading: false,
        type: 'warning',
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
      await findComponent('modal').vm.$emit('secondary-button-click');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
  });

  describe('Remove instruction functionality', () => {
    it('calls removeInstruction with correct instruction id', async () => {
      await findComponent('modal').vm.$emit('primary-button-click');

      expect(instructionsStore.removeInstruction).toHaveBeenCalledWith(
        mockInstruction.id,
      );
    });

    it('closes modal when removal is successful', async () => {
      await findComponent('modal').vm.$emit('primary-button-click');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('does not close modal when removal fails', async () => {
      instructionsStore.removeInstruction.mockResolvedValue({
        status: 'error',
      });

      await findComponent('modal').vm.$emit('primary-button-click');
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Loading states', () => {
    it('shows loading state on primary button when instruction status is loading', async () => {
      await wrapper.setProps({
        instruction: { ...mockInstruction, status: 'loading' },
      });

      expect(findComponent('modal').props('primaryButtonProps').loading).toBe(
        true,
      );
    });

    it('does not show loading state when instruction status is not loading', () => {
      expect(findComponent('modal').props('primaryButtonProps').loading).toBe(
        false,
      );
    });
  });
});
