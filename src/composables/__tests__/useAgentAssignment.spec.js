import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';
import { createPinia, setActivePinia } from 'pinia';

import useAgentAssignment from '@/composables/useAgentAssignment';

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

vi.mock('@/store/AgentsTeam', () => ({
  useAgentsTeamStore: () => ({
    addAgentToTeam: addAgentToTeamMock,
  }),
}));

import nexusaiAPI from '@/api/nexusaiAPI';
import { unnnicToastManager } from '@weni/unnnic-system';

const buildOfficialAgent = (overrides = {}) => ({
  uuid: null,
  name: 'Concierge',
  group: 'CONCIERGE',
  slug: 'concierge',
  is_official: true,
  systems: ['vtex', 'synerise'],
  mcps: [
    {
      name: 'Default',
      description: { en: 'desc', pt: '', es: '' },
      system: 'vtex',
      config: [
        {
          name: 'country',
          label: 'Country',
          type: 'TEXT',
          is_required: true,
          default_value: null,
          options: [],
        },
      ],
      credentials: [
        { name: 'token', label: 'API Token', is_confidential: true },
      ],
    },
  ],
  ...overrides,
});

const buildCustomAgent = (overrides = {}) => ({
  uuid: 'custom-uuid',
  name: 'Custom Agent',
  group: null,
  slug: 'custom-agent',
  is_official: false,
  systems: [],
  mcps: [
    {
      name: 'Default',
      description: { en: '', pt: '', es: '' },
      system: 'custom',
      config: [],
      credentials: [
        { name: 'api_key', label: 'API Key', is_confidential: true },
        { name: 'base_url', label: 'Base URL', is_confidential: false },
      ],
    },
  ],
  ...overrides,
});

describe('useAgentAssignment', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('pre-selects vtex when official agent has vtex in systems', () => {
      const agent = ref(buildOfficialAgent());
      const { config } = useAgentAssignment(agent);

      expect(config.value.system).toBe('vtex');
      expect(config.value.MCP).toBeNull();
      expect(config.value.mcp_config).toEqual({});
    });

    it('leaves system empty when official agent has no vtex system', () => {
      const agent = ref(buildOfficialAgent({ systems: ['synerise', 'other'] }));
      const { config } = useAgentAssignment(agent);

      expect(config.value.system).toBe('');
    });

    it('pre-populates MCP with mcps[0] for custom agents', () => {
      const agent = ref(buildCustomAgent());
      const { config } = useAgentAssignment(agent);

      expect(config.value.MCP).toEqual(agent.value.mcps[0]);
      expect(config.value.system).toBe('');
    });

    it('seeds credentials map from the initial MCP credentials for custom agents', () => {
      const agent = ref(buildCustomAgent());
      const { config } = useAgentAssignment(agent);

      expect(config.value.credentials).toEqual({ api_key: '', base_url: '' });
    });
  });

  describe('resetAssignment', () => {
    it('restores the initial config and clears submitting state', () => {
      const agent = ref(buildCustomAgent());
      const { config, isSubmitting, resetAssignment } =
        useAgentAssignment(agent);

      config.value.mcp_config = { country: 'BRA' };
      config.value.credentials = { api_key: 'token', base_url: '' };
      isSubmitting.value = true;

      resetAssignment();

      expect(config.value.mcp_config).toEqual({});
      expect(config.value.credentials).toEqual({ api_key: '', base_url: '' });
      expect(isSubmitting.value).toBe(false);
    });
  });

  describe('MCP watcher', () => {
    it('rebuilds credentials map when MCP changes, preserving overlapping keys', async () => {
      const agent = ref(buildOfficialAgent());
      const { config } = useAgentAssignment(agent);

      config.value.MCP = {
        name: 'A',
        description: { en: '', pt: '', es: '' },
        system: 'vtex',
        config: [],
        credentials: [
          { name: 'token', label: 't', is_confidential: false },
          { name: 'shared', label: 's', is_confidential: false },
        ],
      };
      await nextTick();
      config.value.credentials = { token: 'abc', shared: 'old' };

      config.value.MCP = {
        name: 'B',
        description: { en: '', pt: '', es: '' },
        system: 'vtex',
        config: [],
        credentials: [
          { name: 'shared', label: 's', is_confidential: false },
          { name: 'extra', label: 'e', is_confidential: false },
        ],
      };
      await nextTick();

      expect(config.value.credentials).toEqual({ shared: 'old', extra: '' });
    });

    it('clears credentials when MCP becomes null', async () => {
      const agent = ref(buildCustomAgent());
      const { config } = useAgentAssignment(agent);

      config.value.MCP = null;
      await nextTick();

      expect(config.value.credentials).toEqual({});
    });
  });

  describe('submitAssignment - official', () => {
    it('sends payload with group, system, mcp, mcp_config and credentials array, then adds normalized agent', async () => {
      nexusaiAPI.router.agents_team.toggleAgentAssignment.mockResolvedValue({
        data: { agent: { uuid: 'new-uuid', slug: 'concierge' } },
      });

      const agent = ref(buildOfficialAgent());
      const { config, submitAssignment } = useAgentAssignment(agent);

      config.value.MCP = agent.value.mcps[0];
      await nextTick();
      config.value.mcp_config = { country: 'BRA' };
      config.value.credentials = { token: 'secret' };

      const result = await submitAssignment();

      expect(result).toBe(true);
      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).toHaveBeenCalledWith({
        group: 'CONCIERGE',
        assigned: true,
        system: 'vtex',
        mcp: 'Default',
        mcp_config: { country: 'BRA' },
        credentials: [
          {
            name: 'token',
            label: 'API Token',
            is_confidential: true,
            value: 'secret',
          },
        ],
      });

      const normalizedAgent = addAgentToTeamMock.mock.calls[0][0];
      expect(normalizedAgent.uuid).toBe('new-uuid');
      expect(normalizedAgent.id).toBe('concierge');
      expect(normalizedAgent.systems).toEqual(['vtex']);
      expect(normalizedAgent.mcps).toHaveLength(1);
      expect(normalizedAgent.mcps[0].name).toBe('Default');
      expect(normalizedAgent.mcps[0].config[0]).toMatchObject({
        name: 'country',
        value: 'BRA',
      });
    });

    it('returns false when official agent has no group', async () => {
      const agent = ref(buildOfficialAgent({ group: null }));
      const { config, submitAssignment } = useAgentAssignment(agent);

      config.value.MCP = agent.value.mcps[0];
      await nextTick();

      const result = await submitAssignment();

      expect(result).toBe(false);
      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).not.toHaveBeenCalled();
    });

    it('returns false when no MCP is selected', async () => {
      const agent = ref(buildOfficialAgent());
      const { submitAssignment } = useAgentAssignment(agent);

      const result = await submitAssignment();

      expect(result).toBe(false);
      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).not.toHaveBeenCalled();
    });
  });

  describe('submitAssignment - custom', () => {
    it('sends agent_uuid, mcp_config and credentials in the assign body, then adds the agent', async () => {
      nexusaiAPI.router.agents_team.toggleAgentAssignment.mockResolvedValue({
        data: {},
      });

      const agent = ref(buildCustomAgent());
      const { config, submitAssignment } = useAgentAssignment(agent);

      config.value.mcp_config = { country: 'BRA' };
      config.value.credentials = { api_key: 'token', base_url: 'https://x' };

      const result = await submitAssignment();

      expect(result).toBe(true);
      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).toHaveBeenCalledWith({
        agent_uuid: 'custom-uuid',
        assigned: true,
        mcp_config: { country: 'BRA' },
        credentials: [
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
            value: 'https://x',
          },
        ],
      });
      expect(addAgentToTeamMock).toHaveBeenCalledWith(agent.value);
    });

    it('sends an empty credentials array when MCP has no credentials', async () => {
      nexusaiAPI.router.agents_team.toggleAgentAssignment.mockResolvedValue({
        data: {},
      });

      const agent = ref(
        buildCustomAgent({
          mcps: [
            {
              name: 'Default',
              description: { en: '', pt: '', es: '' },
              system: 'custom',
              config: [],
              credentials: [],
            },
          ],
        }),
      );
      const { submitAssignment } = useAgentAssignment(agent);

      await submitAssignment();

      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).toHaveBeenCalledWith({
        agent_uuid: 'custom-uuid',
        assigned: true,
        mcp_config: {},
        credentials: [],
      });
    });

    it('returns false when custom agent has no uuid', async () => {
      const agent = ref(buildCustomAgent({ uuid: '' }));
      const { submitAssignment } = useAgentAssignment(agent);

      const result = await submitAssignment();

      expect(result).toBe(false);
      expect(
        nexusaiAPI.router.agents_team.toggleAgentAssignment,
      ).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('logs error, shows toast and returns false on API failure', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      nexusaiAPI.router.agents_team.toggleAgentAssignment.mockRejectedValue(
        new Error('boom'),
      );

      const agent = ref(buildCustomAgent());
      const { submitAssignment, isSubmitting } = useAgentAssignment(agent);

      const result = await submitAssignment();

      expect(result).toBe(false);
      expect(unnnicToastManager.error).toHaveBeenCalled();
      expect(isSubmitting.value).toBe(false);
    });
  });
});
