import { shallowMount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ModalRemoveInstruction from '../ModalRemoveInstruction.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('ModalRemoveInstruction.vue', () => {
  let wrapper;
  let instructionsStore;

  const mockInstruction = {
    id: 'test-instruction-id',
    text: 'Test instruction text',
    status: null,
  };

  const removeT = (key) =>
    i18n.global.t(`agent_builder.instructions.remove_instruction.${key}`);

  const SELECTORS = {
    modal: '[data-testid="modal"]',
    description: '[data-testid="description"]',
    snippet: '[data-testid="instruction-snippet"]',
    cancel: '[data-testid="cancel-button"]',
    remove: '[data-testid="remove-button"]',
  };
  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const createWrapper = (instruction = mockInstruction) => {
    const pinia = createTestingPinia({
      initialState: { Instructions: { instructions: { data: [] } } },
    });

    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.removeInstruction = vi
      .fn()
      .mockResolvedValue({ status: null });

    return shallowMount(ModalRemoveInstruction, {
      props: { modelValue: true, instruction },
      global: {
        plugins: [pinia],
        stubs: { UnnnicDialogClose: { template: '<div><slot /></div>' } },
      },
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('renders the dialog open with the title', () => {
      expect(findComponent('modal').exists()).toBe(true);
      expect(findComponent('modal').props('open')).toBe(true);
      expect(wrapper.text()).toContain(removeT('title'));
    });

    it('renders the description', () => {
      expect(find('description').text()).toBe(removeT('modal_description'));
    });

    it('renders the instruction text snippet', () => {
      expect(find('snippet').text()).toBe(mockInstruction.text);
    });

    it('renders cancel and remove buttons with the correct labels', () => {
      expect(findComponent('cancel').props('text')).toBe(removeT('cancel'));
      expect(findComponent('remove').props('text')).toBe(removeT('remove'));
      expect(findComponent('remove').props('type')).toBe('warning');
    });
  });

  describe('Modal interactions', () => {
    it('emits update:modelValue false when the dialog requests to close', async () => {
      await findComponent('modal').vm.$emit('update:open', false);

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('emits update:modelValue false when cancel is clicked', async () => {
      await findComponent('cancel').vm.$emit('click');

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });
  });

  describe('Remove instruction functionality', () => {
    it('calls removeInstruction with the instruction id', async () => {
      await findComponent('remove').vm.$emit('click');

      expect(instructionsStore.removeInstruction).toHaveBeenCalledWith(
        mockInstruction.id,
      );
    });

    it('closes the modal on success', async () => {
      await findComponent('remove').vm.$emit('click');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('keeps the modal open on error', async () => {
      instructionsStore.removeInstruction.mockResolvedValue({
        status: 'error',
      });

      await findComponent('remove').vm.$emit('click');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });
  });

  describe('Loading state', () => {
    it('shows loading on the remove button when status is loading', async () => {
      await wrapper.setProps({
        instruction: { ...mockInstruction, status: 'loading' },
      });
      await nextTick();

      expect(findComponent('remove').props('loading')).toBe(true);
    });

    it('does not show loading when status is not loading', () => {
      expect(findComponent('remove').props('loading')).toBe(false);
    });
  });
});
