import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import ListInstructionRow from '../ListInstructionRow.vue';
import ModalRemoveInstruction from '@/components/Instructions/ModalRemoveInstruction.vue';
import { useInstructionsStore } from '@/store/Instructions';
import i18n from '@/utils/plugins/i18n';

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

vi.mock('@/store/FeatureFlags', () => ({
  useFeatureFlagsStore: () => ({
    flags: { categorizationOfInstructions: true },
  }),
}));

const customItem = (overrides = {}) => ({
  id: 1,
  text: 'Always track orders',
  categoryLabel: 'Sales',
  categoryLocked: false,
  locked: false,
  ...overrides,
});

const lockedItem = (overrides = {}) => ({
  id: 'default-1',
  text: 'Be concise',
  categoryLabel: 'Default instruction',
  categoryLocked: true,
  locked: true,
  ...overrides,
});

describe('ListInstructionRow.vue', () => {
  let wrapper;

  const SELECTORS = {
    text: '[data-testid="list-instruction-row-text"]',
    tag: '[data-testid="list-instruction-row-tag"]',
    lockedTooltip: '[data-testid="list-instruction-row-locked-tooltip"]',
    actions: '[data-testid="list-instruction-row-actions"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const editT = (key) =>
    i18n.global.t(`agent_builder.instructions.edit_instruction.${key}`);
  const removeT = (key) =>
    i18n.global.t(`agent_builder.instructions.remove_instruction.${key}`);

  const createWrapper = (instruction = customItem(), instructionsData = []) => {
    const pinia = createTestingPinia({
      initialState: {
        Instructions: {
          instructions: { data: instructionsData, status: 'complete' },
        },
      },
    });

    useInstructionsStore();

    return shallowMount(ListInstructionRow, {
      props: { instruction },
      global: { plugins: [pinia], renderStubDefaultSlot: true },
    });
  };

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the instruction text and the category tag', () => {
    wrapper = createWrapper();

    expect(find('text').text()).toBe('Always track orders');
    expect(find('tag').attributes('text')).toBe('Sales');
  });

  it('shows the actions menu for editable rows without a locked tag', () => {
    wrapper = createWrapper();

    expect(find('actions').exists()).toBe(true);
    expect(find('lockedTooltip').exists()).toBe(false);
  });

  it('renders a locked tag with tooltip and no menu for locked rows', () => {
    wrapper = createWrapper(lockedItem());

    expect(find('tag').attributes('lefticon')).toBe('lock');
    expect(find('lockedTooltip').exists()).toBe(true);
    expect(find('lockedTooltip').attributes('enabled')).toBe('true');
    expect(find('lockedTooltip').attributes('text')).toBe(
      i18n.global.t('agents.instructions.view.locked_tooltip'),
    );
    expect(find('actions').exists()).toBe(false);
  });

  it('renders a locked tag with uncategorized tooltip and keeps the actions menu', () => {
    wrapper = createWrapper(
      customItem({ categoryLabel: 'Uncategorized', categoryLocked: true }),
    );

    expect(find('tag').attributes('lefticon')).toBe('lock');
    expect(find('lockedTooltip').exists()).toBe(true);
    expect(find('lockedTooltip').attributes('enabled')).toBe('true');
    expect(find('lockedTooltip').attributes('text')).toBe(
      i18n.global.t('agents.instructions.view.uncategorized_tooltip'),
    );
    expect(find('actions').exists()).toBe(true);
  });

  it('emits edit with the instruction when the edit action is clicked', async () => {
    const item = customItem();
    wrapper = createWrapper(item);

    await wrapper.find(`[data-test="${editT('title')}"]`).trigger('click');

    expect(wrapper.emitted('edit')).toEqual([[item]]);
  });

  it('opens the remove modal from the actions menu', async () => {
    wrapper = createWrapper();

    const modal = wrapper.findComponent(ModalRemoveInstruction);
    expect(modal.attributes('modelvalue')).not.toBe('true');

    await wrapper.find(`[data-test="${removeT('title')}"]`).trigger('click');

    expect(modal.attributes('modelvalue')).toBe('true');
  });
});
