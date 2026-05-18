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

  it('renders root section', () => {
    expect(findRoot().exists()).toBe(true);
  });

  it('renders form', () => {
    expect(findForm().exists()).toBe(true);
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
