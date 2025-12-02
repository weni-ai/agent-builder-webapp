import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import lodash from 'lodash';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import i18n from '@/utils/plugins/i18n';

import AgentsListFilters from '../AssignAgents/AgentsList/Filters.vue';

describe('AgentsListFilters.vue', () => {
  let wrapper;
  let agentsTeamStore;
  let mockDebounce;

  const flushUpdates = async () => {
    await nextTick();
    await Promise.resolve();
  };

  const mountComponent = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
    });

    mockDebounce = vi.spyOn(lodash, 'debounce').mockImplementation((fn) => fn);

    agentsTeamStore = useAgentsTeamStore();
    agentsTeamStore.loadOfficialAgents.mockResolvedValue();

    wrapper = shallowMount(AgentsListFilters, {
      global: {
        plugins: [pinia, i18n],
      },
    });
  };

  beforeEach(() => {
    mountComponent();
  });

  afterEach(() => {
    wrapper.unmount();
    vi.clearAllMocks();
  });

  const searchInput = () =>
    wrapper.findComponent('[data-testid="search-input"]');
  const categorySelect = () =>
    wrapper.findComponent('[data-testid="category-select"]');

  it('renders search input and category select', () => {
    expect(searchInput().exists()).toBe(true);
    expect(categorySelect().exists()).toBe(true);
  });

  it('calls debounced loadOfficialAgents when search text changes', async () => {
    await searchInput().setValue('support');
    await flushUpdates();

    expect(agentsTeamStore.loadOfficialAgents).toHaveBeenCalledWith({
      search: 'support',
      category: undefined,
    });

    expect(mockDebounce).toHaveBeenCalledWith(expect.any(Function), 300);
  });

  it('calls loadOfficialAgents when category changes', async () => {
    await categorySelect().setValue([
      { label: 'Payments and checkout', value: 'payments_and_checkout' },
    ]);
    await flushUpdates();

    expect(agentsTeamStore.loadOfficialAgents).toHaveBeenCalledWith({
      search: '',
      category: 'payments_and_checkout',
    });
  });

  it('computes localized category labels', () => {
    const options = wrapper.vm.categoryOptions;

    expect(options[1].label).toBe(
      i18n.global.t(
        'agents.assign_agents.filters.category.product_discovery_and_recommendations',
      ),
    );
  });
});
