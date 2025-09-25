import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentsTeam } from '@/api/nexus/AgentsTeam';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      patch: vi.fn(),
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: () => ({ uuid: 'test-project-uuid' }),
}));

describe('AgentsTeam API', () => {
  const mockProjectUuid = 'test-project-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listOfficialAgents', () => {
    const mockOfficialAgentsResponse = {
      data: [
        {
          uuid: 'agent-uuid-1',
          name: 'Official Agent 1',
          description: 'First official agent',
          skills: ['skill1', 'skill2'],
          assigned: true,
          credentials: { type: 'oauth' },
          is_official: true,
          slug: 'official-agent-1',
        },
        {
          uuid: 'agent-uuid-2',
          name: 'Official Agent 2',
          description: 'Second official agent',
          skills: ['skill3', 'skill4'],
          assigned: false,
          credentials: { type: 'api_key' },
          is_official: true,
          slug: 'official-agent-2',
        },
      ],
    };

    it('should list official agents without search', async () => {
      request.$http.get.mockResolvedValue(mockOfficialAgentsResponse);

      const result = await AgentsTeam.listOfficialAgents({});

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/agents/official/${mockProjectUuid}`,
        {
          params: {},
        },
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        uuid: 'agent-uuid-1',
        name: 'Official Agent 1',
        description: 'First official agent',
        skills: ['skill1', 'skill2'],
        assigned: true,
        credentials: { type: 'oauth' },
        is_official: true,
        id: 'official-agent-1',
      });
    });

    it('should list official agents with search parameter', async () => {
      const searchResponse = {
        data: [mockOfficialAgentsResponse.data[0]],
      };
      request.$http.get.mockResolvedValue(searchResponse);

      const result = await AgentsTeam.listOfficialAgents({ search: 'Agent 1' });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/agents/official/${mockProjectUuid}`,
        {
          params: { search: 'Agent 1' },
        },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Official Agent 1');
    });

    it('should transform agent data correctly', async () => {
      request.$http.get.mockResolvedValue(mockOfficialAgentsResponse);

      const result = await AgentsTeam.listOfficialAgents({});

      result.data.forEach((agent, index) => {
        const originalAgent = mockOfficialAgentsResponse.data[index];
        expect(agent.uuid).toBe(originalAgent.uuid);
        expect(agent.name).toBe(originalAgent.name);
        expect(agent.description).toBe(originalAgent.description);
        expect(agent.skills).toEqual(originalAgent.skills);
        expect(agent.assigned).toBe(originalAgent.assigned);
        expect(agent.credentials).toEqual(originalAgent.credentials);
        expect(agent.is_official).toBe(originalAgent.is_official);
        expect(agent.id).toBe(originalAgent.slug);
      });
    });

    it('should handle empty search parameter', async () => {
      request.$http.get.mockResolvedValue({ data: [] });

      const result = await AgentsTeam.listOfficialAgents({ search: '' });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/agents/official/${mockProjectUuid}`,
        {
          params: {},
        },
      );

      expect(result.data).toEqual([]);
    });

    it('should handle API error', async () => {
      const error = new Error('API Error');
      request.$http.get.mockRejectedValue(error);

      await expect(AgentsTeam.listOfficialAgents({})).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('listMyAgents', () => {
    const mockMyAgentsResponse = {
      data: [
        {
          uuid: 'my-agent-uuid-1',
          name: 'My Agent 1',
          description: 'First personal agent',
          skills: ['custom-skill1'],
          assigned: true,
          credentials: { type: 'custom' },
          is_official: false,
          slug: 'my-agent-1',
        },
        {
          uuid: 'my-agent-uuid-2',
          name: 'My Agent 2',
          description: 'Second personal agent',
          skills: ['custom-skill2', 'custom-skill3'],
          assigned: false,
          credentials: { type: 'bearer' },
          is_official: false,
          slug: 'my-agent-2',
        },
      ],
    };

    it('should list personal agents without search', async () => {
      request.$http.get.mockResolvedValue(mockMyAgentsResponse);

      const result = await AgentsTeam.listMyAgents({});

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/agents/my-agents/${mockProjectUuid}`,
        {
          params: {},
        },
      );

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        uuid: 'my-agent-uuid-1',
        name: 'My Agent 1',
        description: 'First personal agent',
        skills: ['custom-skill1'],
        assigned: true,
        credentials: { type: 'custom' },
        is_official: false,
        id: 'my-agent-1',
      });
    });

    it('should list personal agents with search parameter', async () => {
      const searchResponse = {
        data: [mockMyAgentsResponse.data[1]],
      };
      request.$http.get.mockResolvedValue(searchResponse);

      const result = await AgentsTeam.listMyAgents({ search: 'Agent 2' });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/agents/my-agents/${mockProjectUuid}`,
        {
          params: { search: 'Agent 2' },
        },
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('My Agent 2');
    });

    it('should transform personal agent data correctly', async () => {
      request.$http.get.mockResolvedValue(mockMyAgentsResponse);

      const result = await AgentsTeam.listMyAgents({});

      result.data.forEach((agent, index) => {
        const originalAgent = mockMyAgentsResponse.data[index];
        expect(agent.uuid).toBe(originalAgent.uuid);
        expect(agent.name).toBe(originalAgent.name);
        expect(agent.description).toBe(originalAgent.description);
        expect(agent.skills).toEqual(originalAgent.skills);
        expect(agent.assigned).toBe(originalAgent.assigned);
        expect(agent.credentials).toEqual(originalAgent.credentials);
        expect(agent.is_official).toBe(originalAgent.is_official);
        expect(agent.id).toBe(originalAgent.slug);
      });
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to fetch my agents');
      request.$http.get.mockRejectedValue(error);

      await expect(AgentsTeam.listMyAgents({})).rejects.toThrow(
        'Failed to fetch my agents',
      );
    });
  });

  describe('listActiveTeam', () => {
    const mockActiveTeamResponse = {
      data: {
        manager: {
          id: 'team-manager-id',
          name: 'Team Manager',
        },
        agents: [
          {
            uuid: 'active-agent-uuid-1',
            name: 'Active Agent 1',
            skills: ['active-skill1'],
            id: 'active-agent-1',
            description: 'First active agent',
            credentials: { type: 'active' },
            is_official: true,
          },
          {
            uuid: 'active-agent-uuid-2',
            name: 'Active Agent 2',
            skills: ['active-skill2', 'active-skill3'],
            id: 'active-agent-2',
            description: 'Second active agent',
            credentials: { type: 'custom' },
            is_official: false,
          },
        ],
      },
    };

    it('should list active team members', async () => {
      request.$http.get.mockResolvedValue(mockActiveTeamResponse);

      const result = await AgentsTeam.listActiveTeam();

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/agents/teams/${mockProjectUuid}`,
      );

      expect(result.data.manager).toEqual({
        id: 'team-manager-id',
      });

      expect(result.data.agents).toHaveLength(2);
      expect(result.data.agents[0]).toEqual({
        uuid: 'active-agent-uuid-1',
        name: 'Active Agent 1',
        skills: ['active-skill1'],
        id: 'active-agent-1',
        description: 'First active agent',
        credentials: { type: 'active' },
        is_official: true,
      });
    });

    it('should handle manager without id', async () => {
      const responseWithoutManagerId = {
        data: {
          manager: {
            name: 'Team Manager',
          },
          agents: [],
        },
      };
      request.$http.get.mockResolvedValue(responseWithoutManagerId);

      const result = await AgentsTeam.listActiveTeam();

      expect(result.data.manager).toEqual({
        id: 'manager',
      });
    });

    it('should handle empty agents array', async () => {
      const responseWithoutAgents = {
        data: {
          manager: {
            id: 'manager-id',
          },
          agents: [],
        },
      };
      request.$http.get.mockResolvedValue(responseWithoutAgents);

      const result = await AgentsTeam.listActiveTeam();

      expect(result.data.agents).toEqual([]);
    });

    it('should transform active team data correctly', async () => {
      request.$http.get.mockResolvedValue(mockActiveTeamResponse);

      const result = await AgentsTeam.listActiveTeam();

      result.data.agents.forEach((agent, index) => {
        const originalAgent = mockActiveTeamResponse.data.agents[index];
        expect(agent.uuid).toBe(originalAgent.uuid);
        expect(agent.name).toBe(originalAgent.name);
        expect(agent.skills).toEqual(originalAgent.skills);
        expect(agent.id).toBe(originalAgent.id);
        expect(agent.description).toBe(originalAgent.description);
        expect(agent.credentials).toEqual(originalAgent.credentials);
        expect(agent.is_official).toBe(originalAgent.is_official);
      });
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to fetch active team');
      request.$http.get.mockRejectedValue(error);

      await expect(AgentsTeam.listActiveTeam()).rejects.toThrow(
        'Failed to fetch active team',
      );
    });
  });

  describe('toggleAgentAssignment', () => {
    const mockToggleResponse = {
      data: {
        success: true,
        message: 'Agent assignment updated',
        agent_uuid: 'agent-uuid-123',
        assigned: true,
      },
    };

    it('should assign agent successfully', async () => {
      request.$http.patch.mockResolvedValue(mockToggleResponse);

      const result = await AgentsTeam.toggleAgentAssignment({
        agentUuid: 'agent-uuid-123',
        is_assigned: true,
      });

      expect(request.$http.patch).toHaveBeenCalledWith(
        `api/project/${mockProjectUuid}/assign/agent-uuid-123`,
        {
          assigned: true,
        },
        {
          hideGenericErrorAlert: true,
        },
      );

      expect(result.data).toEqual(mockToggleResponse.data);
    });

    it('should unassign agent successfully', async () => {
      const unassignResponse = {
        data: {
          success: true,
          message: 'Agent assignment removed',
          agent_uuid: 'agent-uuid-456',
          assigned: false,
        },
      };
      request.$http.patch.mockResolvedValue(unassignResponse);

      const result = await AgentsTeam.toggleAgentAssignment({
        agentUuid: 'agent-uuid-456',
        is_assigned: false,
      });

      expect(request.$http.patch).toHaveBeenCalledWith(
        `api/project/${mockProjectUuid}/assign/agent-uuid-456`,
        {
          assigned: false,
        },
        {
          hideGenericErrorAlert: true,
        },
      );

      expect(result.data).toEqual(unassignResponse.data);
    });

    it('should include hideGenericErrorAlert in request config', async () => {
      request.$http.patch.mockResolvedValue(mockToggleResponse);

      await AgentsTeam.toggleAgentAssignment({
        agentUuid: 'agent-uuid-123',
        is_assigned: true,
      });

      const callArgs = request.$http.patch.mock.calls[0];
      expect(callArgs[2]).toEqual({
        hideGenericErrorAlert: true,
      });
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to toggle agent assignment');
      request.$http.patch.mockRejectedValue(error);

      await expect(
        AgentsTeam.toggleAgentAssignment({
          agentUuid: 'agent-uuid-123',
          is_assigned: true,
        }),
      ).rejects.toThrow('Failed to toggle agent assignment');
    });

    it('should handle missing parameters', async () => {
      request.$http.patch.mockResolvedValue(mockToggleResponse);

      await AgentsTeam.toggleAgentAssignment({
        agentUuid: undefined,
        is_assigned: true,
      });

      expect(request.$http.patch).toHaveBeenCalledWith(
        `api/project/${mockProjectUuid}/assign/undefined`,
        {
          assigned: true,
        },
        {
          hideGenericErrorAlert: true,
        },
      );
    });
  });

  describe('Data transformation', () => {
    it('should consistently transform agent data across all methods', () => {
      const originalAgent = {
        uuid: 'test-uuid',
        name: 'Test Agent',
        description: 'Test Description',
        skills: ['test-skill'],
        assigned: true,
        credentials: { type: 'test' },
        is_official: false,
        slug: 'test-agent-slug',
      };

      const transformedAgent = {
        uuid: originalAgent.uuid,
        name: originalAgent.name,
        description: originalAgent.description,
        skills: originalAgent.skills,
        assigned: originalAgent.assigned,
        credentials: originalAgent.credentials,
        is_official: originalAgent.is_official,
        id: originalAgent.slug,
      };

      expect(transformedAgent.id).toBe(originalAgent.slug);
      expect(transformedAgent.uuid).toBe(originalAgent.uuid);
      expect(transformedAgent.name).toBe(originalAgent.name);
      expect(transformedAgent.description).toBe(originalAgent.description);
      expect(transformedAgent.skills).toEqual(originalAgent.skills);
      expect(transformedAgent.assigned).toBe(originalAgent.assigned);
      expect(transformedAgent.credentials).toEqual(originalAgent.credentials);
      expect(transformedAgent.is_official).toBe(originalAgent.is_official);
    });
  });

  describe('Error handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';
      request.$http.get.mockRejectedValue(networkError);

      await expect(AgentsTeam.listOfficialAgents({})).rejects.toThrow(
        'Network Error',
      );
    });

    it('should propagate HTTP errors', async () => {
      const httpError = new Error('HTTP 404 Not Found');
      httpError.response = { status: 404 };
      request.$http.get.mockRejectedValue(httpError);

      await expect(AgentsTeam.listMyAgents({})).rejects.toThrow(
        'HTTP 404 Not Found',
      );
    });

    it('should propagate authentication errors', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      request.$http.patch.mockRejectedValue(authError);

      await expect(
        AgentsTeam.toggleAgentAssignment({
          agentUuid: 'test-uuid',
          is_assigned: true,
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
