import { shallowMount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import CustomModelConfig from '../index.vue';
import CredentialField from '../CredentialField.vue';
import i18n from '@/utils/plugins/i18n';
import { useEngineSourceStore } from '@/store/EngineSource';

describe('CustomModelConfig/index.vue', () => {
  let wrapper;
  let engineSourceStore;

  const providerSelect = () =>
    wrapper.findComponent(
      '[data-testid="custom-model-config-provider-select"]',
    );
  const modelSelect = () =>
    wrapper.findComponent('[data-testid="custom-model-config-model-select"]');
  const credentialFields = () => wrapper.findAllComponents(CredentialField);

  const mockProviders = [
    {
      uuid: 'openai',
      label: 'OpenAI',
      models: ['gpt-4o', 'gpt-4o-mini'],
      credentials: [
        { type: 'PASSWORD', label: 'API Key', value: '', id: 'api_key' },
      ],
    },
    {
      uuid: 'anthropic',
      label: 'Anthropic',
      models: ['claude-3-opus'],
      credentials: [
        { type: 'PASSWORD', label: 'API Key', value: '', id: 'api_key' },
        {
          type: 'TEXTAREA',
          label: 'Config',
          value: '',
          id: 'custom_config',
        },
      ],
    },
  ];

  const createWrapper = () => {
    const pinia = createTestingPinia({ stubActions: false });
    engineSourceStore = useEngineSourceStore();
    engineSourceStore.providers = JSON.parse(JSON.stringify(mockProviders));

    wrapper = shallowMount(CustomModelConfig, {
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

  it('renders the provider select with correct label and options', () => {
    const select = providerSelect();
    expect(select.exists()).toBe(true);
    expect(select.props('label')).toBe(
      i18n.global.t('agent_builder.tunings.engine_source.provider'),
    );
    expect(select.props('options')).toEqual([
      { label: 'OpenAI', value: 'openai' },
      { label: 'Anthropic', value: 'anthropic' },
    ]);
  });

  it('renders the model select disabled when no provider is selected', () => {
    expect(modelSelect().props('disabled')).toBe(true);
  });

  it('enables the model select when a provider is selected', async () => {
    engineSourceStore.setProvider('openai');
    await nextTick();

    expect(modelSelect().props('disabled')).toBe(false);
    expect(modelSelect().props('options')).toEqual([
      { label: 'gpt-4o', value: 'gpt-4o' },
      { label: 'gpt-4o-mini', value: 'gpt-4o-mini' },
    ]);
  });

  it('calls setProvider when provider select emits update', () => {
    providerSelect().vm.$emit('update:model-value', 'anthropic');
    expect(engineSourceStore.selectedProviderId).toBe('anthropic');
  });

  it('calls setModel when model select emits update', async () => {
    engineSourceStore.setProvider('openai');
    await nextTick();

    modelSelect().vm.$emit('update:model-value', 'gpt-4o');
    expect(engineSourceStore.selectedModel).toBe('gpt-4o');
  });

  it('renders credential fields for the selected provider', async () => {
    engineSourceStore.setProvider('anthropic');
    await nextTick();

    const fields = credentialFields();
    expect(fields).toHaveLength(2);
  });

  it('renders no credential fields when no provider is selected', () => {
    expect(credentialFields()).toHaveLength(0);
  });
});
