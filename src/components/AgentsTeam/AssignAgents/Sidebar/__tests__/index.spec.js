import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AssignAgentsSidebar from '../index.vue';

describe('AssignAgentsSidebar', () => {
  let wrapper;
  let agentsTeamStore;
  const availableSystems = [
    { slug: 'vtex', name: 'VTEX', logo: 'vtex.svg' },
    { slug: 'synerise', name: 'Synerise', logo: 'synerise.svg' },
  ];

  beforeEach(() => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        AgentsTeam: {
          assignAgentsFilters: {
            search: '',
            category: [],
            system: 'ALL_OFFICIAL',
          },
          availableSystems,
        },
      },
    });

    wrapper = mount(AssignAgentsSidebar, {
      global: {
        plugins: [pinia],
      },
    });

    agentsTeamStore = useAgentsTeamStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all official system options and custom option', () => {
    expect(
      wrapper.find('[data-testid="sidebar-option-all-systems"]').exists(),
    ).toBe(true);

    availableSystems.forEach((system) => {
      expect(
        wrapper
          .find(`[data-testid="sidebar-option-system-${system.slug}"]`)
          .exists(),
      ).toBe(true);
    });

    expect(wrapper.find('[data-testid="sidebar-option-custom"]').exists()).toBe(
      true,
    );
  });

  it('selects the custom option and updates filters', async () => {
    await wrapper
      .find('[data-testid="sidebar-option-custom"]')
      .trigger('click');
    await nextTick();

    expect(agentsTeamStore.assignAgentsFilters.system).toBe('ALL_CUSTOM');
  });

  it('loads official agents when selecting a new system', async () => {
    await wrapper
      .find('[data-testid="sidebar-option-system-vtex"]')
      .trigger('click');
    await nextTick();

    expect(agentsTeamStore.assignAgentsFilters.system).toBe('vtex');
    expect(agentsTeamStore.loadOfficialAgents).toHaveBeenCalled();
  });

  it('does not reload agents when reselecting the same system', async () => {
    agentsTeamStore.assignAgentsFilters.system = 'vtex';
    await nextTick();

    agentsTeamStore.loadOfficialAgents.mockClear();

    await wrapper
      .find('[data-testid="sidebar-option-system-vtex"]')
      .trigger('click');
    await nextTick();

    expect(agentsTeamStore.loadOfficialAgents).not.toHaveBeenCalled();
  });
});
