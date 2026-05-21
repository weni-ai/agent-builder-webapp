import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import About from '../About.vue';

vi.mock('@/composables/useTranslatedField', () => ({
  default: () => (field) => field?.en,
}));

const mockAgent = {
  group: 'CONCIERGE',
  about: {
    en: 'Handles concierge flows by helping customers',
    pt: null,
    es: null,
  },
  systems: ['VTEX', 'SYNERISE'],
};

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
  const findBadges = () =>
    wrapper.findAllComponents('[data-testid="start-setup-about-skill"]');

  it('renders title and description', () => {
    wrapper = createWrapper();

    expect(findTitle().exists()).toBe(true);
    expect(findDescription().text()).toBe(mockAgent.about.en);
  });

  it('renders one SystemBadge per agent system passing the slug', () => {
    wrapper = createWrapper();

    expect(findSystemBadges().exists()).toBe(true);
    const badges = findBadges();
    expect(badges).toHaveLength(2);
    expect(badges[0].props('system')).toBe('VTEX');
    expect(badges[1].props('system')).toBe('SYNERISE');
  });

  it('hides system badges when agent has no systems', () => {
    wrapper = createWrapper({
      agent: { ...mockAgent, systems: [] },
    });

    expect(findSystemBadges().exists()).toBe(false);
  });
});
