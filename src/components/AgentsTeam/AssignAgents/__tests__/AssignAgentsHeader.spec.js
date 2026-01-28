import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import i18n from '@/utils/plugins/i18n';

import AssignAgentsHeader from '../AssignAgentsHeader.vue';

const mountHeader = (stateOverrides = {}) => {
  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      AgentsTeam: {
        officialAgents: {
          status: 'complete',
          data: [],
        },
        assignAgentsFilters: {
          search: '',
          category: [],
          system: 'ALL_OFFICIAL',
        },
        availableSystems: [],
        ...stateOverrides,
      },
    },
  });

  const wrapper = mount(AssignAgentsHeader, {
    global: {
      plugins: [pinia],
    },
  });

  const agentsTeamStore = useAgentsTeamStore(pinia);

  return { wrapper, agentsTeamStore };
};

describe('AssignAgentsHeader', () => {
  it('renders the default title when no system is selected', () => {
    const { wrapper } = mountHeader();

    expect(
      wrapper.find('[data-testid="assign-agents-header-title"]').text(),
    ).toBe(i18n.global.t('agents.assign_agents.header.all_systems'));
  });

  it('renders the system specific title when a system label is provided', () => {
    const systemLabel = 'VTEX';
    const { wrapper } = mountHeader({
      assignAgentsFilters: {
        search: '',
        category: [],
        system: 'vtex',
      },
      availableSystems: [
        {
          slug: 'vtex',
          name: systemLabel,
          logo: 'vtex.svg',
        },
      ],
    });

    expect(
      wrapper.find('[data-testid="assign-agents-header-title"]').text(),
    ).toBe(
      i18n.global.t('agents.assign_agents.header.system_title', {
        system: systemLabel,
      }),
    );
  });

  it('displays the available agents count using pluralization rules', () => {
    const availableAgents = [{ uuid: '1' }, { uuid: '2' }];
    const { wrapper } = mountHeader({
      officialAgents: {
        status: 'complete',
        data: availableAgents,
      },
    });

    expect(
      wrapper.find('[data-testid="assign-agents-header-subtitle"]').text(),
    ).toBe(
      i18n.global.t(
        'agents.assign_agents.header.agents_available',
        availableAgents.length,
        {
          named: {
            count: availableAgents.length,
          },
        },
      ),
    );
  });

  it('updates the available agents text when the list changes', async () => {
    const { wrapper, agentsTeamStore } = mountHeader({
      officialAgents: {
        status: 'complete',
        data: [{ uuid: '1' }],
      },
    });

    agentsTeamStore.officialAgents.data.push({ uuid: '2' });
    await nextTick();

    expect(
      wrapper.find('[data-testid="assign-agents-header-subtitle"]').text(),
    ).toBe(
      i18n.global.t('agents.assign_agents.header.agents_available', 2, {
        named: { count: 2 },
      }),
    );
  });
});
