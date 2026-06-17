import { shallowMount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import ExportInstructionsModal from '../ExportInstructionsModal.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('ExportInstructionsModal.vue', () => {
  let wrapper;
  let instructionsStore;

  const exportT = (key) =>
    i18n.global.t(`agents.instructions.export_instructions.${key}`);

  const SELECTORS = {
    modal: '[data-testid="export-instructions-modal"]',
    description: '[data-testid="description"]',
    cancel: '[data-testid="cancel-button"]',
    export: '[data-testid="export-button"]',
  };
  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const createWrapper = () => {
    const pinia = createTestingPinia();

    instructionsStore = useInstructionsStore(pinia);
    instructionsStore.exportInstructions = vi
      .fn()
      .mockResolvedValue({ status: 'success' });

    return shallowMount(ExportInstructionsModal, {
      props: { modelValue: true },
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

  describe('Rendering', () => {
    it('renders the dialog open with the title', () => {
      expect(findComponent('modal').props('open')).toBe(true);
      expect(wrapper.text()).toContain(exportT('modal_title'));
    });

    it('renders the description', () => {
      expect(find('description').text()).toBe(exportT('modal_description'));
    });

    it('renders cancel and export buttons with the correct labels', () => {
      expect(findComponent('cancel').props('text')).toBe(
        exportT('cancel_button'),
      );
      expect(findComponent('export').props('text')).toBe(
        exportT('export_button'),
      );
      expect(findComponent('export').props('type')).toBe('primary');
    });
  });

  describe('Interactions', () => {
    it('emits update:modelValue false when the dialog requests to close', async () => {
      await findComponent('modal').vm.$emit('update:open', false);

      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('calls exportInstructions and closes on success', async () => {
      await findComponent('export').vm.$emit('click');
      await flushPromises();

      expect(instructionsStore.exportInstructions).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    });

    it('keeps the modal open on error', async () => {
      instructionsStore.exportInstructions.mockResolvedValue({
        status: 'error',
      });

      await findComponent('export').vm.$emit('click');
      await flushPromises();

      expect(wrapper.emitted('update:modelValue')).toBeFalsy();
    });

    it('reflects the store loading state on the export button', async () => {
      instructionsStore.isExportingInstructionsLoading = true;
      await nextTick();

      expect(findComponent('export').props('loading')).toBe(true);
    });

    it('does not show loading when the store is not exporting', () => {
      expect(findComponent('export').props('loading')).toBe(false);
    });
  });
});
