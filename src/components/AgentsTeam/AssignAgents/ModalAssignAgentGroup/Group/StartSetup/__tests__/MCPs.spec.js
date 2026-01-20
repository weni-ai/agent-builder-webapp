import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import MCPs from '../MCPs.vue';

const mockMCPs = [
  {
    name: 'Search Concierge',
    description: 'Helps customers find products using natural language',
  },
  {
    name: 'Inventory Sync',
    description: 'Keeps inventory up to date across systems',
  },
];

const mockT = vi.fn((key) => key);

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: mockT,
  }),
}));

function createWrapper(props = {}) {
  return shallowMount(MCPs, {
    props,
  });
}

describe('StartSetup MCPs', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the title and list when MCPs are provided', () => {
    wrapper = createWrapper({ mcps: mockMCPs });

    const items = wrapper.findAll(
      '[data-testid="start-setup-mcps-item-title"]',
    );
    expect(items).toHaveLength(2);
    expect(items[0].text()).toBe('Search Concierge');
    expect(items[1].text()).toBe('Inventory Sync');
  });

  it('renders descriptions for each MCP', () => {
    wrapper = createWrapper({ mcps: mockMCPs });

    const descriptions = wrapper.findAll(
      '[data-testid="start-setup-mcps-item-description"]',
    );
    expect(descriptions).toHaveLength(2);
    expect(descriptions[0].text()).toBe(
      'Helps customers find products using natural language',
    );
    expect(descriptions[1].text()).toBe(
      'Keeps inventory up to date across systems',
    );
  });

  it('hides the list when there are no MCPs', () => {
    wrapper = createWrapper({ mcps: [] });

    expect(wrapper.find('[data-testid="start-setup-mcps"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-testid="start-setup-mcps-item-title"]').exists(),
    ).toBe(false);
  });
});
