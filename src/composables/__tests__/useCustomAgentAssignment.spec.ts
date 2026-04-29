import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import useCustomAgentAssignment from '@/composables/useCustomAgentAssignment';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      agents_team: {
        toggleAgentAssignment: vi.fn(),
      },
    },
  },
}));

vi.mock('@weni/unnnic-system', () => ({
  unnnicToastManager: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/utils/plugins/i18n', () => ({
  default: { global: { t: vi.fn((key) => key) } },
}));

const addAgentToTeamMock = vi.hoisted(() => vi.fn());
const createCredentialsMock = vi.hoisted(() => vi.fn());

vi.mock('@/store/AgentsTeam', () => ({
  useAgentsTeamStore: () => ({
    addAgentToTeam: addAgentToTeamMock,
  }),
}));

vi.mock('@/store/Tunings', () => ({
  useTuningsStore: () => ({
    createCredentials: createCredentialsMock,
  }),
}));

import nexusaiAPI from '@/api/nexusaiAPI';
import { unnnicToastManager } from '@weni/unnnic-system';

const buildAgent = (overrides = {}) => ({
  uuid: 'custom-uuid',
  name: 'Custom Agent',
  is_official: false,
  credentials: [
    { name: 'api_key', label: 'API Key', is_confidential: true },
    { name: 'base_url', label: 'Base URL', is_confidential: false },
  ],
  constants: [],
  ...overrides,
});

describe('useCustomAgentAssignment', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes config with empty constants and credentials', () => {
    const agent = ref(buildAgent());
    const { config } = useCustomAgentAssignment(agent);

    expect(config.value).toEqual({ constants: {}, credentials: {} });
  });

  it('resets config and submitting state on resetAssignment', () => {
    const agent = ref(buildAgent());
    const { config, isSubmitting, resetAssignment } =
      useCustomAgentAssignment(agent);

    config.value.constants = { country: 'BRA' };
    config.value.credentials = { api_key: 'token' };
    isSubmitting.value = true;

    resetAssignment();

    expect(config.value).toEqual({ constants: {}, credentials: {} });
    expect(isSubmitting.value).toBe(false);
  });

  it('submits credentials separately and constants as mcp_config', async () => {
    createCredentialsMock.mockResolvedValue(undefined);
    nexusaiAPI.router.agents_team.toggleAgentAssignment.mockResolvedValue({
      data: {},
    });

    const agent = ref(buildAgent());
    const { config, submitAssignment } = useCustomAgentAssignment(agent);

    config.value.constants = { country: 'BRA' };
    config.value.credentials = { api_key: 'token' };

    const result = await submitAssignment();

    expect(result).toBe(true);
    expect(createCredentialsMock).toHaveBeenCalledWith('custom-uuid', [
      {
        name: 'api_key',
        label: 'API Key',
        is_confidential: true,
        value: 'token',
      },
      {
        name: 'base_url',
        label: 'Base URL',
        is_confidential: false,
        value: '',
      },
    ]);
    expect(
      nexusaiAPI.router.agents_team.toggleAgentAssignment,
    ).toHaveBeenCalledWith({
      agentUuid: 'custom-uuid',
      is_assigned: true,
      mcp_config: { country: 'BRA' },
    });
    expect(addAgentToTeamMock).toHaveBeenCalledWith(agent.value);
  });

  it('returns false and shows toast when API errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    nexusaiAPI.router.agents_team.toggleAgentAssignment.mockRejectedValue(
      new Error('boom'),
    );

    const agent = ref(buildAgent());
    const { submitAssignment, isSubmitting } = useCustomAgentAssignment(agent);

    const result = await submitAssignment();

    expect(result).toBe(false);
    expect(unnnicToastManager.error).toHaveBeenCalled();
    expect(isSubmitting.value).toBe(false);
  });

  it('returns false when agent has no uuid', async () => {
    const agent = ref(buildAgent({ uuid: '' }));
    const { submitAssignment } = useCustomAgentAssignment(agent);

    const result = await submitAssignment();

    expect(result).toBe(false);
    expect(
      nexusaiAPI.router.agents_team.toggleAgentAssignment,
    ).not.toHaveBeenCalled();
    expect(createCredentialsMock).not.toHaveBeenCalled();
  });

  it('does not call createCredentials when agent has no credentials', async () => {
    nexusaiAPI.router.agents_team.toggleAgentAssignment.mockResolvedValue({
      data: {},
    });
    const agent = ref(buildAgent({ credentials: [] }));
    const { submitAssignment } = useCustomAgentAssignment(agent);

    await submitAssignment();

    expect(createCredentialsMock).not.toHaveBeenCalled();
    expect(
      nexusaiAPI.router.agents_team.toggleAgentAssignment,
    ).toHaveBeenCalledWith({
      agentUuid: 'custom-uuid',
      is_assigned: true,
      mcp_config: {},
    });
  });
});
