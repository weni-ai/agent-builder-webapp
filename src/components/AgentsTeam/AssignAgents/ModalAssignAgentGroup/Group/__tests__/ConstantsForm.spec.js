import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';

import ConstantsForm from '../ConstantsForm.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key) => key),
  }),
}));

const constantsFixture = [
  {
    name: 'notifications',
    label: 'Notifications',
    type: 'SWITCH',
    default_value: true,
    is_required: true,
  },
  {
    name: 'channel',
    label: 'Channel',
    type: 'SELECT',
    is_required: true,
    options: [
      { name: 'Email', value: 'email' },
      { name: 'SMS', value: 'sms' },
    ],
  },
  {
    name: 'threshold',
    label: 'Threshold',
    type: 'NUMBER',
    default_value: 5,
    is_required: false,
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'TEXT',
    default_value: 'Initial note',
    is_required: true,
  },
  {
    name: 'features',
    label: 'Features',
    type: 'CHECKBOX',
    is_required: false,
    options: [
      { name: 'Feature A', value: 'feature-a' },
      { name: 'Feature B', value: 'feature-b' },
    ],
  },
  {
    name: 'mode',
    label: 'Mode',
    type: 'RADIO',
    is_required: true,
    options: [
      { name: 'Automatic', value: 'auto' },
      { name: 'Manual', value: 'manual' },
    ],
  },
];

function createWrapper(props = {}) {
  let currentValues = props.constantsValues || {};
  let wrapper;

  const mountWrapper = () => {
    wrapper = shallowMount(ConstantsForm, {
      props: {
        constants: constantsFixture,
        constantsValues: currentValues,
        'onUpdate:constantsValues': (nextValues) => {
          currentValues = nextValues;
          if (wrapper) {
            wrapper.setProps({ constantsValues: currentValues });
          }
        },
        ...props,
      },
    });

    wrapper.setProps({ constantsValues: currentValues });
    return wrapper;
  };

  return {
    wrapper: mountWrapper(),
    getConstantsValues: () => currentValues,
  };
}

describe('ConstantsForm', () => {
  let wrapper;
  let getConstantsValues;

  beforeEach(() => {
    ({ wrapper, getConstantsValues } = createWrapper());
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('initializes constants values with defaults', async () => {
    await nextTick();

    expect(getConstantsValues()).toMatchObject({
      notifications: true,
      threshold: 5,
      notes: 'Initial note',
    });
  });

  it('updates switch value when toggled', async () => {
    const switchComponent = wrapper.findComponent({ name: 'UnnnicSwitch' });

    switchComponent.vm.$emit('update:model-value', false);
    await nextTick();

    expect(getConstantsValues().notifications).toBe(false);
  });

  it('handles select changes and clears value when empty', async () => {
    const selectComponent = wrapper.findComponent({
      name: 'UnnnicSelect',
    });

    selectComponent.vm.$emit('update:model-value', 'sms');
    await nextTick();
    expect(getConstantsValues().channel).toBe('sms');

    selectComponent.vm.$emit('update:model-value', '');
    await nextTick();
    expect(getConstantsValues().channel).toBe('');
  });

  it('updates text input values', async () => {
    const inputs = wrapper.findAllComponents({ name: 'UnnnicInput' });
    const textInput = inputs.find((input) => input.props('label') === 'Notes');

    textInput.vm.$emit('update:model-value', 'Updated note');
    await nextTick();

    expect(getConstantsValues().notes).toBe('Updated note');
  });

  it('toggles checkbox values', async () => {
    wrapper.vm.toggleCheckboxValue('features', 'feature-a');
    await nextTick();
    expect(getConstantsValues().features).toEqual(['feature-a']);

    wrapper.vm.toggleCheckboxValue('features', 'feature-b');
    await nextTick();
    expect(getConstantsValues().features).toEqual(['feature-a', 'feature-b']);

    wrapper.vm.toggleCheckboxValue('features', 'feature-a');
    await nextTick();
    expect(getConstantsValues().features).toEqual(['feature-b']);
  });

  it('updates radio selection', async () => {
    wrapper.vm.updateFieldValue('mode', 'manual');
    await nextTick();

    expect(getConstantsValues().mode).toBe('manual');
  });
});
