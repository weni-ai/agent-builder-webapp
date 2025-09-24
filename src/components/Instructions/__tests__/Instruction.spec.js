import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import Instruction from '../Instruction.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('Instruction.vue', () => {
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

  beforeEach(() => {
    instructionsStore = useInstructionsStore(pinia);

    wrapper = shallowMount(Instruction, {
      global: {
        plugins: [pinia],
      },
      props: {
        instruction: {
          id: 'test-id',
          text: 'Test instruction',
        },
        tag: '',
        showActions: true,
      },
    });
  });

  const SELECTORS = {
    text: '[data-testid="instruction-text"]',
    tag: '[data-testid="instruction-tag"]',
    actions: '[data-testid="instruction-actions"]',
    input: '[data-testid="instruction-input"]',
    saveButton: '[data-testid="instruction-save-button"]',
    cancelButton: '[data-testid="instruction-cancel-button"]',
    modalRemoveInstruction: '[data-testid="modal-remove-instruction"]',
  };
  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders components correctly', () => {
      expect(find('text').exists()).toBe(true);
      expect(findComponent('actions').exists()).toBe(true);
      expect(findComponent('modalRemoveInstruction').exists()).toBe(true);
      expect(find('tag').exists()).toBe(false);
      expect(find('input').exists()).toBe(false);
      expect(find('saveButton').exists()).toBe(false);
      expect(find('cancelButton').exists()).toBe(false);
    });
  });

  describe('Component props', () => {
    it('renders the correct text', () => {
      expect(find('text').text()).toBe('Test instruction');
    });

    it('renders the correct tag', async () => {
      await wrapper.setProps({ tag: 'Test tag' });
      expect(find('tag').exists()).toBe(true);
      expect(find('tag').text()).toBe('Test tag');
    });
  });

  describe('Content item actions', () => {
    it('renders the component when showActions is true', async () => {
      await wrapper.setProps({ showActions: true });
      expect(findComponent('actions').exists()).toBe(true);
    });

    it('does not render the component when showActions is false', async () => {
      await wrapper.setProps({ showActions: false });
      expect(findComponent('actions').exists()).toBe(false);
    });

    it('passes the correct props', async () => {
      await wrapper.setProps({ showActions: true });
      expect(findComponent('actions').props('actions')).toEqual([
        {
          text: i18n.global.t(
            'agent_builder.instructions.edit_instruction.title',
          ),
          icon: 'edit_square',
          scheme: 'neutral-dark',
          onClick: expect.any(Function),
        },
        {
          text: i18n.global.t(
            'agent_builder.instructions.remove_instruction.title',
          ),
          icon: 'delete',
          scheme: 'aux-red-500',
          onClick: expect.any(Function),
        },
      ]);
    });

    it('closes the modal when the update:model-value event is emitted', async () => {
      wrapper.vm.showModalRemoveInstruction = true;
      expect(wrapper.vm.showModalRemoveInstruction).toBe(true);

      findComponent('modalRemoveInstruction').vm.$emit(
        'update:model-value',
        false,
      );
      expect(wrapper.vm.showModalRemoveInstruction).toBe(false);
    });
  });

  describe('Edit mode', () => {
    beforeEach(() => {
      wrapper.vm.isEditing = true;
      instructionsStore.editInstruction = vi.fn().mockResolvedValue({
        status: 'complete',
      });
    });

    it('should match snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot('edit-mode');
    });

    it('renders the correct components', async () => {
      expect(findComponent('input').exists()).toBe(true);
      expect(findComponent('saveButton').exists()).toBe(true);
      expect(findComponent('cancelButton').exists()).toBe(true);
      expect(findComponent('text').exists()).toBe(false);
      expect(findComponent('tag').exists()).toBe(false);
      expect(findComponent('actions').exists()).toBe(false);
    });

    it('renders the correct input', () => {
      expect(findComponent('input').props('modelValue')).toBe(
        'Test instruction',
      );
      expect(findComponent('input').props('size')).toBe('sm');
    });

    it('renders the correct save button', () => {
      expect(findComponent('saveButton').props('disabled')).toBe(false);
      expect(findComponent('saveButton').props('loading')).toBe(false);
      expect(findComponent('saveButton').props('text')).toBe(
        i18n.global.t('agent_builder.instructions.edit_instruction.save'),
      );
      expect(findComponent('saveButton').props('type')).toBe('secondary');
      expect(findComponent('saveButton').props('size')).toBe('small');
    });

    it('renders the correct cancel button', () => {
      expect(findComponent('cancelButton').props('text')).toBe(
        i18n.global.t('agent_builder.instructions.edit_instruction.cancel'),
      );
      expect(findComponent('cancelButton').props('type')).toBe('tertiary');
      expect(findComponent('cancelButton').props('size')).toBe('small');
    });

    it('renders the correct cancel button', () => {
      expect(findComponent('cancelButton').props('type')).toBe('tertiary');
      expect(findComponent('cancelButton').props('size')).toBe('small');
      expect(findComponent('cancelButton').props('text')).toBe(
        i18n.global.t('agent_builder.instructions.edit_instruction.cancel'),
      );
    });

    describe('Save button', () => {
      it('is disabled when the input is empty', async () => {
        wrapper.vm.editingText = '';
        await wrapper.vm.$nextTick();
        expect(findComponent('saveButton').props('disabled')).toBe(true);
      });

      it('is enabled when the input is not empty', async () => {
        expect(findComponent('saveButton').props('disabled')).toBe(false);
      });

      it('is loading when the instruction is being edited', async () => {
        expect(findComponent('saveButton').props('loading')).toBe(false);
        wrapper.setProps({
          instruction: { ...wrapper.props.instruction, status: 'loading' },
        });
        await wrapper.vm.$nextTick();
        expect(findComponent('saveButton').props('loading')).toBe(true);
      });

      it('toggles edit mode when clicked', async () => {
        findComponent('saveButton').vm.$emit('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isEditing).toBe(false);
      });
    });

    describe('Cancel button', () => {
      it('toggles edit mode when clicked', async () => {
        findComponent('cancelButton').vm.$emit('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isEditing).toBe(false);
      });
    });
  });
});
