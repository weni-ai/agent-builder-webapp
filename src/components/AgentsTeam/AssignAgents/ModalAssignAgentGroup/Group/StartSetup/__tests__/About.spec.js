import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import About from '../About.vue';

const mockAgent = {
  description: 'Handles concierge flows by helping customers',
  systems: ['VTEX', 'SYNERISE'],
};

const getSystemsObjectsMock = vi.fn();

vi.mock('@/composables/useAgentSystems', () => ({
  default: () => ({
    getSystemsObjects: getSystemsObjectsMock,
  }),
}));

function createWrapper(props = {}) {
  return shallowMount(About, {
    props: {
      agent: mockAgent,
      ...props,
    },
  });
}

describe('StartSetup About', () => {
  let wrapper;

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const findTitle = () =>
    wrapper.find('[data-testid="start-setup-about-title"]');
  const findDescription = () =>
    wrapper.find('[data-testid="start-setup-about-description"]');
  const findSystemBadges = () =>
    wrapper.find('[data-testid="start-setup-system-badges"]');
  const findSkills = () =>
    wrapper.findAll('[data-testid="start-setup-about-skill"]');

  it('renders title and description', () => {
    getSystemsObjectsMock.mockReturnValue([]);
    wrapper = createWrapper();

    expect(findTitle().exists()).toBe(true);
    expect(findDescription().text()).toBe(mockAgent.description);
  });

  it('renders system badges when agent systems are available', () => {
    getSystemsObjectsMock.mockReturnValue([
      { name: 'VTEX', icon: 'vtex-icon' },
      { name: 'SYNERISE', icon: 'synerise-icon' },
    ]);
    wrapper = createWrapper();

    expect(findSystemBadges().exists()).toBe(true);
    const skills = findSkills();
    expect(skills).toHaveLength(2);
    expect(getSystemsObjectsMock).toHaveBeenCalledWith(mockAgent.systems);
  });

  it('hides system badges when agent has no systems', () => {
    getSystemsObjectsMock.mockReturnValue([]);
    wrapper = createWrapper({
      agent: { ...mockAgent, systems: [] },
    });

    expect(findSystemBadges().exists()).toBe(false);
  });
});
