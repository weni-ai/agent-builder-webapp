import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import NewInstructionDrawer from '../index.vue';
import { useInstructionsStore } from '@/store/Instructions';
import i18n from '@/utils/plugins/i18n';

describe('NewInstructionDrawer/index.vue', () => {
  let wrapper;
  let store;

  const SELECTORS = {
    title: '[data-testid="new-instruction-drawer-title"]',
    form: '[data-testid="new-instruction-drawer-form"]',
    category: '[data-testid="new-instruction-drawer-category"]',
    cancelButton: '[data-testid="new-instruction-drawer-cancel-button"]',
    saveButton: '[data-testid="new-instruction-drawer-save-button"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);
  const findComponent = (selector) =>
    wrapper.findComponent(SELECTORS[selector]);

  const translation = (key) =>
    i18n.global.t(`agents.instructions.new_instruction_drawer.${key}`);

  const createWrapper = (instructionsState = {}) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          isInstructionDrawerOpen: true,
          instructionDrawerMode: 'create',
          newInstruction: { text: '', category: null, status: null },
          instructionSuggestedByAI: { status: null },
          ...instructionsState,
        },
      },
    });

    store = useInstructionsStore();

    return mount(NewInstructionDrawer, {
      global: {
        plugins: [pinia],
        stubs: {
          UnnnicDrawerNext: false,
          NewInstructionDrawerForm: true,
          NewInstructionDrawerAIAnalysis: true,
          SuggestedCategory: true,
        },
      },
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Create mode', () => {
    it('renders the create title and the instruction form', () => {
      expect(find('title').text()).toBe(translation('title'));
      expect(find('form').exists()).toBe(true);
    });

    it('does not render the standalone category section', () => {
      expect(find('category').exists()).toBe(false);
    });

    it('disables save until the AI validation is complete', () => {
      expect(findComponent('saveButton').props('disabled')).toBe(true);
    });

    it('disables save while AI validation is loading', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'New rule', category: null, status: null },
        instructionSuggestedByAI: { status: 'loading' },
      });

      expect(findComponent('saveButton').props('disabled')).toBe(true);
    });

    it('disables save when AI validation fails', () => {
      wrapper = createWrapper({
        newInstruction: { text: 'New rule', category: null, status: null },
        instructionSuggestedByAI: { status: 'error' },
      });

      expect(findComponent('saveButton').props('disabled')).toBe(true);
    });

    it('adds the instruction when saving a validated instruction', async () => {
      wrapper = createWrapper({
        newInstruction: { text: 'New rule', category: null, status: null },
        instructionSuggestedByAI: { status: 'complete' },
      });

      await findComponent('saveButton').trigger('click');

      expect(store.addInstruction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edit mode', () => {
    const editState = {
      instructionDrawerMode: 'edit',
      editingInstructionId: 1,
      instructions: {
        data: [{ id: 1, text: 'Be concise', category: null }],
        status: 'complete',
      },
      newInstruction: { text: 'Be concise', category: null, status: null },
    };

    const editStateWithChanges = {
      ...editState,
      newInstruction: { text: 'Updated rule', category: null, status: null },
    };

    it('renders the edit title and the standalone category section', () => {
      wrapper = createWrapper(editState);

      expect(find('title').text()).toBe(translation('edit_title'));
      expect(find('category').exists()).toBe(true);
    });

    it('disables save when no edits were made', () => {
      wrapper = createWrapper(editState);

      expect(findComponent('saveButton').props('disabled')).toBe(true);
    });

    it('enables save without requiring AI validation when edits were made', () => {
      wrapper = createWrapper(editStateWithChanges);

      expect(findComponent('saveButton').props('disabled')).toBe(false);
    });

    it('disables save while AI validation is loading', () => {
      wrapper = createWrapper({
        ...editState,
        instructionSuggestedByAI: { status: 'loading' },
      });

      expect(findComponent('saveButton').props('disabled')).toBe(true);
    });

    it('disables save when AI validation fails', () => {
      wrapper = createWrapper({
        ...editState,
        instructionSuggestedByAI: { status: 'error' },
      });

      expect(findComponent('saveButton').props('disabled')).toBe(true);
    });

    it('updates the instruction when saving', async () => {
      wrapper = createWrapper(editStateWithChanges);

      await findComponent('saveButton').trigger('click');

      expect(store.updateEditingInstruction).toHaveBeenCalledTimes(1);
      expect(store.addInstruction).not.toHaveBeenCalled();
    });

    it('moves the category into the AI analysis once validated', () => {
      wrapper = createWrapper({
        ...editState,
        instructionSuggestedByAI: { status: 'complete' },
      });

      expect(find('category').exists()).toBe(false);
      expect(
        wrapper
          .find('[data-testid="new-instruction-drawer-ai-analysis"]')
          .exists(),
      ).toBe(true);
    });
  });

  describe('Closing', () => {
    it('closes the drawer when the cancel button is clicked', async () => {
      await findComponent('cancelButton').trigger('click');

      expect(store.closeInstructionDrawer).toHaveBeenCalled();
    });
  });
});
