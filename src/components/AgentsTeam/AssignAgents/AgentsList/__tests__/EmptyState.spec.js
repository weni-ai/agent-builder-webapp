import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import i18n from '@/utils/plugins/i18n';

import EmptyState from '../EmptyState.vue';

const mountEmptyState = (stateOverrides = {}) => {
  const {
    assignAgentsFilters: assignAgentsFiltersOverrides,
    ...storeOverrides
  } = stateOverrides;

  const pinia = createTestingPinia({
    createSpy: vi.fn,
    initialState: {
      AgentsTeam: {
        linkToCreateAgent: 'https://github.com/weni-ai/weni-cli',
        assignAgentsFilters: {
          search: '',
          category: [],
          system: 'ALL_OFFICIAL',
          ...assignAgentsFiltersOverrides,
        },
        ...storeOverrides,
      },
    },
  });

  const wrapper = mount(EmptyState, {
    global: {
      plugins: [pinia],
    },
  });

  const agentsTeamStore = useAgentsTeamStore(pinia);

  return { wrapper, agentsTeamStore };
};

describe('AgentsListEmptyState', () => {
  const getTitle = (wrapper) =>
    wrapper.find('[data-testid="agents-list-empty-state-title"]');
  const getDescription = (wrapper) =>
    wrapper.find('[data-testid="agents-list-empty-state-description"]');
  const getCliLink = (wrapper) =>
    wrapper.find('[data-testid="weni-cli-documentation-link"]');

  it('renders the filters empty state by default', () => {
    const { wrapper } = mountEmptyState();

    expect(getTitle(wrapper).text()).toBe(
      i18n.global.t('agents.assign_agents.empty_states.filters.title'),
    );
    expect(getDescription(wrapper).text()).toContain(
      i18n.global.t('agents.assign_agents.empty_states.filters.description'),
    );
    expect(getCliLink(wrapper).exists()).toBe(false);
  });

  it('renders the search empty state when a search term is present', () => {
    const { wrapper } = mountEmptyState({
      assignAgentsFilters: {
        search: 'bot',
      },
    });

    expect(getTitle(wrapper).text()).toBe(
      i18n.global.t('agents.assign_agents.empty_states.search.title'),
    );
    expect(getDescription(wrapper).text()).toContain(
      i18n.global.t('agents.assign_agents.empty_states.search.description'),
    );
  });

  it('renders the custom empty state and opens the CLI documentation link', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

    const { wrapper, agentsTeamStore } = mountEmptyState({
      assignAgentsFilters: {
        system: 'ALL_CUSTOM',
        search: '',
      },
    });

    const cliLink = getCliLink(wrapper);

    expect(cliLink.exists()).toBe(true);
    expect(cliLink.text()).toBe(
      i18n.global.t('router.agents_team.gallery.weni_cli_documentation'),
    );

    await cliLink.trigger('click');

    expect(openSpy).toHaveBeenCalledWith(
      agentsTeamStore.linkToCreateAgent,
      '_blank',
    );
    openSpy.mockRestore();
  });
});
