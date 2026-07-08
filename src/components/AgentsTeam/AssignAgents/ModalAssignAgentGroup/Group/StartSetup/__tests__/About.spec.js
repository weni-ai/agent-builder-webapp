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
  const findLastUpdated = () =>
    wrapper.find('[data-testid="start-setup-about-last-updated"]');

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

  it('renders the formatted last updated label for a custom agent with last_updated', () => {
    // Parsed as local time so the formatted output is timezone-independent.
    wrapper = createWrapper({
      agent: {
        ...mockAgent,
        is_official: false,
        last_updated: '2026-05-13T15:15:00',
      },
    });

    expect(findLastUpdated().exists()).toBe(true);
    expect(findLastUpdated().text()).toBe(
      'Updated on May 13, 2026 at 3:15 p.m.',
    );
  });

  it('does not render the last updated label when agent has no last_updated', () => {
    wrapper = createWrapper();

    expect(findLastUpdated().exists()).toBe(false);
  });

  it('does not render the last updated label for an official agent', () => {
    wrapper = createWrapper({
      agent: {
        ...mockAgent,
        is_official: true,
        last_updated: '2026-05-13T15:15:00',
      },
    });

    expect(findLastUpdated().exists()).toBe(false);
  });
});
