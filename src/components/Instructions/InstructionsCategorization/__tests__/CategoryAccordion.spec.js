import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, afterEach, vi } from 'vitest';

import CategoryAccordion from '../CategoryAccordion.vue';
import Instruction from '@/components/Instructions/Instruction.vue';
import i18n from '@/utils/plugins/i18n';

const viewT = (key) => i18n.global.t(`agents.instructions.view.${key}`);

const customGroup = (overrides = {}) => ({
  key: 'category-10',
  label: 'Sales',
  locked: false,
  instructions: [
    { id: 2, text: 'Sales B' },
    { id: 1, text: 'Sales A' },
  ],
  ...overrides,
});

const lockedGroup = (overrides = {}) => ({
  key: 'default',
  label: viewT('default_instructions'),
  locked: true,
  instructions: [{ id: 'default-1', text: 'Default A', locked: true }],
  ...overrides,
});

const uncategorizedGroup = (overrides = {}) => ({
  key: 'uncategorized',
  label: viewT('uncategorized'),
  locked: true,
  instructions: [{ id: 1, text: 'Loose instruction' }],
  ...overrides,
});

describe('CategoryAccordion.vue', () => {
  let wrapper;

  const SELECTORS = {
    header: '[data-testid="category-accordion-header"]',
    chevron: '[data-testid="category-accordion-chevron"]',
    root: '[data-testid="category-accordion"]',
    tag: '[data-testid="category-accordion-tag"]',
    lockedTooltip: '[data-testid="category-accordion-locked-tooltip"]',
    actions: '[data-testid="category-accordion-actions"]',
    empty: '[data-testid="category-accordion-empty"]',
  };

  const find = (selector) => wrapper.find(SELECTORS[selector]);

  const createWrapper = (group = customGroup(), props = {}) =>
    shallowMount(CategoryAccordion, {
      props: { group, ...props },
      global: { renderStubDefaultSlot: true },
    });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the category label', () => {
    wrapper = createWrapper();

    expect(find('tag').attributes('text')).toBe('Sales');
  });

  it('renders an instruction per item with actions enabled for unlocked items', () => {
    wrapper = createWrapper();

    const instructions = wrapper.findAllComponents(Instruction);
    expect(instructions).toHaveLength(2);
    expect(instructions[0].props('showActions')).toBe(true);
    expect(instructions[0].props('emitEditOnClick')).toBe(true);
  });

  it('forwards the edit event from an instruction', async () => {
    const group = customGroup();
    wrapper = createWrapper(group);

    const instruction = group.instructions[0];
    await wrapper.findComponent(Instruction).vm.$emit('edit', instruction);

    expect(wrapper.emitted('edit')).toEqual([[instruction]]);
  });

  it('renders the actions menu for custom groups', () => {
    wrapper = createWrapper();

    expect(find('actions').exists()).toBe(true);
    expect(find('lockedTooltip').exists()).toBe(false);
  });

  it('emits delete-category with the group when the menu action is clicked', async () => {
    const group = customGroup();
    wrapper = createWrapper(group);

    await wrapper
      .find(`[data-test="${viewT('delete_category')}"]`)
      .trigger('click');

    expect(wrapper.emitted('delete-category')).toEqual([[group]]);
  });

  it('renders a locked tag with tooltip and no menu for default groups', () => {
    wrapper = createWrapper(lockedGroup());

    expect(find('tag').attributes('lefticon')).toBe('lock');
    expect(find('lockedTooltip').exists()).toBe(true);
    expect(find('lockedTooltip').attributes('enabled')).toBe('true');
    expect(find('lockedTooltip').attributes('text')).toBe(
      viewT('locked_tooltip'),
    );
    expect(find('actions').exists()).toBe(false);
  });

  it('renders a locked tag with disabled tooltip and keeps instruction actions for uncategorized groups', () => {
    wrapper = createWrapper(uncategorizedGroup());

    expect(find('tag').attributes('lefticon')).toBe('lock');
    expect(find('lockedTooltip').exists()).toBe(true);
    expect(find('lockedTooltip').attributes('enabled')).toBe('false');
    expect(find('actions').exists()).toBe(false);
    expect(wrapper.findComponent(Instruction).props('showActions')).toBe(true);
  });

  it('disables instruction actions for locked items', () => {
    wrapper = createWrapper(lockedGroup());

    expect(wrapper.findComponent(Instruction).props('showActions')).toBe(false);
  });

  it('is collapsed by default and toggles when the chevron is clicked', async () => {
    wrapper = createWrapper();

    expect(find('root').classes()).not.toContain(
      'category-accordion--expanded',
    );

    await find('chevron').trigger('click');
    expect(find('root').classes()).toContain('category-accordion--expanded');

    await find('chevron').trigger('click');
    expect(find('root').classes()).not.toContain(
      'category-accordion--expanded',
    );
  });

  it('starts expanded when initiallyExpanded is set', () => {
    wrapper = createWrapper(customGroup(), { initiallyExpanded: true });

    expect(find('root').classes()).toContain('category-accordion--expanded');
  });

  it('opens when forceExpanded is set but can still be collapsed', async () => {
    wrapper = createWrapper(customGroup(), { forceExpanded: true });

    expect(find('root').classes()).toContain('category-accordion--expanded');

    await find('chevron').trigger('click');
    expect(find('root').classes()).not.toContain(
      'category-accordion--expanded',
    );
  });

  it('opens when forceExpanded becomes true', async () => {
    wrapper = createWrapper(customGroup(), { forceExpanded: false });

    expect(find('root').classes()).not.toContain(
      'category-accordion--expanded',
    );

    await wrapper.setProps({ forceExpanded: true });
    expect(find('root').classes()).toContain('category-accordion--expanded');
  });

  it('uses a tertiary button for the chevron toggle', () => {
    wrapper = createWrapper();

    expect(find('chevron').attributes('type')).toBe('tertiary');
  });

  it('renders the empty state when the group has no instructions', () => {
    wrapper = createWrapper(customGroup({ instructions: [] }));

    expect(find('empty').exists()).toBe(true);
    expect(find('empty').text()).toBe(viewT('empty_category'));
  });
});
