import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestingPinia } from '@pinia/testing';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { usePreviewStore } from '@/store/Preview';
import i18n from '@/utils/plugins/i18n';

import PreviewVisualFlow from '../PreviewVisualFlow.vue';

describe('PreviewVisualFlow.vue', () => {
  let wrapper;
  const mockTeamAgents = [
    {
      id: 1,
      name: 'Agent 1',
    },
    {
      id: 2,
      name: 'Agent 2',
    },
  ];

  const createWrapper = () => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        AgentsTeam: {
          activeTeam: {
            data: {
              manager: {
                name: 'Manager',
                id: 'manager',
              },
              agents: mockTeamAgents,
            },
          },
        },
        preview: {
          activeAgent: {
            id: 1,
            currentTask: 'Current Task',
          },
        },
      },
    });

    return mount(PreviewVisualFlow, {
      global: {
        plugins: [pinia],
        stubs: {
          BranchLines: true,
        },
      },
      attachTo: document.body,
    });
  };

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const visualFlow = () => wrapper.find('[data-testid="visual-flow"]');
  const managerCard = () =>
    wrapper.findComponent('[data-testid="visual-flow-manager"]');
  const teamSection = () => wrapper.find('[data-testid="visual-flow-team"]');
  const branchLines = () =>
    wrapper.findComponent('[data-testid="visual-flow-branch-lines"]');
  const agentCards = () =>
    wrapper.findAllComponents('[data-testid="visual-flow-agent"]');

  it('should render correctly', () => {
    expect(visualFlow().exists()).toBe(true);
    expect(managerCard().exists()).toBe(true);
    expect(teamSection().exists()).toBe(true);
    expect(branchLines().exists()).toBe(true);
  });

  it('should render manager card with correct props', () => {
    const manager = managerCard();
    expect(manager.props()).toEqual({
      name: 'Manager',
      active: true,
      currentTask: undefined,
      icon: undefined,
      bubbleDirection: 'bounce',
      type: 'manager',
    });
  });

  it('should render correct number of agent cards', () => {
    const agents = agentCards();
    expect(agents).toHaveLength(mockTeamAgents.length);
  });

  it('should pass correct props to agent cards', () => {
    const firstAgentCard = agentCards()[0];

    expect(firstAgentCard.props()).toEqual({
      name: mockTeamAgents[0].name,
      active: false,
      currentTask: 'Standby',
      icon: undefined,
      bubbleDirection: 'left',
      type: 'agent',
    });
  });

  it('should handle empty team agents', async () => {
    const agentsTeamStore = useAgentsTeamStore();
    agentsTeamStore.activeTeam.data.agents = [];
    await wrapper.vm.$nextTick();

    expect(teamSection().exists()).toBe(true);
    expect(agentCards()).toHaveLength(0);
  });

  describe('bubble direction', () => {
    it('should be bounce for manager', () => {
      const manager = managerCard();
      expect(manager.props().bubbleDirection).toBe('bounce');
    });

    it('should be left for odd agent', () => {
      const agent = agentCards()[0];
      expect(agent.props().bubbleDirection).toBe('left');
    });

    it('should be right for even agent', () => {
      const agent = agentCards()[1];
      expect(agent.props().bubbleDirection).toBe('right');
    });
  });

  describe('branch positions', () => {
    const defineRect = ({ height = 500, width = 500 } = {}) => {
      Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({
          width,
          height,
          top: 500,
          left: 500,
          right: 500,
          bottom: 500,
          x: 500,
          y: 500,
        }),
      });
    };

    beforeEach(() => {
      defineRect();
    });

    it('should update branch positions when active agent changes', async () => {
      const previewStore = usePreviewStore();
      const newActiveAgent = {
        id: 2,
        currentTask: 'New Task',
      };

      previewStore.activeAgent = newActiveAgent;
      await wrapper.vm.$nextTick();

      expect(branchLines().props('coloredLineIndex')).toBe(1);
    });

    it('should return empty positions when there are no agent refs', async () => {
      const agentsTeamStore = useAgentsTeamStore();
      agentsTeamStore.activeTeam.data.agents = null;
      await wrapper.vm.$nextTick();

      expect(branchLines().props('positions')).toEqual([]);
    });

    it('should alternate between left and right positions for agents', () => {
      const positions = branchLines().props('positions');

      expect(positions[0].isLeft).toBe(true); // First agent on left
      expect(positions[1].isLeft).toBe(false); // Second agent on right
    });

    it('should get visual flow height', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.visualFlowHeight).toBe(500);
    });

    it('should calculate correct branch positions based on agent position', () => {
      const positions = branchLines().props('positions');

      expect(positions[0]).toEqual({
        startY: 0,
        endY: 250,
        isLeft: true,
      });
    });
  });
});
