import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import ModalAssignAgentGroupFlow from '../index.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key) => key),
  }),
}));

const getOfficialAgentDetailsMock = vi.hoisted(() => vi.fn());

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      agents_team: {
        getOfficialAgentDetails: getOfficialAgentDetailsMock,
      },
    },
  },
}));

const useOfficialAgentAssignmentMock = vi.hoisted(() => vi.fn());
const findAgentVariantUuidMock = vi.hoisted(() => vi.fn());

vi.mock('@/composables/useOfficialAgentAssignment', () => ({
  default: (...args) => useOfficialAgentAssignmentMock(...args),
  findAgentVariantUuid: (...args) => findAgentVariantUuidMock(...args),
}));

const agentFixture = {
  name: 'Concierge',
  systems: ['VTEX', 'SYNERISE'],
  MCPs: [],
  variants: [
    {
      uuid: 'variant-vtex',
      variant: 'DEFAULT',
      systems: ['VTEX'],
    },
  ],
};

const createAssignmentState = () => ({
  config: ref({
    system: 'VTEX',
    MCP: null,
    mcp_config: {},
    credentials: {},
  }),
  isSubmitting: ref(false),
  resetAssignment: vi.fn(),
  submitAssignment: vi.fn().mockResolvedValue(true),
});

describe('ModalAssignAgentGroupFlow', () => {
  let wrapper;
  let assignmentState;

  const createWrapper = (props = {}) => {
    assignmentState = createAssignmentState();
    useOfficialAgentAssignmentMock.mockReturnValue(assignmentState);

    wrapper = shallowMount(ModalAssignAgentGroupFlow, {
      props: {
        agent: agentFixture,
        open: true,
        ...props,
      },
    });
  };

  const firstStepContent = () =>
    wrapper.findComponent({ name: 'FirstStepContent' });
  const secondStepContent = () =>
    wrapper.findComponent({ name: 'SecondStepContent' });
  const thirdStepContent = () =>
    wrapper.findComponent({ name: 'ThirdStepContent' });
  const findNextButton = () =>
    wrapper.find('[data-testid="modal-concierge-right-button"]');
  const findBackButton = () =>
    wrapper.find('[data-testid="modal-concierge-left-button"]');

  const advanceToStepThree = async () => {
    await findNextButton().trigger('click');
    await flushPromises();

    assignmentState.config.value.MCP = { name: 'Mock MCP' };
    assignmentState.config.value.mcp_config = { apiKey: 'value' };
    assignmentState.config.value.credentials = { token: 'secret' };
    await nextTick();

    await findNextButton().trigger('click');
    await flushPromises();
  };

  beforeEach(() => {
    getOfficialAgentDetailsMock.mockResolvedValue({
      MCPs: [],
    });
    findAgentVariantUuidMock.mockReturnValue('variant-vtex');

    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  describe('Render steps correctly', () => {
    it('renders the first step by default', () => {
      expect(firstStepContent().exists()).toBe(true);
    });

    it('renders the second step when advancing to the second step', async () => {
      await findNextButton().trigger('click');
      await flushPromises();

      expect(secondStepContent().exists()).toBe(true);
    });

    it('renders the third step when advancing to the third step', async () => {
      await advanceToStepThree();

      expect(thirdStepContent().exists()).toBe(true);
    });
  });

  describe('Fetch agent details', () => {
    it('fetches agent details and advances to the second step', async () => {
      await findNextButton().trigger('click');
      await flushPromises();

      expect(getOfficialAgentDetailsMock).toHaveBeenCalledWith(
        'variant-vtex',
        'vtex',
      );
      expect(secondStepContent().exists()).toBe(true);
    });
  });

  describe('Buttons interactions', () => {
    it('closes the modal when clicking back on the first step', async () => {
      await findBackButton().trigger('click');

      expect(wrapper.emitted('update:open')).toEqual([[false]]);
      expect(assignmentState.resetAssignment).toHaveBeenCalled();
    });

    it('navigates to the next step when clicking the next button', async () => {
      await findNextButton().trigger('click');
      await flushPromises();

      expect(secondStepContent().exists()).toBe(true);
    });

    it('submits the assignment on the final step and closes the modal', async () => {
      await advanceToStepThree();
      await findNextButton().trigger('click');
      await flushPromises();

      expect(assignmentState.submitAssignment).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('update:open')).toEqual([[false]]);
      expect(assignmentState.resetAssignment).toHaveBeenCalled();
      expect(firstStepContent().exists()).toBe(true);
    });

    it('does not submit the assignment if the final step is not completed', async () => {
      await advanceToStepThree();

      assignmentState.config.value.credentials = { token: '' };
      await nextTick();

      expect(findNextButton().attributes('disabled')).toBeDefined();
      expect(assignmentState.submitAssignment).not.toHaveBeenCalled();
    });

    it('does not submit the assignment if the isSubmitting is true', async () => {
      await advanceToStepThree();

      assignmentState.isSubmitting.value = true;
      await nextTick();

      await findNextButton().trigger('click');

      expect(assignmentState.submitAssignment).not.toHaveBeenCalled();
    });

    it('does not navigate to the next step if the isNextDisabled is true', async () => {
      await findNextButton().trigger('click');
      await flushPromises();

      expect(secondStepContent().exists()).toBe(true);
      expect(findNextButton().attributes('disabled')).toBeDefined();
      expect(thirdStepContent().exists()).toBe(false);
    });
  });

  describe('Step logic', () => {
    it('resets the assignment when the modal is closed', async () => {
      await advanceToStepThree();
      assignmentState.resetAssignment.mockClear();

      await findBackButton().trigger('click');
      await findBackButton().trigger('click');
      await findBackButton().trigger('click');

      expect(wrapper.emitted('update:open')).toEqual(
        expect.arrayContaining([[false]]),
      );
      expect(assignmentState.resetAssignment).toHaveBeenCalled();
      expect(firstStepContent().exists()).toBe(true);
    });

    it('counts the steps correctly', async () => {
      expect(wrapper.vm.step).toBe(1);

      await findNextButton().trigger('click');
      await flushPromises();

      expect(wrapper.vm.step).toBe(2);

      assignmentState.config.value.MCP = { name: 'Mock MCP' };
      assignmentState.config.value.mcp_config = { apiKey: 'value' };
      await nextTick();

      await findNextButton().trigger('click');
      await flushPromises();

      expect(wrapper.vm.step).toBe(3);
    });

    it('do not increment step if total steps is reached', async () => {
      await advanceToStepThree();
      await findNextButton().trigger('click');
      await flushPromises();

      expect(wrapper.vm.step).toBe(1);
    });
  });

  describe('Button texts', () => {
    it('displays the correct text for the left button', async () => {
      expect(findBackButton().attributes('text')).toBe(
        'agents.assign_agents.setup.cancel_button',
      );

      await findNextButton().trigger('click');
      await flushPromises();

      expect(findBackButton().attributes('text')).toBe(
        'agents.assign_agents.setup.back_button',
      );
    });

    it('displays the correct text for the right button', async () => {
      expect(findNextButton().attributes('text')).toBe(
        'agents.assign_agents.setup.next_button',
      );

      await advanceToStepThree();

      expect(findNextButton().attributes('text')).toBe(
        'agents.assign_agents.setup.finish_button',
      );
    });
  });
});
