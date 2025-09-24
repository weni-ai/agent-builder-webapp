import { afterEach, beforeEach, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import { createTestingPinia } from '@pinia/testing';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useTuningsStore } from '@/store/Tunings';
import i18n from '@/utils/plugins/i18n';

import AssignAgentCard from '../AssignAgentCard.vue';

const pinia = createTestingPinia({
  initialState: {
    officialAgents: {
      status: null,
      data: [],
    },
    myAgents: {
      status: null,
      data: [],
    },
  },
});

describe('AssignAgentCard.vue', () => {
  let wrapper;

  const agentsTeamStore = useAgentsTeamStore();
  const tuningsStore = useTuningsStore();

  beforeEach(() => {
    wrapper = mount(AssignAgentCard, {
      global: {
        plugins: [pinia],
        stubs: {
          AssignAgentDrawer: true,
        },
      },
      props: {
        loading: false,
        agent: {
          name: 'Test Title',
          description: 'Test Description',
          skills: [
            { name: 'Skill 1', icon: 'icon-1' },
            { name: 'Skill 2', icon: 'icon-2' },
          ],
        },
      },
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    expect(wrapper.element).toMatchSnapshot();
  });

  it('should renders correctly when loading', async () => {
    await wrapper.setProps({ loading: true });

    expect(
      wrapper
        .findComponent('[data-testid="assign-agent-card-skeleton"]')
        .exists(),
    ).toBe(true);
  });

  it('should renders correctly when not loading', () => {
    expect(wrapper.find('[data-testid="title"]').text()).toBe('Test Title');
    expect(wrapper.find('[data-testid="description"]').text()).toBe(
      'Test Description',
    );
    expect(wrapper.findAll('[data-testid="skill"]').length).toBe(2);
  });

  it('should renders skills correctly', () => {
    const skills = wrapper.findAllComponents('[data-testid="skill"]');
    expect(skills[0].props('title')).toBe('Skill 1');
    expect(skills[0].props('icon')).toBe('icon-1');
    expect(skills[1].props('title')).toBe('Skill 2');
    expect(skills[1].props('icon')).toBe('icon-2');
  });

  describe('ContentHeader', () => {
    it('should render header actions when assignment is false', async () => {
      await wrapper.setProps({ assignment: false });
      expect(
        wrapper.find('[data-testid="assign-agent-card-actions"]').exists(),
      ).toBe(true);
    });

    it('should not render header actions when assignment is true', () => {
      expect(
        wrapper.find('[data-testid="assign-agent-card-actions"]').exists(),
      ).toBe(false);
    });

    it('should render official tag when agent is official', async () => {
      await wrapper.setProps({
        assignment: false,
        agent: {
          ...wrapper.props('agent'),
          is_official: true,
        },
      });

      const tag = wrapper.findComponent('[data-testid="agent-tag"]');
      expect(tag.props('text')).toBe(
        i18n.global.t('router.agents_team.card.official'),
      );

      expect(tag.props('scheme')).toBe('weni');
    });

    it('should render custom tag when agent is not official', async () => {
      await wrapper.setProps({
        assignment: false,
        agent: {
          ...wrapper.props('agent'),
          is_official: false,
        },
      });

      const tag = wrapper.findComponent('[data-testid="agent-tag"]');
      expect(tag.props('text')).toBe(
        i18n.global.t('router.agents_team.card.custom'),
      );
      expect(tag.props('scheme')).toBe('aux-purple');
    });
  });

  describe('Assign button', () => {
    beforeEach(async () => {
      await wrapper.setProps({ assignment: true });
    });

    const assignButton = () =>
      wrapper.findComponent('[data-testid="assign-button"]');

    test('renders assign button with correct type and iconLeft', async () => {
      expect(assignButton().props('type')).toBe('primary');
      expect(assignButton().props('iconLeft')).toBe('');

      await wrapper.setProps({
        agent: { ...wrapper.props('agent'), assigned: true },
      });

      expect(assignButton().props('type')).toBe('secondary');
      expect(assignButton().props('iconLeft')).toBe('check');
    });

    it('calls toggleAgentAssignment when button is clicked for an agent without credentials', async () => {
      await wrapper.setProps({
        agent: { ...wrapper.props('agent'), assigned: false },
      });

      const toggleAgentAssignmentSpy = vi.spyOn(
        wrapper.vm,
        'toggleAgentAssignment',
      );

      await assignButton().trigger('click');

      expect(toggleAgentAssignmentSpy).toHaveBeenCalled();
    });

    it('should log error when toggleAgentAssignment throws an error', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      agentsTeamStore.toggleAgentAssignment = vi
        .fn()
        .mockRejectedValue(new Error(''));

      await wrapper.vm.toggleAgentAssignment();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    describe('toggleDrawer', () => {
      it('should toggle the isAssignDrawerOpen when toggleDrawer called', async () => {
        expect(wrapper.vm.isAssignDrawerOpen).toBe(false);

        await wrapper.vm.toggleDrawer();

        expect(wrapper.vm.isAssignDrawerOpen).toBe(true);

        await wrapper.vm.toggleDrawer();

        expect(wrapper.vm.isAssignDrawerOpen).toBe(false);
      });

      it('should call toggleDrawer when clicking assign button with agent having credentials', async () => {
        await wrapper.setProps({
          agent: {
            ...wrapper.props('agent'),
            assigned: false,
            credentials: [{ id: 1 }],
          },
        });

        const toggleDrawerSpy = vi.spyOn(wrapper.vm, 'toggleDrawer');

        await assignButton().trigger('click');

        expect(toggleDrawerSpy).toHaveBeenCalled();
      });

      it('should not call toggleDrawer for agent without credentials', async () => {
        await wrapper.setProps({
          agent: {
            ...wrapper.props('agent'),
            assigned: false,
            credentials: [],
          },
        });

        const toggleDrawerSpy = vi.spyOn(wrapper.vm, 'toggleDrawer');
        const toggleAgentAssignmentSpy = vi.spyOn(
          wrapper.vm,
          'toggleAgentAssignment',
        );

        await assignButton().trigger('click');

        expect(toggleDrawerSpy).not.toHaveBeenCalled();
        expect(toggleAgentAssignmentSpy).toHaveBeenCalled();
      });

      it('should not call toggleDrawer for already assigned agent', async () => {
        await wrapper.setProps({
          agent: {
            ...wrapper.props('agent'),
            assigned: true,
            credentials: [{ id: 1 }],
          },
        });

        const toggleDrawerSpy = vi.spyOn(wrapper.vm, 'toggleDrawer');
        const toggleAgentAssignmentSpy = vi.spyOn(
          wrapper.vm,
          'toggleAgentAssignment',
        );

        await assignButton().trigger('click');

        expect(toggleDrawerSpy).not.toHaveBeenCalled();
        expect(toggleAgentAssignmentSpy).toHaveBeenCalled();
      });
    });
  });

  describe('assignAgent', () => {
    beforeEach(() => {
      agentsTeamStore.toggleAgentAssignment = vi.fn().mockResolvedValue({
        status: 'success',
      });

      tuningsStore.fetchCredentials = vi.fn().mockResolvedValue();
    });

    it('should emit agent-assigned event when agent is successfully assigned', async () => {
      await wrapper.setProps({
        assignment: true,
        agent: {
          ...wrapper.props('agent'),
          assigned: false,
          external_id: 'test-id',
        },
      });

      await wrapper.vm.assignAgent();

      expect(wrapper.emitted('agent-assigned')).toBeTruthy();
    });

    it('should not emit agent-assigned event when agent is successfully unassigned', async () => {
      await wrapper.setProps({
        assignment: true,
        agent: {
          ...wrapper.props('agent'),
          assigned: true,
          external_id: 'test-id',
        },
      });

      await wrapper.vm.assignAgent();

      expect(wrapper.emitted('agent-assigned')).toBeFalsy();
    });

    it('should call fetchCredentials when agent has credentials', async () => {
      await wrapper.setProps({
        assignment: true,
        agent: {
          ...wrapper.props('agent'),
          credentials: [{ id: 1 }],
          external_id: 'test-id',
        },
      });

      await wrapper.vm.assignAgent();

      expect(tuningsStore.fetchCredentials).toHaveBeenCalled();
    });

    it('should call fetchCredentials when assignment is false', async () => {
      await wrapper.setProps({
        assignment: false,
        agent: {
          ...wrapper.props('agent'),
          credentials: [],
          external_id: 'test-id',
        },
      });

      await wrapper.vm.assignAgent();

      expect(tuningsStore.fetchCredentials).toHaveBeenCalled();
    });

    it('should not call fetchCredentials when agent has no credentials and assignment is true', async () => {
      await wrapper.setProps({
        assignment: true,
        agent: {
          ...wrapper.props('agent'),
          credentials: [],
          external_id: 'test-id',
        },
      });

      await wrapper.vm.assignAgent();

      expect(tuningsStore.fetchCredentials).not.toHaveBeenCalled();
    });

    it('should not process success actions when status is not success', async () => {
      agentsTeamStore.toggleAgentAssignment = vi.fn().mockResolvedValue({
        status: 'error',
      });

      await wrapper.setProps({
        assignment: true,
        agent: {
          ...wrapper.props('agent'),
          assigned: false,
          credentials: [{ id: 1 }],
          external_id: 'test-id',
        },
      });

      await wrapper.vm.assignAgent();

      expect(wrapper.emitted('agent-assigned')).toBeFalsy();
      expect(tuningsStore.fetchCredentials).not.toHaveBeenCalled();
    });
  });

  describe('toggleDrawerAssigning function', () => {
    beforeEach(() => {
      vi.spyOn(wrapper.vm, 'assignAgent').mockResolvedValue();
      vi.spyOn(wrapper.vm, 'toggleDrawer').mockResolvedValue();
    });

    it('should set isDrawerAssigning to true during assignment process', async () => {
      expect(wrapper.vm.isDrawerAssigning).toBe(false);

      const process = wrapper.vm.toggleDrawerAssigning();

      expect(wrapper.vm.isDrawerAssigning).toBe(true);

      await process;
    });

    it('should set isDrawerAssigning to false after assignment process', async () => {
      await wrapper.vm.toggleDrawerAssigning();

      expect(wrapper.vm.isDrawerAssigning).toBe(false);
    });

    it('should assign agent during the process', async () => {
      await wrapper.vm.toggleDrawerAssigning();

      expect(agentsTeamStore.toggleAgentAssignment).toHaveBeenCalled();
    });

    it('should toggle drawer after the assignment process', async () => {
      wrapper.vm.isAssignDrawerOpen = true;

      await wrapper.vm.toggleDrawerAssigning();

      expect(wrapper.vm.isAssignDrawerOpen).toBe(false);
    });

    it('should still call toggleDrawer even if assignAgent throws an error', async () => {
      wrapper.vm.isAssignDrawerOpen = true;
      vi.spyOn(wrapper.vm, 'assignAgent').mockRejectedValue(new Error(''));

      await wrapper.vm.toggleDrawerAssigning();

      expect(wrapper.vm.isAssignDrawerOpen).toBe(false);
    });
  });
});
