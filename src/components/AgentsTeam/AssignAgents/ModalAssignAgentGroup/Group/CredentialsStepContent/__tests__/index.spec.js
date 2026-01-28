import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import CredentialsStepContent from '../index.vue';

const buildAgentMCP = (overrides = {}) => ({
  name: 'Concierge MCP',
  credentials: [
    { name: 'client_id', label: 'Client ID' },
    { name: 'client_secret', label: 'Client Secret' },
  ],
  config: [],
  ...overrides,
});

function createWrapper(props = {}) {
  return shallowMount(CredentialsStepContent, {
    props: {
      selectedSystem: 'VTEX',
      selectedMCP: buildAgentMCP(),
      credentialValues: {},
      ...props,
    },
  });
}

describe('CredentialsStepContent', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const findRoot = () => wrapper.find('[data-testid="concierge-third-step"]');
  const findSummary = () =>
    wrapper.findComponent('[data-testid="concierge-third-step-summary"]');
  const findCredentials = () =>
    wrapper.findComponent('[data-testid="concierge-third-step-credentials"]');

  it('renders layout sections with title and description', () => {
    wrapper = createWrapper();

    expect(findRoot().exists()).toBe(true);
    expect(findSummary().exists()).toBe(true);
    expect(findCredentials().exists()).toBe(true);
  });


  it('passes selected system and MCP props to Summary', () => {
    wrapper = createWrapper();
    const summary = findSummary();
    expect(summary.props('selectedSystem')).toBe(wrapper.vm.selectedSystem);
    expect(summary.props('selectedMCP')).toEqual(wrapper.vm.selectedMCP);
  });


  it('binds credentials and credential values to the Credentials component', async () => {
    const credentials = [
      { name: 'api_key', label: 'API Key' },
      { name: 'api_secret', label: 'API Secret' },
    ];
    wrapper = createWrapper({
      selectedMCP: buildAgentMCP({ credentials }),
      credentialValues: { api_key: '123' },
    });

    const credentialsComponent = findCredentials();
    expect(credentialsComponent.props('credentials')).toEqual(credentials);
    expect(credentialsComponent.props('credentialValues')).toEqual({
      api_key: '123',
    });

    credentialsComponent.vm.$emit('update:credentialValues', {
      api_key: '456',
      api_secret: '789',
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted('update:credentialValues')).toEqual([
      [{ api_key: '456', api_secret: '789' }],
    ]);
  });

  it('handles empty MCP credentials by passing an empty list', () => {
    wrapper = createWrapper({ selectedMCP: null });

    const credentialsComponent = findCredentials();
    expect(credentialsComponent.props('credentials')).toEqual([]);
  });
});
