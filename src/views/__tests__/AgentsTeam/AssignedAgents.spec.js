import { shallowMount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { createTestingPinia } from '@pinia/testing';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AssignedAgents from '@/views/AgentsTeam/AssignedAgents.vue';

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

describe('AssignedAgents.vue', () => {
  let wrapper;
  const agentsTeamStore = useAgentsTeamStore();

  const loadingCards = () =>
    wrapper.findAllComponents('[data-testid="loading-card"]');
  const teamCards = () =>
    wrapper.findAllComponents('[data-testid="team-card"]');
  const emptyState = () => wrapper.find('[data-testid="empty-state"]');
  const assignedAgentsIcon = () =>
    wrapper.find('[data-testid="assigned-agents-icon"]');
  const assignedAgentsTitle = () =>
    wrapper.find('[data-testid="assigned-agents-title"]');
  const assignedAgentsDescription = () =>
    wrapper.find('[data-testid="assigned-agents-description"]');
  const assignedAgentsButton = () =>
    wrapper.find('[data-testid="assigned-agents-button"]');

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
    wrapper = shallowMount(AssignedAgents, {
      global: {
        plugins: [pinia],
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

      expect(loadingCards().length).toBe(6);
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
    beforeEach(async () => {
      agentsTeamStore.activeTeam.status = 'complete';
      agentsTeamStore.activeTeam.data.agents = [];
      await nextTick();
    });

    it('should render empty state when there are no agents', () => {
      expect(emptyState().exists()).toBe(true);
    });

    it('should render assigned agents icon when there are no agents', () => {
      expect(assignedAgentsIcon().exists()).toBe(true);
    });

    it('should render assigned agents title when there are no agents', () => {
      expect(assignedAgentsTitle().exists()).toBe(true);
    });

    it('should render assigned agents description when there are no agents', () => {
      expect(assignedAgentsDescription().exists()).toBe(true);
    });

    it('should render assigned agents button when there are no agents', () => {
      expect(assignedAgentsButton().exists()).toBe(true);
    });
  });
});
