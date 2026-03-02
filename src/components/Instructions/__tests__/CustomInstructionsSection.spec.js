import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';
import { nextTick } from 'vue';

import CustomInstructionsSection from '../CustomInstructionsSection.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';
import { useAlertStore } from '@/store/Alert';

describe('CustomInstructionsSection.vue', () => {
  let wrapper;
  let instructionsStore;
  let alertStore;
  let writeTextMock;

  const SELECTORS = {
    searchInput: '[data-testid="custom-instructions-search"]',
    copyButton: '[data-testid="copy-instructions-button"]',
    instructionsList: '[data-testid="instructions-custom"]',
  };

  const findSearchInput = () => wrapper.findComponent(SELECTORS.searchInput);
  const findCopyButton = () => wrapper.findComponent(SELECTORS.copyButton);
  const findInstructionsList = () =>
    wrapper.findComponent(SELECTORS.instructionsList);

  const translation = (key) =>
    i18n.global.t(`agent_builder.instructions.instructions_list.${key}`);

  function createWrapper(initialState = {}) {
    const defaultState = {
      Instructions: {
        instructions: {
          status: 'complete',
          data: [
            { id: '1', text: 'First instruction' },
            { id: '2', text: 'Second instruction' },
            { id: '3', text: 'Another one' },
          ],
        },
      },
    };

    const pinia = createTestingPinia({
      initialState: {
        ...defaultState,
        Instructions: {
          ...defaultState.Instructions,
          ...initialState.Instructions,
        },
      },
    });

    wrapper = shallowMount(CustomInstructionsSection, {
      global: {
        plugins: [pinia],
      },
    });

    instructionsStore = useInstructionsStore(pinia);
    alertStore = useAlertStore(pinia);
    return wrapper;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('Component rendering', () => {
    it('renders section with search input, copy button and instructions list', () => {
      expect(findSearchInput().exists()).toBe(true);
      expect(findCopyButton().exists()).toBe(true);
      expect(findInstructionsList().exists()).toBe(true);
    });

    it('renders search input with correct props', () => {
      const input = findSearchInput();
      expect(input.props('iconLeft')).toBe('search');
      expect(input.props('placeholder')).toBe(
        translation('search_placeholder'),
      );
    });

    it('renders copy button with correct props', () => {
      const button = findCopyButton();
      expect(button.props('text')).toBe(translation('copy_instructions'));
      expect(button.props('type')).toBe('secondary');
      expect(button.props('iconLeft')).toBe('content_copy');
    });

    it('passes instructions from store to InstructionsList when search is empty', () => {
      expect(findInstructionsList().props('instructions')).toEqual(
        instructionsStore.instructions.data,
      );
      expect(findInstructionsList().props('showActions')).toBe(true);
    });

    it('passes loading state from store to InstructionsList', async () => {
      instructionsStore.instructions.status = 'loading';
      instructionsStore.instructions.data = [];
      await nextTick();
      expect(findInstructionsList().props('isLoading')).toBe(true);
    });
  });

  describe('No instructions text', () => {
    it('returns no instructions text when search is not empty', async () => {
      const input = findSearchInput();
      await input.vm.$emit('update:modelValue', 'instruction');
      await nextTick();
      expect(findInstructionsList().props('noInstructionsText')).toBe(
        translation('no_custom_instructions_found'),
      );
    });

    it('returns undefined when search is empty', async () => {
      const input = findSearchInput();
      await input.vm.$emit('update:modelValue', '   ');
      await nextTick();
      expect(wrapper.vm.noInstructionsText).toBe(undefined);
    });
  });

  describe('Search filter', () => {
    it('filters instructions by search term (case-insensitive)', async () => {
      const input = findSearchInput();
      await input.vm.$emit('update:modelValue', 'first');
      await nextTick();
      expect(findInstructionsList().props('instructions')).toEqual([
        { id: '1', text: 'First instruction' },
      ]);
    });

    it('returns all instructions when search term is empty after trim', async () => {
      const input = findSearchInput();
      await input.vm.$emit('update:modelValue', '   ');
      await nextTick();
      expect(findInstructionsList().props('instructions')).toEqual(
        instructionsStore.instructions.data,
      );
    });

    it('filters by partial match', async () => {
      const input = findSearchInput();
      await input.vm.$emit('update:modelValue', 'instruction');
      await nextTick();
      expect(findInstructionsList().props('instructions')).toEqual([
        { id: '1', text: 'First instruction' },
        { id: '2', text: 'Second instruction' },
      ]);
    });
  });

  describe('Copy to clipboard', () => {
    it('copies instructions text to clipboard and shows success alert when button is clicked', async () => {
      await findCopyButton().vm.$emit('click');
      expect(writeTextMock).toHaveBeenCalledWith(
        'First instruction\n\nSecond instruction\n\nAnother one',
      );
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: translation('copy_success'),
      });
    });

    it('copies only filtered instructions when search is applied', async () => {
      await findSearchInput().vm.$emit('update:modelValue', 'Another');
      await nextTick();
      await findCopyButton().vm.$emit('click');
      expect(writeTextMock).toHaveBeenCalledWith('Another one');
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: translation('copy_success'),
      });
    });

    it('does not call clipboard or alert when there are no instructions to copy', async () => {
      instructionsStore.instructions.status = 'complete';
      instructionsStore.instructions.data = [];
      await nextTick();
      await findCopyButton().vm.$emit('click');
      expect(writeTextMock).not.toHaveBeenCalled();
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('does not call clipboard when filtered list is empty', async () => {
      await findSearchInput().vm.$emit('update:modelValue', 'nonexistent');
      await nextTick();
      await findCopyButton().vm.$emit('click');
      expect(writeTextMock).not.toHaveBeenCalled();
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('shows error alert when clipboard write fails', async () => {
      writeTextMock.mockRejectedValueOnce(new Error('Clipboard error'));
      await findCopyButton().vm.$emit('click');
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: translation('copy_error'),
      });
    });
  });
});
