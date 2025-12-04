import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import useAgentSystems from '@/composables/useAgentSystems';

import AssignAgentsSidebar from '../index.vue';

describe('AssignAgentsSidebar', () => {
  let wrapper;
  let agentsTeamStore;
  let { systems } = useAgentSystems();

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

    Object.values(systems).forEach((system) => {
      expect(
        wrapper
          .find(`[data-testid="sidebar-option-system-${system.name}"]`)
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
      .find('[data-testid="sidebar-option-system-VTEX"]')
      .trigger('click');
    await nextTick();

    expect(agentsTeamStore.assignAgentsFilters.system).toBe('VTEX');
    expect(agentsTeamStore.loadOfficialAgents).toHaveBeenCalled();
  });

  it('does not reload agents when reselecting the same system', async () => {
    agentsTeamStore.assignAgentsFilters.system = 'VTEX';
    await nextTick();

    agentsTeamStore.loadOfficialAgents.mockClear();

    await wrapper
      .find('[data-testid="sidebar-option-system-VTEX"]')
      .trigger('click');
    await nextTick();

    expect(agentsTeamStore.loadOfficialAgents).not.toHaveBeenCalled();
  });
});
