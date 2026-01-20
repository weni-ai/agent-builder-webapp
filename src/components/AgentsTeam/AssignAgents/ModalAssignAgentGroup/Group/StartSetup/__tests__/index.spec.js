import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import StartSetup from '../index.vue';

const mockAgent = {
  description: 'Handles concierge flows',
  systems: ['VTEX'],
};

const mockTM = vi.fn(() => [
  { name: 'Concierge MCP', description: 'Assists customers' },
]);

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    tm: mockTM,
  }),
}));

describe('StartSetup index', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const createWrapper = (props = {}) =>
    shallowMount(StartSetup, {
      props: {
        agent: mockAgent,
        ...props,
      },
    });

  it('renders the three start setup sections', () => {
    wrapper = createWrapper();

    expect(wrapper.find('[data-testid="start-setup"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-testid="start-setup-about-section"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="start-setup-mcps-section"]').exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-testid="start-setup-conversation-section"]').exists(),
    ).toBe(true);
  });

  it('builds mocked MCPs list using translations', () => {
    wrapper = createWrapper();

    expect(mockTM).toHaveBeenCalledWith(
      'agents.assign_agents.setup.mcps_available.concierge_mcps',
    );
    const mcpsComponent = wrapper.findComponent({
      name: 'MCPs',
    });
    expect(mcpsComponent.props('mcps')).toEqual([
      { name: 'Concierge MCP', description: 'Assists customers', config: [] },
    ]);
  });
});
