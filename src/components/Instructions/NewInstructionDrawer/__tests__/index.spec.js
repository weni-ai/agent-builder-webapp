import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import NewInstructionDrawer from '../index.vue';
import i18n from '@/utils/plugins/i18n';

describe('NewInstructionDrawer/index.vue', () => {
  let wrapper;

  const SELECTORS = {
    title: '[data-testid="new-instruction-drawer-title"]',
    form: '[data-testid="new-instruction-drawer-form"]',
    cancelButton: '[data-testid="new-instruction-drawer-cancel-button"]',
    saveButton: '[data-testid="new-instruction-drawer-save-button"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const translation = (key) =>
    i18n.global.t(`agents.instructions.new_instruction_drawer.${key}`);

  const createWrapper = (props = {}) =>
    mount(NewInstructionDrawer, {
      props: {
        modelValue: true,
        ...props,
      },
      global: {
        plugins: [createTestingPinia()],
        stubs: {
          UnnnicDrawerNext: false,
          NewInstructionDrawerForm: true,
        },
      },
    });

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders the title with the correct text', () => {
      expect(find('title').exists()).toBe(true);
      expect(find('title').text()).toBe(translation('title'));
    });

    it('renders the instruction form inside the drawer section', () => {
      expect(wrapper.find('.new-instruction-drawer').exists()).toBe(true);
      expect(find('form').exists()).toBe(true);
    });

    it('renders the cancel and save buttons with the correct text', () => {
      expect(findComponent('cancelButton').text()).toBe(translation('cancel'));
      expect(findComponent('saveButton').text()).toBe(translation('save'));
    });
  });

  describe('User interaction', () => {
    it('closes the drawer when the cancel button is clicked', async () => {
      await findComponent('cancelButton').trigger('click');

      expect(wrapper.vm.modelValue).toBe(false);
    });

    it('keeps the drawer open when the save button is clicked', async () => {
      await findComponent('saveButton').trigger('click');

      expect(wrapper.vm.modelValue).toBe(true);
    });
  });
});
