import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import useAgent from '../useAgent';
import agentIconService from '@/utils/agentIconService';

import type { Agent, AgentGroup } from '@/store/types/Agents.types';

vi.mock('@/utils/agentIconService', () => ({
  default: {
    getIconForAgent: vi.fn(() => 'CustomIcon1'),
  },
}));

vi.mock('../useAgentSystems', () => ({
  default: () => ({
    getSystemObject: vi.fn((systemName: string) => {
      if (!systemName) return undefined;
      return {
        slug: systemName.toLowerCase(),
        name: systemName,
        icon: `${systemName.toLowerCase()}-icon`,
      };
    }),
  }),
}));

const createMockAgentGroup = (overrides = {}): AgentGroup => ({
  name: 'Test Agent Group',
  description: 'Test group description',
  type: 'PLUG_IN_PLAY',
  category: 'PRODUCT_DISCOVERY_AND_RECOMMENDATIONS',
  group: 'test-group',
  agents: [],
  MCPs: [],
  systems: ['VTEX'],
  assigned: false,
  icon: 'test-icon',
  is_official: true,
  ...overrides,
});

const createMockAgent = (overrides = {}): Agent => ({
  uuid: 'agent-uuid-123',
  id: 'agent-id',
  name: 'Test Agent',
  about: { en: 'About text', pt: null, es: null },
  description: 'Test agent description',
  skills: [],
  assigned: true,
  slug: 'test-agent-slug',
  model: 'gpt-4',
  is_official: false,
  project: 'project-123',
  credentials: [],
  icon: 'agent-icon',
  ...overrides,
});

describe('useAgent', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeActiveAgent', () => {
    describe('with AgentGroup input', () => {
      it('normalizes an AgentGroup to ActiveTeamAgent', () => {
        const { normalizeActiveAgent } = useAgent();
        const agentGroup = createMockAgentGroup();

        const result = normalizeActiveAgent(agentGroup);

        expect(result).toEqual({
          uuid: '',
          id: '',
          name: 'Test Agent Group',
          is_official: true,
          about: null,
          description: 'Test group description',
          group: 'test-group',
          mcp: null,
          icon: 'CustomIcon1',
        });
      });

      it('uses first system from AgentGroup systems array', () => {
        const { normalizeActiveAgent } = useAgent();
        const agentGroup = createMockAgentGroup({
          systems: ['Shopify', 'VTEX'],
        });

        normalizeActiveAgent(agentGroup);

        expect(agentIconService.getIconForAgent).toHaveBeenCalledWith(
          agentGroup,
        );
      });

      it('handles AgentGroup with empty systems', () => {
        const { normalizeActiveAgent } = useAgent();
        const agentGroup = createMockAgentGroup({ systems: [] });

        const result = normalizeActiveAgent(agentGroup);

        expect(result.mcp).toBeNull();
      });
    });

    describe('with Agent input', () => {
      it('normalizes an Agent to ActiveTeamAgent', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent();

        const result = normalizeActiveAgent(agent);

        expect(result).toEqual({
          uuid: 'agent-uuid-123',
          id: 'agent-id',
          name: 'Test Agent',
          is_official: false,
          about: { en: 'About text', pt: null, es: null },
          description: 'Test agent description',
          group: undefined,
          mcp: null,
          icon: 'CustomIcon1',
        });
      });

      it('uses slug as id when id is not available', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({ id: undefined, slug: 'my-slug' });

        const result = normalizeActiveAgent(agent);

        expect(result.id).toBe('my-slug');
      });

      it('normalizes Agent with group property', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({ group: 'my-group' });

        const result = normalizeActiveAgent(agent);

        expect(result.group).toBe('my-group');
      });
    });

    describe('with Agent that has MCP', () => {
      it('normalizes Agent with MCP data', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({
          mcp: {
            name: 'test-mcp',
            description: { en: 'MCP Description', pt: null, es: null },
            config: { key: 'value' },
            system: { name: 'VTEX', slug: 'vtex', icon: 'vtex-icon' },
          },
        });

        const result = normalizeActiveAgent(agent);

        expect(result.mcp).toEqual({
          name: 'test-mcp',
          config: { key: 'value' },
          description: { en: 'MCP Description', pt: null, es: null },
          system: {
            slug: 'vtex',
            name: 'VTEX',
            icon: 'vtex-icon',
          },
        });
      });

      it('handles MCP with missing config', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({
          mcp: {
            name: 'test-mcp',
            description: { en: 'MCP Description', pt: null, es: null },
            system: { name: 'VTEX', slug: 'vtex', icon: 'vtex-icon' },
          },
        });

        const result = normalizeActiveAgent(agent);

        expect(result.mcp?.config).toEqual({});
      });

      it('handles MCP with missing name', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({
          mcp: {
            description: { en: 'MCP Description', pt: null, es: null },
            config: { key: 'value' },
          },
        });

        const result = normalizeActiveAgent(agent);

        expect(result.mcp?.name).toBe('');
      });
    });

    describe('edge cases', () => {
      it('handles missing name', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({ name: undefined });

        const result = normalizeActiveAgent(agent);

        expect(result.name).toBe('');
      });

      it('handles missing description', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({ description: undefined });

        const result = normalizeActiveAgent(agent);

        expect(result.description).toBe('');
      });

      it('handles missing is_official', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({ is_official: undefined });

        const result = normalizeActiveAgent(agent);

        expect(result.is_official).toBe(false);
      });

      it('handles missing uuid', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent({ uuid: undefined });

        const result = normalizeActiveAgent(agent);

        expect(result.uuid).toBe('');
      });

      it('calls agentIconService.getIconForAgent', () => {
        const { normalizeActiveAgent } = useAgent();
        const agent = createMockAgent();

        normalizeActiveAgent(agent);

        expect(agentIconService.getIconForAgent).toHaveBeenCalledWith(agent);
      });
    });
  });
});
