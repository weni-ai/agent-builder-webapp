import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import EngineSource from '../index.vue';
import i18n from '@/utils/plugins/i18n';
import { useEngineSourceStore } from '@/store/EngineSource';

describe('EngineSource/index.vue', () => {
  let wrapper;
  let engineSourceStore;

  const radioGroup = () =>
    wrapper.findComponent('[data-testid="engine-source-radio-group"]');
  const radioNative = () =>
    wrapper.findComponent('[data-testid="engine-source-radio-native"]');
  const radioCustom = () =>
    wrapper.findComponent('[data-testid="engine-source-radio-custom"]');

  const createWrapper = () => {
    const pinia = createTestingPinia({ stubActions: false });
    engineSourceStore = useEngineSourceStore();

    wrapper = mount(EngineSource, {
      global: { plugins: [pinia] },
    });
  };

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  it('renders the radio group with correct label and vertical state', () => {
    const group = radioGroup();
    expect(group.exists()).toBe(true);
    expect(group.props('state')).toBe('vertical');
    expect(group.props('label')).toBe(
      i18n.global.t('agent_builder.tunings.engine_source.title'),
    );
  });

  it('binds modelValue to engineSourceStore.engineType', () => {
    expect(radioGroup().props('modelValue')).toBe('native');
  });

  it('renders the native radio with correct label and value', () => {
    const radio = radioNative();
    expect(radio.exists()).toBe(true);
    expect(radio.props('value')).toBe('native');
    expect(radio.props('label')).toBe(
      i18n.global.t('agent_builder.tunings.engine_source.native'),
    );
  });

  it('renders the custom radio with correct label and value', () => {
    const radio = radioCustom();
    expect(radio.exists()).toBe(true);
    expect(radio.props('value')).toBe('custom');
    expect(radio.props('label')).toBe(
      i18n.global.t('agent_builder.tunings.engine_source.own_api_key'),
    );
  });

  it('calls setEngineType when radio group value changes', () => {
    radioGroup().vm.$emit('update:model-value', 'custom');
    expect(engineSourceStore.engineType).toBe('custom');
  });
});
