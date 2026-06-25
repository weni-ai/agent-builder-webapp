import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import InstructionsHeaderActions from '../InstructionsHeaderActions.vue';
import { useInstructionsStore } from '@/store/Instructions';
import i18n from '@/utils/plugins/i18n';

describe('InstructionsHeaderActions.vue', () => {
  let wrapper;
  let store;

  const findExportButton = () =>
    wrapper.findComponent('[data-testid="export-instructions-button"]');
  const findNewInstructionButton = () =>
    wrapper.findComponent('[data-testid="new-instruction-button"]');
  const findDrawer = () =>
    wrapper.findComponent('[data-testid="new-instruction-drawer"]');

  const createWrapper = () => {
    const pinia = createTestingPinia();
    store = useInstructionsStore();
    wrapper = shallowMount(InstructionsHeaderActions, {
      global: { plugins: [pinia] },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders both action buttons', () => {
    createWrapper();

    expect(findExportButton().exists()).toBe(true);
    expect(findNewInstructionButton().exists()).toBe(true);
  });

  describe('export instructions button', () => {
    it('has type secondary', () => {
      createWrapper();

      expect(findExportButton().props('type')).toBe('secondary');
    });

    it('has the correct translated text', () => {
      createWrapper();

      expect(findExportButton().props('text')).toBe(
        i18n.global.t('agents.instructions.export_instructions'),
      );
    });
  });

  describe('new instruction button', () => {
    it('has type primary', () => {
      createWrapper();

      expect(findNewInstructionButton().props('type')).toBe('primary');
    });

    it('has the correct translated text', () => {
      createWrapper();

      expect(findNewInstructionButton().props('text')).toBe(
        i18n.global.t('agents.instructions.new_instruction'),
      );
    });
  });

  describe('NewInstructionDrawer', () => {
    it('renders the drawer', () => {
      createWrapper();

      expect(findDrawer().exists()).toBe(true);
    });

    it('opens the new instruction drawer through the store when clicked', async () => {
      createWrapper();

      await findNewInstructionButton().trigger('click');

      expect(store.openNewInstructionDrawer).toHaveBeenCalledTimes(1);
    });
  });
});
