import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import Summary from '../Summary.vue';

const getSystemObjectMock = vi.fn();

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemObject: getSystemObjectMock,
  }),
}));

const buildMCP = (overrides = {}) => ({
  name: 'Concierge MCP',
  description: 'Handles concierge flows',
  credentials: [],
  config: [],
  ...overrides,
});

function createWrapper(props = {}) {
  return shallowMount(Summary, {
    props: {
      selectedSystem: 'VTEX',
      selectedMCP: buildMCP(),
      ...props,
    },
  });
}

describe('Summary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const findRoot = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary"]');
  const findSystemCard = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary-system-card"]');
  const findMCPCards = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary-mcp-card"]');
  const findSkill = (wrapper) =>
    wrapper.findComponent('[data-testid="concierge-summary-system-skill"]');
  const findMCPName = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary-mcp-name"]');
  const findMCPDescription = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary-mcp-description"]');

  it('renders system summary with icon and name from agent systems', () => {
    getSystemObjectMock.mockReturnValue({ name: 'VTEX', icon: 'vtex.svg' });
    const wrapper = createWrapper({ selectedSystem: 'VTEX' });

    expect(findRoot(wrapper).exists()).toBe(true);
    expect(findSystemCard(wrapper).exists()).toBe(true);
    const skill = findSkill(wrapper);
    expect(skill.exists()).toBe(true);
    expect(skill.props('title')).toBe('VTEX');
    expect(skill.props('icon')).toBe('vtex.svg');
    expect(getSystemObjectMock).toHaveBeenCalledWith('VTEX');
  });

  it('falls back to the provided system string when metadata is missing', () => {
    getSystemObjectMock.mockReturnValue(undefined);
    const wrapper = createWrapper({ selectedSystem: 'SYNERISE' });

    const skill = findSkill(wrapper);
    expect(skill.props('title')).toBe('SYNERISE');
    expect(skill.props('icon')).toBe('');
  });

  it('displays the selected MCP name and description', () => {
    const selectedMCP = buildMCP({
      name: 'Inventory MCP',
      description: 'Manages inventory sync',
    });
    const wrapper = createWrapper({ selectedMCP });

    expect(findMCPCards(wrapper).exists()).toBe(true);
    expect(findMCPName(wrapper).text()).toBe('Inventory MCP');
    expect(findMCPDescription(wrapper).text()).toBe('Manages inventory sync');
  });
});
