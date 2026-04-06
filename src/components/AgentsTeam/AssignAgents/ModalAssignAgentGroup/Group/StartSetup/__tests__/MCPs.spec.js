import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import MCPs from '../MCPs.vue';

vi.mock('@/utils/translatedField', () => ({
  getTranslatedField: (field) => field?.en,
}));

const mockMCPs = [
  {
    name: 'Search Concierge',
    description: {
      en: 'Helps customers find products using natural language',
      pt: null,
      es: null,
    },
  },
  {
    name: 'Inventory Sync',
    description: {
      en: 'Keeps inventory up to date across systems',
      pt: null,
      es: null,
    },
  },
  {
    name: 'Meta Catalog',
    description: {
      en: 'Syncs product catalog with Meta',
      pt: null,
      es: null,
    },
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

  beforeEach(() => {
    wrapper = createWrapper({ mcps: mockMCPs });
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  const getIcons = () =>
    wrapper.findAll('[data-testid="start-setup-mcps-item-icon"]');

  const getBodies = () =>
    wrapper.findAll('[data-testid="start-setup-mcps-item-body"]');

  it('renders the title and list when MCPs are provided', () => {
    const items = wrapper.findAll(
      '[data-testid="start-setup-mcps-item-title"]',
    );
    expect(items).toHaveLength(3);
    expect(items[0].text()).toBe('Search Concierge');
    expect(items[1].text()).toBe('Inventory Sync');
    expect(items[2].text()).toBe('Meta Catalog');
  });

  it('expands only the first item by default', () => {
    const bodies = getBodies();

    expect(bodies[0].classes()).toContain(
      'start-setup-mcps__item-body--expanded',
    );
    expect(bodies[1].classes()).not.toContain(
      'start-setup-mcps__item-body--expanded',
    );
    expect(bodies[2].classes()).not.toContain(
      'start-setup-mcps__item-body--expanded',
    );
  });

  it('applies expanded icon class only to the first item by default', () => {
    const icons = getIcons();

    expect(icons[0].classes()).toContain(
      'start-setup-mcps__item-icon--expanded',
    );
    expect(icons[1].classes()).not.toContain(
      'start-setup-mcps__item-icon--expanded',
    );
  });

  it('expands a collapsed item when clicked', async () => {
    const items = wrapper.findAll('[data-testid="start-setup-mcps-item"]');
    await items[1].trigger('click');

    const bodies = getBodies();

    expect(bodies[0].classes()).not.toContain(
      'start-setup-mcps__item-body--expanded',
    );
    expect(bodies[1].classes()).toContain(
      'start-setup-mcps__item-body--expanded',
    );
  });

  it('collapses an expanded item when clicked again', async () => {
    const items = wrapper.findAll('[data-testid="start-setup-mcps-item"]');
    await items[0].trigger('click');

    const bodies = getBodies();

    expect(bodies[0].classes()).not.toContain(
      'start-setup-mcps__item-body--expanded',
    );
  });

  it('hides the list when there are no MCPs', async () => {
    await wrapper.setProps({ mcps: [] });

    expect(wrapper.find('[data-testid="start-setup-mcps"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-testid="start-setup-mcps-item-title"]').exists(),
    ).toBe(false);
  });
});
