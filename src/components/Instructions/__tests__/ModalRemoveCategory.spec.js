import { shallowMount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ModalRemoveCategory from '../ModalRemoveCategory.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('ModalRemoveCategory.vue', () => {
  let wrapper;
  let instructionsStore;

  const category = { id: 10, name: 'Sales' };

  const categoryT = (key, params) =>
    i18n.global.t(`agents.instructions.delete_category.${key}`, params ?? {});

  const SELECTORS = {
    modal: '[data-testid="modal"]',
    description: '[data-testid="description"]',
    name: '[data-testid="category-name"]',
    cancel: '[data-testid="cancel-button"]',
    confirm: '[data-testid="confirm-button"]',
  };
  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const createWrapper = (instructionsData = []) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: { instructions: { data: instructionsData } },
      },
    });

    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.deleteCategory = vi
      .fn()
      .mockResolvedValue({ status: null });

    return shallowMount(ModalRemoveCategory, {
      props: { modelValue: true, category },
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDialogClose: { template: '<div><slot /></div>' },
          'i18n-t': {
            inheritAttrs: false,
            template:
              '<p v-bind="$attrs"><slot name="count" /><slot name="name" /></p>',
          },
        },
      },
    });
  };

  const threeInstructions = [
    { id: 1, text: 'A', category: { id: 10, name: 'Sales' } },
    { id: 2, text: 'B', category: { id: 10, name: 'Sales' } },
    { id: 3, text: 'C', category: { id: 20, name: 'Support' } },
  ];

  beforeEach(() => {
    wrapper = createWrapper(threeInstructions);
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the dialog open with the title', () => {
      expect(findComponent('modal').props('open')).toBe(true);
      expect(wrapper.text()).toContain(categoryT('modal_title'));
    });

    it('renders the category name in a bold tag', () => {
      const boldName = find('name');
      expect(boldName.exists()).toBe(true);
      expect(boldName.element.tagName).toBe('B');
      expect(boldName.text()).toBe(category.name);
    });

    it('renders the count phrase using the real category count, ignoring search', () => {
      expect(find('description').text()).toContain(
        categoryT('instructions_count', { count: 2 }),
      );
    });

    it('renders the empty category description when the category has no instructions', () => {
      wrapper.unmount();
      wrapper = createWrapper([
        { id: 3, text: 'C', category: { id: 20, name: 'Support' } },
      ]);

      expect(find('description').attributes('keypath')).toBe(
        'agents.instructions.delete_category.modal_description_empty',
      );
      expect(find('name').text()).toBe(category.name);
    });

    it('renders cancel and confirm buttons with the correct labels', () => {
      expect(findComponent('cancel').props('text')).toBe(categoryT('cancel'));
      expect(findComponent('confirm').props('text')).toBe(categoryT('confirm'));
      expect(findComponent('confirm').props('type')).toBe('warning');
    });
  });

  describe('Interactions', () => {
    it('emits update:modelValue false when cancel is clicked', async () => {
      await findComponent('cancel').vm.$emit('click');

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('calls deleteCategory with the category id and closes on success', async () => {
      await findComponent('confirm').vm.$emit('click');
      await flushPromises();

      expect(instructionsStore.deleteCategory).toHaveBeenCalledWith(
        category.id,
      );
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('keeps the modal open on error', async () => {
      instructionsStore.deleteCategory.mockResolvedValue({ status: 'error' });

      await findComponent('confirm').vm.$emit('click');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('shows loading on the confirm button while deleting', async () => {
      let resolveDelete;
      instructionsStore.deleteCategory.mockImplementation(
        () => new Promise((resolve) => (resolveDelete = resolve)),
      );

      findComponent('confirm').vm.$emit('click');
      await nextTick();

      expect(findComponent('confirm').props('loading')).toBe(true);

      resolveDelete({ status: null });
      await flushPromises();

      expect(findComponent('confirm').props('loading')).toBe(false);
    });
  });
});
