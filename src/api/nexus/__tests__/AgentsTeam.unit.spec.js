import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentsTeam } from '@/api/nexus/AgentsTeam';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
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
      data: {
        count: 2,
        page: 1,
        page_size: 20,
        results: [
          {
            uuid: 'agent-uuid-1',
            name: 'Official Agent 1',
            slug: 'official-agent-1',
            group: 'group-1',
            systems: ['system_a'],
            about: { en: 'About EN', pt: null, es: null },
            mcps: [
              {
                name: 'Default',
                description: { en: 'desc', pt: null, es: null },
                system: 'system_a',
                config: [
                  {
                    name: 'REQ_FIELD',
                    label: 'Required',
                    type: 'TEXT',
                    is_required: true,
                    default_value: null,
                    options: [],
                  },
                ],
                credentials: [],
              },
            ],
          },
          {
            uuid: 'agent-uuid-2',
            name: 'Official Agent 2',
            slug: 'official-agent-2',
            group: 'group-2',
            systems: ['system_b'],
            about: { en: 'About EN 2', pt: null, es: null },
            mcps: [],
          },
        ],
      },
    };

    it('should list official agents with all filters', async () => {
      request.$http.get.mockResolvedValue(mockOfficialAgentsResponse);

      const result = await AgentsTeam.listOfficialAgents({
        category: 'productivity',
        system: 'system_a',
        name: 'Agent',
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        '/api/v1/official/agents',
        {
          params: {
            project_uuid: mockProjectUuid,
            category: 'productivity',
            system: 'system_a',
            name: 'Agent',
          },
        },
      );

      expect(result.agents).toHaveLength(2);
      expect(result).not.toHaveProperty('availableSystems');
    });

    it('should passthrough unified shape and add id alias from slug', async () => {
      request.$http.get.mockResolvedValue(mockOfficialAgentsResponse);

      const result = await AgentsTeam.listOfficialAgents({});

      expect(result.agents[0]).toMatchObject({
        uuid: 'agent-uuid-1',
        id: 'official-agent-1',
        slug: 'official-agent-1',
        systems: ['system_a'],
        mcps: [
          expect.objectContaining({
            name: 'Default',
            system: 'system_a',
            config: [
              expect.objectContaining({ name: 'REQ_FIELD', is_required: true }),
            ],
          }),
        ],
      });
      expect(result.agents[1]).toMatchObject({
        uuid: 'agent-uuid-2',
        id: 'official-agent-2',
        systems: ['system_b'],
        mcps: [],
      });
    });

    it('should return an empty array when results is missing', async () => {
      request.$http.get.mockResolvedValue({ data: {} });

      const result = await AgentsTeam.listOfficialAgents({});

      expect(result.agents).toEqual([]);
    });

    it('should omit empty filters from params', async () => {
      request.$http.get.mockResolvedValue(mockOfficialAgentsResponse);

      await AgentsTeam.listOfficialAgents({});

      expect(request.$http.get).toHaveBeenCalledWith(
        '/api/v1/official/agents',
        {
          params: { project_uuid: mockProjectUuid },
        },
      );
    });

    it('should handle API error', async () => {
      const error = new Error('API Error');
      request.$http.get.mockRejectedValue(error);

      await expect(AgentsTeam.listOfficialAgents({})).rejects.toThrow(
        'API Error',
      );
    });
  });

  describe('listOfficialAvailableSystems', () => {
    const mockAvailableSystemsResponse = {
      data: {
        available_systems: [
          { slug: 'vtex', name: 'VTEX', logo: 'https://example.com/vtex.svg' },
          { slug: 'another-system', name: 'Another System', logo: null },
        ],
      },
    };

    it('should call the available systems endpoint with project_uuid', async () => {
      request.$http.get.mockResolvedValue(mockAvailableSystemsResponse);

      await AgentsTeam.listOfficialAvailableSystems();

      expect(request.$http.get).toHaveBeenCalledWith(
        '/api/v1/official/available-systems',
        {
          params: { project_uuid: mockProjectUuid },
        },
      );
    });

    it('should return the available_systems array from the response', async () => {
      request.$http.get.mockResolvedValue(mockAvailableSystemsResponse);

      const result = await AgentsTeam.listOfficialAvailableSystems();

      expect(result).toEqual(
        mockAvailableSystemsResponse.data.available_systems,
      );
    });

    it('should return an empty array when available_systems is missing', async () => {
      request.$http.get.mockResolvedValue({ data: {} });

      const result = await AgentsTeam.listOfficialAvailableSystems();

      expect(result).toEqual([]);
    });

    it('should handle API error', async () => {
      const error = new Error('API Error');
      request.$http.get.mockRejectedValue(error);

      await expect(AgentsTeam.listOfficialAvailableSystems()).rejects.toThrow(
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
          slug: 'my-agent-1',
          group: null,
          about: { en: 'First personal agent', pt: null, es: null },
          assigned: true,
          active: false,
          is_official: false,
          category: null,
          systems: ['custom-system'],
          mcps: [
            {
              name: 'Default',
              description: { en: 'Default MCP', pt: '', es: '' },
              system: 'custom-system',
              config: [
                {
                  name: 'country',
                  label: 'Country',
                  type: 'TEXT',
                  is_required: true,
                  default_value: 'BRA',
                  options: [],
                },
              ],
              credentials: [
                {
                  name: 'BASE_URL',
                  label: 'Base URL',
                  placeholder: 'https://example.com',
                  is_confidential: false,
                },
              ],
            },
          ],
        },
        {
          uuid: 'my-agent-uuid-2',
          name: 'My Agent 2',
          slug: 'my-agent-2',
          group: null,
          about: { en: 'Second personal agent', pt: null, es: null },
          assigned: false,
          active: false,
          is_official: false,
          category: null,
          systems: [],
          mcps: [],
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
        ...mockMyAgentsResponse.data[0],
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

    it('should add id alias from slug for each agent', async () => {
      request.$http.get.mockResolvedValue(mockMyAgentsResponse);

      const result = await AgentsTeam.listMyAgents({});

      result.data.forEach((agent, index) => {
        const originalAgent = mockMyAgentsResponse.data[index];
        expect(agent.uuid).toBe(originalAgent.uuid);
        expect(agent.name).toBe(originalAgent.name);
        expect(agent.id).toBe(originalAgent.slug);
        expect(agent.mcps).toEqual(originalAgent.mcps);
      });
    });

    it('should return an empty array when data is missing', async () => {
      request.$http.get.mockResolvedValue({ data: null });

      const result = await AgentsTeam.listMyAgents({});

      expect(result.data).toEqual([]);
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
            slug: 'active-agent-1',
            group: 'group-1',
            about: { en: 'First active agent', pt: null, es: null },
            assigned: true,
            active: true,
            is_official: true,
            category: null,
            systems: ['vtex'],
            mcps: [
              {
                name: 'Default',
                description: { en: 'Default MCP', pt: '', es: '' },
                system: 'vtex',
                config: { country: 'BRA' },
                credentials: [],
              },
            ],
          },
          {
            uuid: 'active-agent-uuid-2',
            name: 'Active Agent 2',
            slug: 'active-agent-2',
            group: null,
            about: { en: 'Second active agent', pt: null, es: null },
            assigned: true,
            active: true,
            is_official: false,
            category: null,
            systems: [],
            mcps: [],
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
        ...mockActiveTeamResponse.data.agents[0],
        id: 'active-agent-1',
        mcps: [
          {
            ...mockActiveTeamResponse.data.agents[0].mcps[0],
            config: [{ label: 'country', value: 'BRA' }],
          },
        ],
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

    it('should add id alias from slug when id is missing', async () => {
      const responseMissingId = {
        data: {
          manager: { id: 'manager-id' },
          agents: [
            {
              ...mockActiveTeamResponse.data.agents[0],
              id: undefined,
            },
          ],
        },
      };
      request.$http.get.mockResolvedValue(responseMissingId);

      const result = await AgentsTeam.listActiveTeam();

      expect(result.data.agents[0].id).toBe('active-agent-1');
    });

    it('should transform mcp config object into a labeled array', async () => {
      request.$http.get.mockResolvedValue(mockActiveTeamResponse);

      const result = await AgentsTeam.listActiveTeam();

      expect(result.data.agents[0].mcps).toEqual([
        {
          ...mockActiveTeamResponse.data.agents[0].mcps[0],
          config: [{ label: 'country', value: 'BRA' }],
        },
      ]);
    });

    it('should default mcp config to an empty array when missing', async () => {
      const responseWithoutMcpConfig = {
        data: {
          manager: { id: 'manager-id' },
          agents: [
            {
              ...mockActiveTeamResponse.data.agents[0],
              mcps: [
                {
                  name: 'Default',
                  description: { en: 'Default MCP', pt: '', es: '' },
                  system: 'vtex',
                  credentials: [],
                },
              ],
            },
          ],
        },
      };
      request.$http.get.mockResolvedValue(responseWithoutMcpConfig);

      const result = await AgentsTeam.listActiveTeam();

      expect(result.data.agents[0].mcps[0].config).toEqual([]);
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
        assigned: true,
        agent: {
          uuid: 'agent-uuid-123',
          slug: 'agent-slug',
        },
      },
    };

    it('should call the unified endpoint with agent_uuid', async () => {
      request.$http.post.mockResolvedValue(mockToggleResponse);

      const payload = { agent_uuid: 'agent-uuid-123', assigned: true };
      const result = await AgentsTeam.toggleAgentAssignment(payload);

      expect(request.$http.post).toHaveBeenCalledWith(
        `/api/v1/official/agents?project_uuid=${mockProjectUuid}&agent_uuid=agent-uuid-123`,
        payload,
        { hideGenericErrorAlert: true },
      );

      expect(result.data).toEqual(mockToggleResponse.data);
    });

    it('should call the unified endpoint with group when agent_uuid is missing', async () => {
      request.$http.post.mockResolvedValue(mockToggleResponse);

      const payload = { group: 'CONCIERGE', assigned: false };
      await AgentsTeam.toggleAgentAssignment(payload);

      expect(request.$http.post).toHaveBeenCalledWith(
        `/api/v1/official/agents?project_uuid=${mockProjectUuid}&group=CONCIERGE`,
        payload,
        { hideGenericErrorAlert: true },
      );
    });

    it('should prefer agent_uuid over group when both are provided', async () => {
      request.$http.post.mockResolvedValue(mockToggleResponse);

      await AgentsTeam.toggleAgentAssignment({
        agent_uuid: 'agent-uuid-456',
        group: 'CONCIERGE',
        assigned: true,
      });

      const calledUrl = request.$http.post.mock.calls[0][0];
      expect(calledUrl).toContain('agent_uuid=agent-uuid-456');
      expect(calledUrl).not.toContain('group=CONCIERGE');
    });

    it('should send the full payload (including system, mcp, mcp_config, credentials) as body', async () => {
      request.$http.post.mockResolvedValue(mockToggleResponse);

      const credentials = [
        { name: 'token', value: 'a', is_confidential: true },
        { name: 'store_id', value: 'b', is_confidential: false },
      ];

      const payload = {
        agent_uuid: 'agent-uuid-123',
        assigned: true,
        system: 'vtex',
        mcp: 'Default',
        mcp_config: { country: 'BRA' },
        credentials,
      };

      await AgentsTeam.toggleAgentAssignment(payload);

      const calledBody = request.$http.post.mock.calls[0][1];
      expect(calledBody).toEqual(payload);
      expect(Array.isArray(calledBody.credentials)).toBe(true);
    });

    it('should include hideGenericErrorAlert in request config', async () => {
      request.$http.post.mockResolvedValue(mockToggleResponse);

      await AgentsTeam.toggleAgentAssignment({
        agent_uuid: 'agent-uuid-123',
        assigned: true,
      });

      const callArgs = request.$http.post.mock.calls[0];
      expect(callArgs[2]).toEqual({
        hideGenericErrorAlert: true,
      });
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to toggle agent assignment');
      request.$http.post.mockRejectedValue(error);

      await expect(
        AgentsTeam.toggleAgentAssignment({
          agent_uuid: 'agent-uuid-123',
          assigned: true,
        }),
      ).rejects.toThrow('Failed to toggle agent assignment');
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
      request.$http.post.mockRejectedValue(authError);

      await expect(
        AgentsTeam.toggleAgentAssignment({
          agent_uuid: 'test-uuid',
          assigned: true,
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
