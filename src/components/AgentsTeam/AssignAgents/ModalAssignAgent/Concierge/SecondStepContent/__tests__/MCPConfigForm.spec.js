import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';

import MCPConfigForm from '../MCPConfigForm.vue';

const configFixture = [
  {
    name: 'notifications',
    label: 'Notifications',
    type: 'SWITCH',
    default_value: true,
  },
  {
    name: 'channel',
    label: 'Channel',
    type: 'SELECT',
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
  },
  {
    name: 'notes',
    label: 'Notes',
    type: 'TEXT',
    default_value: 'Initial note',
  },
  {
    name: 'features',
    label: 'Features',
    type: 'CHECKBOX',
    options: [
      { name: 'Feature A', value: 'feature-a' },
      { name: 'Feature B', value: 'feature-b' },
    ],
  },
  {
    name: 'mode',
    label: 'Mode',
    type: 'RADIO',
    options: [
      { name: 'Automatic', value: 'auto' },
      { name: 'Manual', value: 'manual' },
    ],
  },
];

function createWrapper(props = {}) {
  let currentValues = props.configValues || {};
  let wrapper;

  const mountWrapper = () => {
    wrapper = shallowMount(MCPConfigForm, {
      props: {
        config: configFixture,
        configValues: currentValues,
        'onUpdate:configValues': (nextValues) => {
          currentValues = nextValues;
          if (wrapper) {
            wrapper.setProps({ configValues: currentValues });
          }
        },
        ...props,
      },
    });

    wrapper.setProps({ configValues: currentValues });
    return wrapper;
  };

  return {
    wrapper: mountWrapper(),
    getConfigValues: () => currentValues,
  };
}

describe('MCPConfigForm', () => {
  let wrapper;
  let getConfigValues;

  beforeEach(() => {
    ({ wrapper, getConfigValues } = createWrapper());
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('initializes config values with defaults', async () => {
    await nextTick();

    expect(getConfigValues()).toMatchObject({
      notifications: true,
      threshold: 5,
      notes: 'Initial note',
    });
  });

  it('updates switch value when toggled', async () => {
    const switchComponent = wrapper.findComponent({ name: 'UnnnicSwitch' });

    switchComponent.vm.$emit('update:model-value', false);
    await nextTick();

    expect(getConfigValues().notifications).toBe(false);
  });

  it('handles select changes and clears value when empty', async () => {
    const selectComponent = wrapper.findComponent({
      name: 'UnnnicSelectSmart',
    });

    selectComponent.vm.$emit('update:model-value', [
      { label: 'SMS', value: 'sms' },
    ]);
    await nextTick();
    expect(getConfigValues().channel).toBe('sms');

    selectComponent.vm.$emit('update:model-value', []);
    await nextTick();
    expect(getConfigValues().channel).toBe('');
  });

  it('updates text input values', async () => {
    const inputs = wrapper.findAllComponents({ name: 'UnnnicInput' });
    const textInput = inputs.find((input) => input.props('label') === 'Notes');

    textInput.vm.$emit('update:model-value', 'Updated note');
    await nextTick();

    expect(getConfigValues().notes).toBe('Updated note');
  });

  it('toggles checkbox values', async () => {
    wrapper.vm.toggleCheckboxValue('features', 'feature-a');
    await nextTick();
    expect(getConfigValues().features).toEqual(['feature-a']);

    wrapper.vm.toggleCheckboxValue('features', 'feature-b');
    await nextTick();
    expect(getConfigValues().features).toEqual(['feature-a', 'feature-b']);

    wrapper.vm.toggleCheckboxValue('features', 'feature-a');
    await nextTick();
    expect(getConfigValues().features).toEqual(['feature-b']);
  });

  it('updates radio selection', async () => {
    wrapper.vm.updateFieldValue('mode', 'manual');
    await nextTick();

    expect(getConfigValues().mode).toBe('manual');
  });
});
