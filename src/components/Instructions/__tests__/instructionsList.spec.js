import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';

import InstructionsList from '../InstructionsList.vue';

describe('InstructionsList.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(InstructionsList, {
      props: {
        instructions: [
          { id: 1, text: 'Instruction 1' },
          { id: 2, text: 'Instruction 2' },
        ],
        isLoading: false,
        showActions: false,
      },
      global: {
        stubs: ['UnnnicSkeletonLoading'],
      },
    });
  });

  const SELECTORS = {
    instructions: '[data-testid="instructions"]',
    instructionLoading: '[data-testid="instruction-loading"]',
  };

  const findComponent = (component) =>
    wrapper.findComponent(SELECTORS[component]);
  const find = (selector) => wrapper.find(SELECTORS[selector]);

  it('should match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  describe('Component rendering', () => {
    it('renders components correctly', () => {
      expect(find('instructions').exists()).toBe(true);
      expect(findComponent('instructionLoading').exists()).toBe(false);
    });
  });

  describe('Loading state', () => {
    it('renders loading elements when status is loading', async () => {
      wrapper.setProps({ isLoading: true });
      await wrapper.vm.$nextTick();
      expect(find('instructions').exists()).toBe(true);
      expect(find('instructions').classes()).toContain(
        'instructions-list--loading',
      );
      expect(
        wrapper.findAllComponents(SELECTORS.instructionLoading).length,
      ).toBe(10);
    });

    it('hides loading list when status is complete', async () => {
      wrapper.setProps({ isLoading: false });
      await wrapper.vm.$nextTick();
      expect(findComponent('instructionLoading').exists()).toBe(false);
    });
  });

  describe('No instructions state', () => {
    it('renders no instructions list when instructions are empty', async () => {
      wrapper.setProps({ instructions: [] });
      await wrapper.vm.$nextTick();
      expect(find('instructions').exists()).toBe(true);
      expect(find('instructions').classes()).toContain(
        'instructions-list--no-instructions',
      );
      expect(
        find('instructions')
          .findComponent(SELECTORS.instructionLoading)
          .exists(),
      ).toBe(false);
    });
  });
});
