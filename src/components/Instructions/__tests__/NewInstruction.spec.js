import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import NewInstruction from '../NewInstruction.vue';
import i18n from '@/utils/plugins/i18n';
import { createTestingPinia } from '@pinia/testing';
import { useInstructionsStore } from '@/store/Instructions';
import { nextTick } from 'vue';

describe('NewInstruction.vue', () => {
  let wrapper;
  const pinia = createTestingPinia({
    initialState: {
      instructions: {
        data: [],
      },
      newInstruction: {
        text: '',
        status: null,
      },
    },
  });
  let instructionsStore;

  beforeEach(() => {
    instructionsStore = useInstructionsStore(pinia);

    wrapper = shallowMount(NewInstruction, {
      global: {
        plugins: [pinia],
      },
    });
  });

  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);
  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const translation = (key) =>
    i18n.global.t(`agent_builder.instructions.new_instruction.${key}`);

  const SELECTORS = {
    container: '[data-testid="new-instruction"]',
    title: '[data-testid="new-instruction-title"]',
    textarea: '[data-testid="new-instruction-textarea"]',
    addButton: '[data-testid="add-instruction-button"]',
  };

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('renders a title, description, textarea and add instruction button', () => {
      expect(find('container').exists()).toBe(true);
      expect(find('title').exists()).toBe(true);
      expect(findComponent('textarea').exists()).toBe(true);
      expect(findComponent('addButton').exists()).toBe(true);
    });

    describe('Title rendering', () => {
      it('renders the correct title', () => {
        expect(find('title').text()).toBe(translation('title'));
      });
    });

    describe('Textarea rendering', () => {
      it('provides the correct props to textarea', () => {
        expect(findComponent('textarea').props('placeholder')).toBe(
          translation('textarea.placeholder'),
        );
        expect(findComponent('textarea').props('message')).toBe(
          translation('textarea.description'),
        );
      });
    });

    describe('Add button rendering', () => {
      it('disables the button when the textarea is empty', () => {
        expect(findComponent('addButton').props('disabled')).toBe(true);
      });
    });
  });
});
