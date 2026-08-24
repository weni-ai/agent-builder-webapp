import { shallowMount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ModalRenameCategory from '../ModalRenameCategory.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('ModalRenameCategory.vue', () => {
  let wrapper;
  let instructionsStore;

  const category = { id: 10, name: 'Sales' };

  const renameT = (key) =>
    i18n.global.t(`agents.instructions.rename_category.${key}`);

  const SELECTORS = {
    modal: '[data-testid="modal"]',
    input: '[data-testid="name-input"]',
    disclaimer: '[data-testid="disclaimer"]',
    cancel: '[data-testid="cancel-button"]',
    confirm: '[data-testid="confirm-button"]',
  };
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const createWrapper = ({
    categories = [
      { id: 10, name: 'Sales' },
      { id: 20, name: 'Support' },
    ],
    modelValue = true,
  } = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          categories,
          sessionCategories: [],
          instructions: { data: [] },
        },
      },
    });

    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.renameCategory = vi
      .fn()
      .mockResolvedValue({ status: null });

    return shallowMount(ModalRenameCategory, {
      props: { modelValue, category },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDialogClose: { template: '<div><slot /></div>' },
        },
      },
    });
  };

  const setName = async (value) => {
    await findComponent('input').vm.$emit('update:modelValue', value);
    await nextTick();
  };

  beforeEach(async () => {
    wrapper = createWrapper();
    await nextTick();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the dialog open with the title and pre-filled name', () => {
      expect(findComponent('modal').props('open')).toBe(true);
      expect(wrapper.text()).toContain(renameT('modal_title'));
      expect(findComponent('input').props('modelValue')).toBe(category.name);
    });

    it('renders the informational disclaimer', () => {
      expect(findComponent('disclaimer').props('type')).toBe('informational');
      expect(findComponent('disclaimer').props('description')).toBe(
        renameT('disclaimer'),
      );
    });

    it('renders cancel and save buttons with the correct labels', () => {
      expect(findComponent('cancel').props('text')).toBe(renameT('cancel'));
      expect(findComponent('confirm').props('text')).toBe(renameT('confirm'));
      expect(findComponent('confirm').props('type')).toBe('primary');
    });
  });

  describe('Validation', () => {
    it('disables Save when the name is unchanged', () => {
      expect(findComponent('confirm').props('disabled')).toBe(true);
    });

    it('disables Save when the name is empty or whitespace', async () => {
      await setName('');
      expect(findComponent('confirm').props('disabled')).toBe(true);

      await setName('   ');
      expect(findComponent('confirm').props('disabled')).toBe(true);
    });

    it('disables Save when the name has invalid characters', async () => {
      await setName('Sales!');
      expect(findComponent('confirm').props('disabled')).toBe(true);
    });

    it('enables Save when the name is a valid new name', async () => {
      await setName('Marketing');
      expect(findComponent('confirm').props('disabled')).toBe(false);
    });

    it('allows a case-only change of the current category name', async () => {
      await setName('sales');
      expect(findComponent('confirm').props('disabled')).toBe(false);
    });
  });

  describe('Interactions', () => {
    it('emits update:modelValue false when cancel is clicked', async () => {
      await findComponent('cancel').vm.$emit('click');

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('calls renameCategory with the id and trimmed name and closes on success', async () => {
      await setName('  Marketing  ');
      await findComponent('confirm').vm.$emit('click');
      await flushPromises();

      expect(instructionsStore.renameCategory).toHaveBeenCalledWith(
        category.id,
        'Marketing',
      );
      expect(wrapper.emitted('renamed')).toEqual([[category.id]]);
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('keeps the modal open on error', async () => {
      instructionsStore.renameCategory.mockResolvedValue({ status: 'error' });

      await setName('Marketing');
      await findComponent('confirm').vm.$emit('click');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
      expect(wrapper.emitted('renamed')).toBeFalsy();
    });

    it('shows loading on the save button while renaming', async () => {
      let resolveRename;
      instructionsStore.renameCategory.mockImplementation(
        () => new Promise((resolve) => (resolveRename = resolve)),
      );

      await setName('Marketing');
      findComponent('confirm').vm.$emit('click');
      await nextTick();

      expect(findComponent('confirm').props('loading')).toBe(true);

      resolveRename({ status: null });
      await flushPromises();

      expect(findComponent('confirm').props('loading')).toBe(false);
    });

    it('discards the draft when the modal is closed and reopened', async () => {
      await setName('Marketing');
      await findComponent('cancel').vm.$emit('click');

      await wrapper.setProps({ modelValue: false });
      await wrapper.setProps({ modelValue: true });
      await nextTick();

      expect(findComponent('input').props('modelValue')).toBe(category.name);
    });
  });
});
