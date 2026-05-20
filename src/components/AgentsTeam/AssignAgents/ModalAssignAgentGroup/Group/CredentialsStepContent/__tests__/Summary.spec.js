import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import Summary from '../Summary.vue';

vi.mock('@/composables/useTranslatedField', () => ({
  default: () => (field) => field?.en,
}));

const buildMCP = (overrides = {}) => ({
  name: 'Concierge MCP',
  description: { en: 'Handles concierge flows', pt: null, es: null },
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
  const findSystemBadge = (wrapper) =>
    wrapper.findComponent('[data-testid="concierge-summary-system-skill"]');
  const findMCPName = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary-mcp-name"]');
  const findMCPDescription = (wrapper) =>
    wrapper.find('[data-testid="concierge-summary-mcp-description"]');

  it('passes the selected system slug to SystemBadge', () => {
    const wrapper = createWrapper({ selectedSystem: 'VTEX' });

    expect(findRoot(wrapper).exists()).toBe(true);
    expect(findSystemCard(wrapper).exists()).toBe(true);
    const badge = findSystemBadge(wrapper);
    expect(badge.exists()).toBe(true);
    expect(badge.props('system')).toBe('VTEX');
  });

  it('hides the system card when no system is selected', () => {
    const wrapper = createWrapper({ selectedSystem: undefined });

    expect(findSystemCard(wrapper).exists()).toBe(false);
  });

  it('displays the selected MCP name and description', () => {
    const selectedMCP = buildMCP({
      name: 'Inventory MCP',
      description: {
        en: 'Manages inventory sync',
        pt: null,
        es: null,
      },
    });
    const wrapper = createWrapper({ selectedMCP });

    expect(findMCPCards(wrapper).exists()).toBe(true);
    expect(findMCPName(wrapper).text()).toBe('Inventory MCP');
    expect(findMCPDescription(wrapper).text()).toBe('Manages inventory sync');
  });
});
