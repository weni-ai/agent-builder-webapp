import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { createTestingPinia } from '@pinia/testing';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

import ActiveTeam from '@/views/AgentsTeam/ActiveTeam.vue';

const pinia = createTestingPinia({
  initialState: {
    AgentsTeam: {
      activeTeam: {
        status: null,
        data: {
          agents: [],
        },
      },
      officialAgents: {
        status: null,
        data: [],
      },
      myAgents: {
        status: null,
        data: [],
      },
    },
  },
});

describe('ActiveTeam.vue', () => {
  let wrapper;
  const agentsTeamStore = useAgentsTeamStore();

  const loadingCards = () =>
    wrapper.findAllComponents('[data-testid="loading-card"]');
  const teamCards = () =>
    wrapper.findAllComponents('[data-testid="team-card"]');
  const emptyState = () => wrapper.find('[data-testid="empty-state"]');
  const assignAgentsLink = () =>
    wrapper.find('[data-testid="assign-agents-link"]');

  const mockAgents = [
    {
      uuid: 'uuid-1',
      name: 'Agent 1',
      description: 'Description 1',
      skills: [{ name: 'Skill 1', icon: '🛒' }],
    },
    {
      uuid: 'uuid-2',
      name: 'Agent 2',
      description: 'Description 2',
      skills: [{ name: 'Skill 2', icon: '💬' }],
    },
  ];

  beforeEach(() => {
    wrapper = shallowMount(ActiveTeam, {
      global: {
        plugins: [pinia],
        stubs: {
          'i18n-t': {
            template: '<div><slot name="assign_agents" /></div>',
          },
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component rendering', () => {
    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Loading state', () => {
    it('should render loading cards when team is loading', async () => {
      agentsTeamStore.activeTeam.status = 'loading';
      await nextTick();

      expect(loadingCards().length).toBe(3);
    });

    it('should not render empty state when loading', async () => {
      agentsTeamStore.activeTeam.status = 'loading';
      agentsTeamStore.activeTeam.data.agents = [];
      await nextTick();

      expect(emptyState().exists()).toBe(false);
    });
  });

  describe('Active team state', () => {
    it('should render team cards when there are active agents', async () => {
      agentsTeamStore.activeTeam.status = 'complete';
      agentsTeamStore.activeTeam.data.agents = mockAgents;
      await nextTick();

      expect(teamCards().length).toBe(mockAgents.length);
    });

    it('should not render empty state when there are active agents', async () => {
      agentsTeamStore.activeTeam.status = 'complete';
      agentsTeamStore.activeTeam.data.agents = [mockAgents[0]];
      await nextTick();

      expect(emptyState().exists()).toBe(false);
    });
  });

  describe('Empty state', () => {
    it('should render empty state when there are no agents', async () => {
      agentsTeamStore.activeTeam.status = 'complete';
      agentsTeamStore.activeTeam.data.agents = [];
      await nextTick();

      expect(emptyState().exists()).toBe(true);
    });

    it('should open agents gallery when clicking on assign agents link', async () => {
      agentsTeamStore.activeTeam.status = 'complete';
      agentsTeamStore.activeTeam.data.agents = [];
      await nextTick();

      await assignAgentsLink().trigger('click');
      expect(agentsTeamStore.isAgentsGalleryOpen).toBe(true);
    });
  });
});
