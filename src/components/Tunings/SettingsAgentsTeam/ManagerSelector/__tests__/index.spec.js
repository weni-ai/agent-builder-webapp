import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';

import ManagerSelector from '../index.vue';
import i18n from '@/utils/plugins/i18n';

describe('ManagerSelector.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(ManagerSelector);
  });

  const title = () => wrapper.find('[data-testid="manager-selector-title"]');

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('renders the title with correct translation and styling', () => {
    expect(title().text()).toBe(
      i18n.global.t('agent_builder.tunings.manager.title'),
    );
  });

  it('binds the radio group to the selected manager and updates the value', async () => {
    const radioGroup = wrapper.findComponent(
      '[data-testid="manager-selector-radio-group"]',
    );

    expect(radioGroup.exists()).toBe(true);
    expect(radioGroup.props('state')).toBe('vertical');
    expect(radioGroup.props('modelValue')).toBe('manager-2.5');

    radioGroup.vm.$emit('update:model-value', 'manager-2.6');
    await nextTick();

    expect(wrapper.vm.selectedManager).toBe('manager-2.6');
  });

  it('passes the correct props to each manager option', () => {
    const radioNew = wrapper.findComponent(
      '[data-testid="manager-selector-radio-new"]',
    );
    const radioLegacy = wrapper.findComponent(
      '[data-testid="manager-selector-radio-legacy"]',
    );

    expect(radioNew.props()).toMatchObject({
      label: 'Manager 2.6',
      value: 'manager-2.6',
      helper: 'Recommended',
    });

    expect(radioLegacy.props()).toMatchObject({
      label: 'Manager 2.5',
      value: 'manager-2.5',
      helper: 'Legacy model',
    });
  });

  it('renders the "New" tag next to the latest manager option', () => {
    const newTag = wrapper.find(
      '[data-testid="manager-selector-radio-new-tag"]',
    );

    expect(newTag.exists()).toBe(true);
    expect(newTag.text()).toBe(
      i18n.global.t('agent_builder.tunings.manager.new'),
    );
  });
});
