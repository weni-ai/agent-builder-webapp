import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';

import ModalAssignAgentGroupFlow from '../index.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: vi.fn((key) => key),
  }),
}));

const useOfficialAgentAssignmentMock = vi.hoisted(() => vi.fn());
const useCustomAgentAssignmentMock = vi.hoisted(() => vi.fn());

vi.mock('@/composables/useOfficialAgentAssignment', () => ({
  default: (...args) => useOfficialAgentAssignmentMock(...args),
}));

vi.mock('@/composables/useCustomAgentAssignment', () => ({
  default: (...args) => useCustomAgentAssignmentMock(...args),
}));

const officialAgentFixture = {
  name: 'Concierge',
  is_official: true,
  systems: ['VTEX', 'SYNERISE'],
  MCPs: [
    {
      name: 'VTEX MCP',
      description: 'VTEX integration',
      system: 'VTEX',
      credentials: [{ name: 'token', label: 'API Token' }],
      constants: [],
    },
  ],
  agents: [
    {
      uuid: 'variant-vtex',
      variant: 'DEFAULT',
      systems: ['VTEX'],
    },
  ],
};

const officialAgentWithoutMCPsFixture = {
  uuid: 'official-no-mcps',
  name: 'Debug Reverse Agent',
  is_official: true,
  group: null,
  systems: [],
  MCPs: [],
  credentials: [{ name: 'token', label: 'Token Aftersale API' }],
};

const customAgentFixture = {
  uuid: 'custom-agent-uuid',
  name: 'Custom Agent',
  is_official: false,
  constants: [
    { name: 'country', label: 'Country', type: 'TEXT', is_required: true },
  ],
  credentials: [{ name: 'api_key', label: 'API Key' }],
};

const customAgentOnlyConstantsFixture = {
  uuid: 'custom-agent-only-constants',
  name: 'Constants Only Agent',
  is_official: false,
  constants: [
    { name: 'country', label: 'Country', type: 'TEXT', is_required: true },
  ],
  credentials: [],
};

const customAgentOnlyCredentialsFixture = {
  uuid: 'custom-agent-only-credentials',
  name: 'Credentials Only Agent',
  is_official: false,
  constants: [],
  credentials: [{ name: 'api_key', label: 'API Key' }],
};

const createOfficialAssignmentState = () => ({
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

const mockMCPWithCredentials = {
  name: 'VTEX MCP',
  description: 'VTEX integration',
  system: 'VTEX',
  credentials: [{ name: 'token', label: 'API Token' }],
  constants: [],
};

const createCustomAssignmentState = () => ({
  config: ref({
    constants: {},
    credentials: {},
  }),
  isSubmitting: ref(false),
  resetAssignment: vi.fn(),
  submitAssignment: vi.fn().mockResolvedValue(true),
});

describe('ModalAssignAgentGroupFlow - official agent', () => {
  let wrapper;
  let assignmentState;

  const createWrapper = (props = {}) => {
    assignmentState = createOfficialAssignmentState();
    useOfficialAgentAssignmentMock.mockReturnValue(assignmentState);

    wrapper = shallowMount(ModalAssignAgentGroupFlow, {
      props: {
        agent: officialAgentFixture,
        open: true,
        ...props,
      },
    });
  };

  const firstStepContent = () =>
    wrapper.findComponent({ name: 'SystemStepContent' });
  const secondStepContent = () =>
    wrapper.findComponent({ name: 'MCPStepContent' });
  const thirdStepContent = () =>
    wrapper.findComponent({ name: 'CredentialsStepContent' });
  const findNextButton = () =>
    wrapper.find('[data-testid="modal-concierge-right-button"]');
  const findBackButton = () =>
    wrapper.find('[data-testid="modal-concierge-left-button"]');

  const advanceToStepThree = async () => {
    await findNextButton().trigger('click');
    await flushPromises();

    assignmentState.config.value.MCP = mockMCPWithCredentials;
    assignmentState.config.value.mcp_config = {};
    assignmentState.config.value.credentials = { token: 'secret' };
    await nextTick();

    await findNextButton().trigger('click');
    await flushPromises();
  };

  beforeEach(() => {
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

      assignmentState.config.value.credentials = {};
      await nextTick();

      expect(findNextButton().attributes('disabled')).toBeDefined();
      expect(assignmentState.submitAssignment).not.toHaveBeenCalled();
    });

    it('disables next button when credentials are empty object', async () => {
      await advanceToStepThree();

      assignmentState.config.value.credentials = {};
      await nextTick();

      expect(findNextButton().attributes('disabled')).toBeDefined();
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
      expect(wrapper.vm.stepIndex).toBe(1);

      await findNextButton().trigger('click');
      await flushPromises();

      expect(wrapper.vm.stepIndex).toBe(2);

      assignmentState.config.value.MCP = mockMCPWithCredentials;
      assignmentState.config.value.mcp_config = {};
      await nextTick();

      await findNextButton().trigger('click');
      await flushPromises();

      expect(wrapper.vm.stepIndex).toBe(3);
    });

    it('do not increment step if total steps is reached', async () => {
      await advanceToStepThree();
      await findNextButton().trigger('click');
      await flushPromises();

      expect(wrapper.vm.stepIndex).toBe(1);
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

describe('ModalAssignAgentGroupFlow - custom agent with both constants and credentials', () => {
  let wrapper;
  let assignmentState;

  const createWrapper = (props = {}) => {
    assignmentState = createCustomAssignmentState();
    useCustomAgentAssignmentMock.mockReturnValue(assignmentState);

    wrapper = shallowMount(ModalAssignAgentGroupFlow, {
      props: {
        agent: customAgentFixture,
        open: true,
        ...props,
      },
    });
  };

  const constantsStep = () =>
    wrapper.findComponent({ name: 'ConstantsStepContent' });
  const customCredentialsStep = () =>
    wrapper.findComponent({ name: 'CustomCredentialsStepContent' });
  const findNextButton = () =>
    wrapper.find('[data-testid="modal-concierge-right-button"]');

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('renders the constants step first', () => {
    expect(constantsStep().exists()).toBe(true);
    expect(customCredentialsStep().exists()).toBe(false);
  });

  it('does not render official-only steps', () => {
    expect(wrapper.findComponent({ name: 'SystemStepContent' }).exists()).toBe(
      false,
    );
    expect(wrapper.findComponent({ name: 'MCPStepContent' }).exists()).toBe(
      false,
    );
  });

  it('uses 2 steps for custom agents with both constants and credentials', () => {
    expect(wrapper.vm.totalSteps).toBe(2);
  });

  it('disables next when required constant is missing', () => {
    expect(findNextButton().attributes('disabled')).toBeDefined();
  });

  it('advances to credentials step when constants are filled', async () => {
    assignmentState.config.value.constants = { country: 'BRA' };
    await nextTick();

    expect(findNextButton().attributes('disabled')).toBe('false');

    await findNextButton().trigger('click');
    await flushPromises();

    expect(customCredentialsStep().exists()).toBe(true);
    expect(constantsStep().exists()).toBe(false);
  });

  it('submits the assignment on the credentials step', async () => {
    assignmentState.config.value.constants = { country: 'BRA' };
    await nextTick();
    await findNextButton().trigger('click');
    await flushPromises();

    assignmentState.config.value.credentials = { api_key: 'token' };
    await nextTick();

    await findNextButton().trigger('click');
    await flushPromises();

    expect(assignmentState.submitAssignment).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });
});

describe('ModalAssignAgentGroupFlow - custom agent with only constants', () => {
  let wrapper;
  let assignmentState;

  const createWrapper = () => {
    assignmentState = createCustomAssignmentState();
    useCustomAgentAssignmentMock.mockReturnValue(assignmentState);

    wrapper = shallowMount(ModalAssignAgentGroupFlow, {
      props: {
        agent: customAgentOnlyConstantsFixture,
        open: true,
      },
    });
  };

  const constantsStep = () =>
    wrapper.findComponent({ name: 'ConstantsStepContent' });
  const customCredentialsStep = () =>
    wrapper.findComponent({ name: 'CustomCredentialsStepContent' });
  const findNextButton = () =>
    wrapper.find('[data-testid="modal-concierge-right-button"]');

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('uses 1 step when agent has only constants', () => {
    expect(wrapper.vm.totalSteps).toBe(1);
  });

  it('renders constants step and skips credentials step', () => {
    expect(constantsStep().exists()).toBe(true);
    expect(customCredentialsStep().exists()).toBe(false);
  });

  it('submits directly after filling constants', async () => {
    assignmentState.config.value.constants = { country: 'BRA' };
    await nextTick();

    await findNextButton().trigger('click');
    await flushPromises();

    expect(assignmentState.submitAssignment).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });
});

describe('ModalAssignAgentGroupFlow - custom agent with only credentials', () => {
  let wrapper;
  let assignmentState;

  const createWrapper = () => {
    assignmentState = createCustomAssignmentState();
    useCustomAgentAssignmentMock.mockReturnValue(assignmentState);

    wrapper = shallowMount(ModalAssignAgentGroupFlow, {
      props: {
        agent: customAgentOnlyCredentialsFixture,
        open: true,
      },
    });
  };

  const constantsStep = () =>
    wrapper.findComponent({ name: 'ConstantsStepContent' });
  const customCredentialsStep = () =>
    wrapper.findComponent({ name: 'CustomCredentialsStepContent' });
  const findNextButton = () =>
    wrapper.find('[data-testid="modal-concierge-right-button"]');

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('uses 1 step when agent has only credentials', () => {
    expect(wrapper.vm.totalSteps).toBe(1);
  });

  it('renders credentials step directly and skips constants step', () => {
    expect(customCredentialsStep().exists()).toBe(true);
    expect(constantsStep().exists()).toBe(false);
  });

  it('submits directly after filling credentials', async () => {
    assignmentState.config.value.credentials = { api_key: 'token' };
    await nextTick();

    await findNextButton().trigger('click');
    await flushPromises();

    expect(assignmentState.submitAssignment).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('disables next button when credentials are empty', () => {
    expect(findNextButton().attributes('disabled')).toBeDefined();
  });

  it('disables next button when credentials object is empty', async () => {
    assignmentState.config.value.credentials = {};
    await nextTick();

    expect(findNextButton().attributes('disabled')).toBeDefined();
  });
});

describe('ModalAssignAgentGroupFlow - official agent without MCPs', () => {
  let wrapper;
  let assignmentState;

  const createWrapper = () => {
    assignmentState = createCustomAssignmentState();
    useCustomAgentAssignmentMock.mockReturnValue(assignmentState);

    wrapper = shallowMount(ModalAssignAgentGroupFlow, {
      props: {
        agent: officialAgentWithoutMCPsFixture,
        open: true,
      },
    });
  };

  const constantsStep = () =>
    wrapper.findComponent({ name: 'ConstantsStepContent' });
  const customCredentialsStep = () =>
    wrapper.findComponent({ name: 'CustomCredentialsStepContent' });
  const mcpStep = () => wrapper.findComponent({ name: 'MCPStepContent' });
  const findNextButton = () =>
    wrapper.find('[data-testid="modal-concierge-right-button"]');

  beforeEach(() => {
    createWrapper();
  });

  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllMocks();
  });

  it('uses simple flow (no MCP step) for official agent without MCPs', () => {
    expect(mcpStep().exists()).toBe(false);
  });

  it('uses 1 step when official agent has only credentials', () => {
    expect(wrapper.vm.totalSteps).toBe(1);
  });

  it('renders credentials step directly', () => {
    expect(customCredentialsStep().exists()).toBe(true);
    expect(constantsStep().exists()).toBe(false);
  });

  it('uses customAssignment composable instead of officialAssignment', () => {
    expect(useCustomAgentAssignmentMock).toHaveBeenCalled();
  });

  it('submits directly after filling credentials', async () => {
    assignmentState.config.value.credentials = { token: 'secret' };
    await nextTick();

    await findNextButton().trigger('click');
    await flushPromises();

    expect(assignmentState.submitAssignment).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted('update:open')).toEqual([[false]]);
  });

  it('disables next button when credentials are empty', () => {
    expect(findNextButton().attributes('disabled')).toBeDefined();
  });
});
