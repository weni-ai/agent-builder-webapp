import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { shallowMount } from '@vue/test-utils';

import MCPStepContent from '../index.vue';

const mcpWithConstants = {
  name: 'Search',
  description: 'Search products',
  constants: [
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

const mcpWithoutConstants = {
  name: 'Inventory',
  description: 'Inventory manager',
  constants: [],
};

const MCPs = [mcpWithConstants, mcpWithoutConstants];

function getInitialValues() {
  return {
    apiKey: '',
    region: 'us',
    features: [],
    mode: 'auto',
  };
}

function createWrapper(overrides = {}) {
  const selectedMCP = ref(overrides.selectedMCP ?? null);
  const selectedMCPConstantsValues = ref(
    overrides.selectedMCPConstantsValues ?? {},
  );
  let wrapper;

  const updateSelectedMCP = (value) => {
    selectedMCP.value = value;
    if (wrapper) {
      wrapper.setProps({ selectedMCP: selectedMCP.value });
    }
  };

  const updateConstantsValues = (value) => {
    selectedMCPConstantsValues.value = value;
    if (wrapper) {
      wrapper.setProps({
        selectedMCPConstantsValues: selectedMCPConstantsValues.value,
      });
    }
  };

  const mountComponent = () => {
    wrapper = shallowMount(MCPStepContent, {
      props: {
        MCPs,
        selectedMCP: selectedMCP.value,
        selectedMCPConstantsValues: selectedMCPConstantsValues.value,
        'onUpdate:selectedMCP': updateSelectedMCP,
        'onUpdate:selectedMCPConstantsValues': updateConstantsValues,
        ...overrides,
      },
    });

    wrapper.setProps({
      selectedMCP: selectedMCP.value,
      selectedMCPConstantsValues: selectedMCPConstantsValues.value,
    });

    return wrapper;
  };

  return {
    wrapper: mountComponent(),
    getSelectedMCP: () => selectedMCP.value,
    getConstantsValues: () => selectedMCPConstantsValues.value,
    updateSelectedMCP,
    updateConstantsValues,
  };
}

describe('MCPStepContent', () => {
  let wrapper;
  let getSelectedMCP;
  let getConstantsValues;

  const mountWrapper = (overrides = {}) => {
    wrapper?.unmount();
    ({ wrapper, getSelectedMCP, getConstantsValues } =
      createWrapper(overrides));
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
  const findConstantsForm = () =>
    wrapper.find('[data-testid="concierge-second-step-constants-form"]');
  const findConfigDescription = () =>
    wrapper.find('[data-testid="concierge-second-step-config-description"]');
  const findMCPSelection = () =>
    wrapper.findComponent(
      '[data-testid="concierge-second-step-mcp-selection"]',
    );

  describe('rendering', () => {
    it('auto-selects the first MCP when none is selected', () => {
      expect(findPlaceholder().exists()).toBe(false);
      expect(getSelectedMCP()).toEqual(mcpWithConstants);
    });

    it('shows constants form when selected MCP has constants', async () => {
      mountWrapper({
        selectedMCP: mcpWithConstants,
        selectedMCPConstantsValues: getInitialValues(),
      });

      await nextTick();

      expect(findConstantsForm().exists()).toBe(true);
      expect(findConfigDescription().exists()).toBe(false);
    });

    it('shows description when selected MCP has no constants', async () => {
      mountWrapper({
        selectedMCP: mcpWithoutConstants,
        selectedMCPConstantsValues: {},
      });

      await nextTick();

      expect(findConfigDescription().exists()).toBe(true);
      expect(findConstantsForm().exists()).toBe(false);
    });
  });

  describe('selection handling', () => {
    it('selects MCP and builds initial values when emitted', async () => {
      findMCPSelection().vm.$emit('select', mcpWithConstants, true);
      await nextTick();

      expect(getSelectedMCP()).toEqual(mcpWithConstants);
      expect(getConstantsValues()).toEqual(getInitialValues());
    });

    it('ignores unchecked selection events', async () => {
      const mcpBeforeEvent = getSelectedMCP();
      const constantsBeforeEvent = getConstantsValues();

      findMCPSelection().vm.$emit('select', mcpWithoutConstants, false);
      await nextTick();

      expect(getSelectedMCP()).toEqual(mcpBeforeEvent);
      expect(getConstantsValues()).toEqual(constantsBeforeEvent);
    });
  });

  describe('constants values initialisation', () => {
    it('builds values when selected MCP is provided without prior constants', async () => {
      mountWrapper({
        selectedMCP: mcpWithConstants,
        selectedMCPConstantsValues: {},
      });

      await nextTick();

      expect(getConstantsValues()).toEqual(getInitialValues());
    });

    it('keeps values when constants are already present', async () => {
      const presetValues = { apiKey: 'abc', region: 'br' };
      mountWrapper({
        selectedMCP: mcpWithConstants,
        selectedMCPConstantsValues: presetValues,
      });

      await nextTick();

      expect(getConstantsValues()).toEqual(presetValues);
    });
  });
});
