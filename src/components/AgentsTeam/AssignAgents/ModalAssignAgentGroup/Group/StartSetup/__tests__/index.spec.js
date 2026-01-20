import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import StartSetup from '../index.vue';

const mockAgent = {
  description: 'Handles concierge flows',
  systems: ['VTEX'],
  MCPs: [
    { name: 'Concierge MCP', description: 'Assists customers' },
  ],
};

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

  it('passes the agent MCPs to the MCPs section', () => {
    wrapper = createWrapper();

    const mcpsComponent = wrapper.findComponent({
      name: 'MCPs',
    });
    expect(mcpsComponent.props('mcps')).toEqual([
      { name: 'Concierge MCP', description: 'Assists customers' },
    ]);
  });
});
