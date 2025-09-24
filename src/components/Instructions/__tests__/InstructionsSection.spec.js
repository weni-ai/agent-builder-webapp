import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import InstructionsSection from '../InstructionsSection.vue';
import i18n from '@/utils/plugins/i18n';
import { useInstructionsStore } from '@/store/Instructions';

describe('InstructionsSection.vue', () => {
  let wrapper;
  let instructionsStore;
  const pinia = createTestingPinia({
    initialState: {
      Instructions: {
        instructions: {
          status: 'complete',
          data: [
            { id: 1, text: 'Instruction 1' },
            { id: 2, text: 'Instruction 2' },
          ],
        },
      },
    },
  });

  function setup() {
    wrapper = shallowMount(InstructionsSection, {
      global: {
        plugins: [pinia],
        stubs: ['UnnnicSkeletonLoading'],
      },
    });
    instructionsStore = useInstructionsStore();
  }

  beforeEach(() => {
    setup();
  });

  const SELECTORS = {
    title: '[data-testid="instructions-section-title"]',
    instructionsTab: '[data-testid="instructions-section-tab"]',
    instructionsCustom: '[data-testid="instructions-custom"]',
    instructionsDefault: '[data-testid="instructions-default"]',
    instructionsSafetyTopics: '[data-testid="instructions-safety-topics"]',
  };

  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);
  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const translation = (key) =>
    i18n.global.t(`agent_builder.instructions.instructions_list.${key}`);

  it('should match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('Component rendering', () => {
    it('renders components correctly', () => {
      expect(find('title').exists()).toBe(true);
      expect(findComponent('instructionsTab').exists()).toBe(true);
      expect(findComponent('instructionsCustom').exists()).toBe(true);
      expect(findComponent('instructionsDefault').exists()).toBe(false);
      expect(findComponent('instructionsSafetyTopics').exists()).toBe(false);
    });

    it('renders title correctly', () => {
      expect(find('title').text()).toBe(translation('title'));
    });

    it('renders custom instructions correctly', () => {
      expect(findComponent('instructionsCustom').exists()).toBe(true);
      expect(
        findComponent('instructionsCustom').props('instructions'),
      ).toStrictEqual([
        {
          id: 1,
          text: 'Instruction 1',
        },
        {
          id: 2,
          text: 'Instruction 2',
        },
      ]);
      expect(findComponent('instructionsCustom').props('showActions')).toBe(
        true,
      );
    });

    it('renders default instructions correctly', async () => {
      instructionsStore.activeInstructionsListTab = 'default';
      await wrapper.vm.$nextTick();

      expect(findComponent('instructionsDefault').exists()).toBe(true);
      expect(
        findComponent('instructionsDefault').props('instructions'),
      ).toStrictEqual(wrapper.vm.instructionsDefault);
      expect(findComponent('instructionsDefault').props('showActions')).toBe(
        false,
      );
    });

    it('renders safety topics instructions correctly', async () => {
      instructionsStore.activeInstructionsListTab = 'safety_topics';
      await wrapper.vm.$nextTick();

      expect(findComponent('instructionsSafetyTopics').exists()).toBe(true);
      expect(
        findComponent('instructionsSafetyTopics').props('instructions'),
      ).toStrictEqual(wrapper.vm.instructionsSafetyTopics);
      expect(
        findComponent('instructionsSafetyTopics').props('showActions'),
      ).toBe(false);
    });
  });

  describe('Load instructions logic', () => {
    it('calls loadInstructions when status is null', async () => {
      const loadInstructionsSpy = vi.fn();

      instructionsStore.instructions.status = null;
      instructionsStore.loadInstructions = loadInstructionsSpy;
      setup();

      expect(loadInstructionsSpy).toHaveBeenCalled();
    });

    ['complete', 'loading', 'error'].forEach((status) => {
      it(`does not call loadInstructions when status is ${status}`, async () => {
        const loadInstructionsSpy = vi.fn();

        instructionsStore.instructions.status = status;
        instructionsStore.loadInstructions = loadInstructionsSpy;
        setup();

        expect(loadInstructionsSpy).not.toHaveBeenCalled();
      });
    });
  });
});
