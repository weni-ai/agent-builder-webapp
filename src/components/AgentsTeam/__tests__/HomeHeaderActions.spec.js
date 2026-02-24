import { afterEach, describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

import HomeHeaderActions from '../HomeHeaderActions.vue';
import i18n from '@/utils/plugins/i18n';

describe('HomeHeaderActions.vue', () => {
  let wrapper;
  let pinia;
  let openAgentsGalleryMock;

  const createWrapper = (initialState = {}) => {
    openAgentsGalleryMock = vi.fn();
    pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          activeTeam: {
            data: {
              agents: [],
            },
            ...initialState,
          },
        },
      },
    });
    const store = useAgentsTeamStore(pinia);
    store.openAgentsGallery = openAgentsGalleryMock;

    wrapper = shallowMount(HomeHeaderActions, {
      global: {
        plugins: [pinia],
      },
    });
  };

  const findAssignButton = () =>
    wrapper.find('[data-testid="assign-agents-button"]');

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders assign agents button when team has at least one agent', () => {
    pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          activeTeam: {
            data: {
              agents: [{ uuid: 'agent-1' }],
            },
          },
        },
      },
    });
    const store = useAgentsTeamStore(pinia);
    store.openAgentsGallery = vi.fn();

    wrapper = shallowMount(HomeHeaderActions, {
      global: { plugins: [pinia] },
    });

    expect(findAssignButton().exists()).toBe(true);
  });

  it('does not render assign button when team has no agents', () => {
    createWrapper();

    expect(findAssignButton().exists()).toBe(false);
  });

  it('does not render assign button when activeTeam.data.agents is empty array', () => {
    createWrapper({ data: { agents: [] } });

    expect(findAssignButton().exists()).toBe(false);
  });

  it('calls openAgentsGallery when assign button is clicked', async () => {
    pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          activeTeam: {
            data: {
              agents: [{ uuid: 'agent-1' }],
            },
          },
        },
      },
    });
    const store = useAgentsTeamStore(pinia);
    openAgentsGalleryMock = vi.fn();
    store.openAgentsGallery = openAgentsGalleryMock;

    wrapper = shallowMount(HomeHeaderActions, {
      global: { plugins: [pinia] },
    });

    await findAssignButton().trigger('click');

    expect(openAgentsGalleryMock).toHaveBeenCalledTimes(1);
  });

  it('assign button has type primary', () => {
    pinia = createTestingPinia({
      initialState: {
        AgentsTeam: {
          activeTeam: {
            data: {
              agents: [{ uuid: 'agent-1' }],
            },
          },
        },
      },
    });
    const store = useAgentsTeamStore(pinia);
    store.openAgentsGallery = vi.fn();

    wrapper = shallowMount(HomeHeaderActions, {
      global: { plugins: [pinia] },
    });

    const button = wrapper.findComponent(
      '[data-testid="assign-agents-button"]',
    );
    expect(button.props('type')).toBe('primary');
    expect(button.props('text')).toBe(
      i18n.global.t('router.agents_team.assign_agents'),
    );
  });
});
