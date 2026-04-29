import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import ConstantsStepContent from '../ConstantsStepContent.vue';

const constantsFixture = [
  {
    name: 'country',
    label: 'Country',
    type: 'TEXT',
    is_required: true,
    default_value: 'BRA',
  },
];

function createWrapper(props = {}) {
  return shallowMount(ConstantsStepContent, {
    props: {
      agentName: 'Custom Agent',
      constants: constantsFixture,
      constantsValues: {},
      ...props,
    },
  });
}

describe('ConstantsStepContent', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const findRoot = () => wrapper.find('[data-testid="constants-step"]');
  const findForm = () => wrapper.find('[data-testid="constants-step-form"]');
  const findEmpty = () => wrapper.find('[data-testid="constants-step-empty"]');

  it('renders root section', () => {
    expect(findRoot().exists()).toBe(true);
  });

  it('renders form when there are constants', () => {
    expect(findForm().exists()).toBe(true);
    expect(findEmpty().exists()).toBe(false);
  });

  it('renders empty state when there are no constants', () => {
    wrapper.unmount();
    wrapper = createWrapper({ constants: [] });

    expect(findEmpty().exists()).toBe(true);
    expect(findForm().exists()).toBe(false);
  });

  it('passes agent name to title key', () => {
    const title = findRoot().find('p');
    expect(title.text()).toContain('Custom Agent');
  });

  it('forwards constants and updates back to v-model', async () => {
    const formComponent = wrapper.findComponent({ name: 'ConstantsForm' });
    expect(formComponent.props('constants')).toEqual(constantsFixture);

    formComponent.vm.$emit('update:constantsValues', { country: 'BRA' });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:constantsValues')).toEqual([
      [{ country: 'BRA' }],
    ]);
  });
});
