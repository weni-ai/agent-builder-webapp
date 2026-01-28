import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { shallowMount } from '@vue/test-utils';

import MCPStepContent from '../index.vue';

const mcpWithConfig = {
  name: 'Search',
  description: 'Search products',
  config: [
    { name: 'apiKey', type: 'TEXT' },
    {
      name: 'region',
      type: 'SELECT',
      options: [
        { name: 'US', value: 'us' },
        { name: 'BR', value: 'br' },
      ],
    },
    {
      name: 'features',
      type: 'CHECKBOX',
      options: [
        { name: 'Recommendations', value: 'reco' },
        { name: 'Analytics', value: 'analytics' },
      ],
    },
    {
      name: 'mode',
      type: 'RADIO',
      options: [
        { name: 'Automatic', value: 'auto' },
        { name: 'Manual', value: 'manual' },
      ],
    },
  ],
};

const mcpWithoutConfig = {
  name: 'Inventory',
  description: 'Inventory manager',
  config: [],
};

const MCPs = [mcpWithConfig, mcpWithoutConfig];

function getInitialValues() {
  return {
    // Mocked fields and values
    apiKey: '',
    region: 'us',
    features: [],
    mode: 'auto',
  };
}

function createWrapper(overrides = {}) {
  const selectedMCP = ref(overrides.selectedMCP ?? null);
  const selectedMCPConfigValues = ref(overrides.selectedMCPConfigValues ?? {});
  let wrapper;

  const updateSelectedMCP = (value) => {
    selectedMCP.value = value;
    if (wrapper) {
      wrapper.setProps({ selectedMCP: selectedMCP.value });
    }
  };

  const updateConfigValues = (value) => {
    selectedMCPConfigValues.value = value;
    if (wrapper) {
      wrapper.setProps({
        selectedMCPConfigValues: selectedMCPConfigValues.value,
      });
    }
  };

  const mountComponent = () => {
    wrapper = shallowMount(MCPStepContent, {
      props: {
        MCPs,
        selectedMCP: selectedMCP.value,
        selectedMCPConfigValues: selectedMCPConfigValues.value,
        'onUpdate:selectedMCP': updateSelectedMCP,
        'onUpdate:selectedMCPConfigValues': updateConfigValues,
        ...overrides,
      },
    });

    wrapper.setProps({
      selectedMCP: selectedMCP.value,
      selectedMCPConfigValues: selectedMCPConfigValues.value,
    });

    return wrapper;
  };

  return {
    wrapper: mountComponent(),
    getSelectedMCP: () => selectedMCP.value,
    getConfigValues: () => selectedMCPConfigValues.value,
    updateSelectedMCP,
    updateConfigValues,
  };
}

describe('MCPStepContent', () => {
  let wrapper;
  let getSelectedMCP;
  let getConfigValues;

  const mountWrapper = (overrides = {}) => {
    wrapper?.unmount();
    ({ wrapper, getSelectedMCP, getConfigValues } = createWrapper(overrides));
  };

  beforeEach(() => {
    mountWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const findPlaceholder = () =>
    wrapper.find('[data-testid="concierge-second-step-placeholder"]');
  const findConfigForm = () =>
    wrapper.find('[data-testid="concierge-second-step-config-form"]');
  const findConfigDescription = () =>
    wrapper.find('[data-testid="concierge-second-step-config-description"]');
  const findMCPSelection = () =>
    wrapper.findComponent(
      '[data-testid="concierge-second-step-mcp-selection"]',
    );

  describe('rendering', () => {
    it('shows placeholder when nothing is selected', () => {
      expect(findPlaceholder().exists()).toBe(true);
      expect(findConfigForm().exists()).toBe(false);
    });

    it('shows config form when selected MCP has config', async () => {
      mountWrapper({
        selectedMCP: mcpWithConfig,
        selectedMCPConfigValues: getInitialValues(),
      });

      await nextTick();

      expect(findConfigForm().exists()).toBe(true);
      expect(findConfigDescription().exists()).toBe(false);
    });

    it('shows description when selected MCP has no config', async () => {
      mountWrapper({
        selectedMCP: mcpWithoutConfig,
        selectedMCPConfigValues: {},
      });

      await nextTick();

      expect(findConfigDescription().exists()).toBe(true);
      expect(findConfigForm().exists()).toBe(false);
    });
  });

  describe('selection handling', () => {
    it('selects MCP and builds initial values when emitted', async () => {
      findMCPSelection().vm.$emit('select', mcpWithConfig, true);
      await nextTick();

      expect(getSelectedMCP()).toEqual(mcpWithConfig);
      expect(getConfigValues()).toEqual(getInitialValues());
    });

    it('ignores unchecked selection events', async () => {
      findMCPSelection().vm.$emit('select', mcpWithConfig, false);
      await nextTick();

      expect(getSelectedMCP()).toBeNull();
      expect(getConfigValues()).toEqual({});
    });
  });

  describe('config values initialisation', () => {
    it('builds values when selected MCP is provided without prior config', async () => {
      mountWrapper({
        selectedMCP: mcpWithConfig,
        selectedMCPConfigValues: {},
      });

      await nextTick();

      expect(getConfigValues()).toEqual(getInitialValues());
    });

    it('keeps values when config is already present', async () => {
      const presetValues = { apiKey: 'abc', region: 'br' };
      mountWrapper({
        selectedMCP: mcpWithConfig,
        selectedMCPConfigValues: presetValues,
      });

      await nextTick();

      expect(getConfigValues()).toEqual(presetValues);
    });
  });
});
