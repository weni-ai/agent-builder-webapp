import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ref, nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

import useOfficialAgentAssignment from '../useOfficialAgentAssignment';
import nexusaiAPI from '@/api/nexusaiAPI';
import { unnnicToastManager } from '@weni/unnnic-system';
import i18n from '@/utils/plugins/i18n';
import { useAgentsTeamStore } from '@/store/AgentsTeam';

import type { AgentGroup, AgentMCP } from '@/store/types/Agents.types';
import type { TranslatedField } from '../useTranslatedField';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    router: {
      agents_team: {
        toggleOfficialAgentAssignment: vi.fn(),
      },
    },
  },
}));

vi.mock('@weni/unnnic-system', () => ({
  unnnicToastManager: {
    error: vi.fn(),
  },
}));

vi.mock('../useTranslatedField', () => ({
  default:
    () =>
    <T>(field: TranslatedField<T> | undefined | null): T | undefined => {
      if (!field) return undefined;
      return field.en as T;
    },
}));

const createMockAgent = (overrides = {}): AgentGroup => ({
  name: 'Test Agent',
  description: 'Test description',
  type: 'PLUG_IN_PLAY',
  category: 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS',
  group: 'test-group',
  agents: [],
  MCPs: [],
  systems: [],
  assigned: false,
  icon: 'test-icon',
  is_official: true,
  ...overrides,
});

const createMockMCP = (overrides = {}): AgentMCP => ({
  name: 'test-mcp',
  description: { en: 'Test MCP', pt: null, es: null },
  system: 'vtex',
  credentials: [],
  config: [],
  ...overrides,
});

describe('useOfficialAgentAssignment', () => {
  let agentsTeamStore: ReturnType<typeof useAgentsTeamStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    agentsTeamStore = useAgentsTeamStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('returns config with initial values', () => {
      const agent = ref(createMockAgent());
      const { config } = useOfficialAgentAssignment(agent);

      expect(config.value.system).toBe('');
      expect(config.value.mcp_config).toEqual({});
      expect(config.value.MCP).toBeNull();
      expect(config.value.credentials).toEqual({});
    });

    it('returns isSubmitting as false', () => {
      const agent = ref(createMockAgent());
      const { isSubmitting } = useOfficialAgentAssignment(agent);

      expect(isSubmitting.value).toBe(false);
    });

    it('sets system to "vtex" when agent has VTEX system', () => {
      const agent = ref(createMockAgent({ systems: ['vtex', 'other'] }));
      const { config } = useOfficialAgentAssignment(agent);

      expect(config.value.system).toBe('vtex');
    });

    it('sets system to "vtex" when agent has VTEX system (case insensitive)', () => {
      const agent = ref(createMockAgent({ systems: ['VTEX'] }));
      const { config } = useOfficialAgentAssignment(agent);

      expect(config.value.system).toBe('vtex');
    });

    it('keeps system empty when agent has no VTEX system', () => {
      const agent = ref(createMockAgent({ systems: ['other', 'another'] }));
      const { config } = useOfficialAgentAssignment(agent);

      expect(config.value.system).toBe('');
    });
  });

  describe('resetAssignment', () => {
    it('resets config to initial values', () => {
      const agent = ref(createMockAgent());
      const { config, resetAssignment } = useOfficialAgentAssignment(agent);

      config.value.system = 'modified';
      config.value.mcp_config = { key: 'value' };
      config.value.MCP = createMockMCP();

      resetAssignment();

      expect(config.value.system).toBe('');
      expect(config.value.mcp_config).toEqual({});
      expect(config.value.MCP).toBeNull();
    });

    it('resets isSubmitting to false', () => {
      const agent = ref(createMockAgent());
      const { isSubmitting, resetAssignment } =
        useOfficialAgentAssignment(agent);

      resetAssignment();

      expect(isSubmitting.value).toBe(false);
    });
  });

  describe('MCP credentials watch', () => {
    it('sets empty credentials when MCP has no credentials', async () => {
      const agent = ref(createMockAgent());
      const { config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP({ credentials: [] });
      await nextTick();

      expect(config.value.credentials).toEqual({});
    });

    it('sets empty credentials when MCP credentials is undefined', async () => {
      const agent = ref(createMockAgent());
      const { config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP({ credentials: undefined });
      await nextTick();

      expect(config.value.credentials).toEqual({});
    });

    it('populates credentials with empty strings when MCP has credentials', async () => {
      const agent = ref(createMockAgent());
      const { config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP({
        credentials: [
          {
            name: 'API_KEY',
            label: 'API Key',
            placeholder: '',
            is_confidential: true,
          },
          {
            name: 'SECRET',
            label: 'Secret',
            placeholder: '',
            is_confidential: true,
          },
        ],
      });
      await nextTick();

      expect(config.value.credentials).toEqual({
        API_KEY: '',
        SECRET: '',
      });
    });

    it('preserves previous credential values when MCP changes', async () => {
      const agent = ref(createMockAgent());
      const { config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP({
        credentials: [
          {
            name: 'API_KEY',
            label: 'API Key',
            placeholder: '',
            is_confidential: true,
          },
        ],
      });
      await nextTick();

      config.value.credentials.API_KEY = 'my-api-key';

      config.value.MCP = createMockMCP({
        credentials: [
          {
            name: 'API_KEY',
            label: 'API Key',
            placeholder: '',
            is_confidential: true,
          },
          {
            name: 'NEW_KEY',
            label: 'New Key',
            placeholder: '',
            is_confidential: false,
          },
        ],
      });
      await nextTick();

      expect(config.value.credentials).toEqual({
        API_KEY: 'my-api-key',
        NEW_KEY: '',
      });
    });
  });

  describe('submitAssignment', () => {
    it('returns false when agent is not set', async () => {
      const agent = ref(null as unknown as AgentGroup);
      const { submitAssignment } = useOfficialAgentAssignment(agent);

      const result = await submitAssignment();

      expect(result).toBe(false);
    });

    it('returns false when MCP is not set', async () => {
      const agent = ref(createMockAgent());
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = null;

      const result = await submitAssignment();

      expect(result).toBe(false);
    });

    it('returns false when agent.group is not set', async () => {
      const agent = ref(createMockAgent({ group: '' }));
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP();

      const result = await submitAssignment();

      expect(result).toBe(false);
    });

    it('sets isSubmitting to true during submission', async () => {
      const agent = ref(createMockAgent());
      const { submitAssignment, config, isSubmitting } =
        useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP();

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: { agent: { uuid: '123', slug: 'test' } } }),
              100,
            ),
          ),
      );

      const promise = submitAssignment();
      expect(isSubmitting.value).toBe(true);

      await promise;
      expect(isSubmitting.value).toBe(false);
    });

    it('calls API with correct payload', async () => {
      const agent = ref(createMockAgent({ group: 'my-group' }));
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.system = 'vtex';
      config.value.MCP = createMockMCP({ name: 'my-mcp' });
      config.value.mcp_config = { option1: 'value1' };
      config.value.credentials = { API_KEY: 'secret' };

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockResolvedValue({
        data: { agent: { uuid: '123', slug: 'test-slug' } },
      });

      await submitAssignment();

      expect(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).toHaveBeenCalledWith({
        group: 'my-group',
        assigned: true,
        system: 'vtex',
        mcp: 'my-mcp',
        mcp_config: { option1: 'value1' },
        credentials: [],
      });
    });

    it('includes credentials in payload when MCP has credentials', async () => {
      const agent = ref(createMockAgent({ group: 'my-group' }));
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      const credentials = [
        {
          name: 'API_KEY',
          label: 'API Key',
          placeholder: '',
          is_confidential: true,
        },
      ];

      config.value.MCP = createMockMCP({ name: 'my-mcp', credentials });
      await nextTick();

      config.value.credentials.API_KEY = 'my-secret-key';

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockResolvedValue({
        data: { agent: { uuid: '123', slug: 'test-slug' } },
      });

      await submitAssignment();

      expect(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          credentials: [{ ...credentials[0], value: 'my-secret-key' }],
        }),
      );
    });

    it('adds agent to team store on success', async () => {
      const agent = ref(
        createMockAgent({
          group: 'my-group',
          presentation: { about: { en: 'About text', pt: null, es: null } },
        }),
      );
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP({
        name: 'my-mcp',
        description: { en: 'MCP Desc', pt: null, es: null },
      });

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockResolvedValue({
        data: {
          agent: {
            uuid: 'new-uuid',
            slug: 'new-slug',
            description: 'API description',
          },
        },
      });

      const addAgentSpy = vi.spyOn(agentsTeamStore, 'addAgentToTeam');

      await submitAssignment();

      expect(addAgentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          uuid: 'new-uuid',
          id: 'new-slug',
          description: 'About text',
          mcp: expect.objectContaining({
            name: 'my-mcp',
          }),
        }),
      );
    });

    it('returns true on success', async () => {
      const agent = ref(createMockAgent());
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP();

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockResolvedValue({
        data: { agent: { uuid: '123', slug: 'test' } },
      });

      const result = await submitAssignment();

      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const agent = ref(createMockAgent());
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP();

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockRejectedValue(new Error('API Error'));

      const result = await submitAssignment();

      expect(result).toBe(false);
    });

    it('shows error toast on error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const agent = ref(createMockAgent());
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP();

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockRejectedValue(new Error('API Error'));

      await submitAssignment();

      expect(unnnicToastManager.error).toHaveBeenCalledWith(
        i18n.global.t('router.agents_team.card.error_alert'),
      );
    });

    it('resets isSubmitting after error', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});

      const agent = ref(createMockAgent());
      const { submitAssignment, config, isSubmitting } =
        useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP();

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockRejectedValue(new Error('API Error'));

      await submitAssignment();

      expect(isSubmitting.value).toBe(false);
    });

    it('maps mcp_config keys to labels in normalized agent', async () => {
      const agent = ref(createMockAgent());
      const { submitAssignment, config } = useOfficialAgentAssignment(agent);

      config.value.MCP = createMockMCP({
        config: [
          {
            name: 'option_key',
            label: 'Option Label',
            default_value: '',
            is_required: false,
            type: 'INPUT',
            options: [],
          },
        ],
      });
      config.value.mcp_config = { option_key: 'my-value' };

      vi.mocked(
        nexusaiAPI.router.agents_team.toggleOfficialAgentAssignment,
      ).mockResolvedValue({
        data: { agent: { uuid: '123', slug: 'test' } },
      });

      const addAgentSpy = vi.spyOn(agentsTeamStore, 'addAgentToTeam');

      await submitAssignment();

      expect(addAgentSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          mcp: expect.objectContaining({
            config: { 'Option Label': 'my-value' },
          }),
        }),
      );
    });
  });
});
