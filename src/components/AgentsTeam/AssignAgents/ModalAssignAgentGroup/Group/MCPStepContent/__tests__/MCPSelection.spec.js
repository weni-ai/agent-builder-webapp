import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import MCPSelection from '../MCPSelection.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key) => key),
  }),
}));

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemObject: vi.fn(),
  }),
}));

describe('MCPSelection', () => {
  const MCPs = [
    {
      name: 'Search',
      description: 'Search mcp',
    },
    {
      name: 'Inventory',
      description: 'Inventory mcp',
    },
  ];

  let wrapper;

  const createWrapper = (props = {}) => {
    wrapper = mount(MCPSelection, {
      props: {
        MCPs,
        selectedMCP: MCPs[0],
        ...props,
      },
    });
  };

  const findRoot = () =>
    wrapper.find('[data-testid="concierge-second-step-mcp-selection"]');
  const findList = () =>
    wrapper.find('[data-testid="concierge-second-step-mcp-list"]');
  const findRadios = () =>
    wrapper.findAllComponents(
      '[data-testid="concierge-second-step-mcp-radio"]',
    );

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  beforeEach(() => {
    createWrapper();
  });

  it('renders heading and description', () => {
    const root = findRoot();

    expect(root.text()).toContain(
      'agents.assign_agents.setup.mcp_selection.title',
    );
    expect(root.text()).toContain(
      'agents.assign_agents.setup.mcp_selection.description',
    );
  });

  it('renders a radio for each MCP with the correct props', () => {
    const radios = findRadios();

    expect(findList().exists()).toBe(true);
    expect(radios).toHaveLength(MCPs.length);
    expect(radios[0].props('label')).toBe('Search');
    expect(radios[0].props('description')).toBe('Search mcp');
    expect(radios[0].props('selected')).toBe(true);
    expect(radios[1].props('label')).toBe('Inventory');
    expect(radios[1].props('selected')).toBe(false);
    expect(radios[1].props('descriptionVariant')).toBe('body');
  });

  it('emits select event when toggling MCP options', async () => {
    wrapper.setProps({ selectedMCP: null });

    const radios = findRadios();
    await radios[1].trigger('click');

    expect(wrapper.emitted('select')).toEqual([[MCPs[1], true]]);

    radios[1].vm.$emit('update:selected', false);

    const emitted = wrapper.emitted('select');
    expect(emitted[1]).toEqual([MCPs[1], false]);
  });
});
