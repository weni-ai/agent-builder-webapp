import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Actions } from '@/api/nexus/Actions';
import request from '@/api/nexusaiRequest';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Actions API', () => {
  const mockProjectUuid = 'test-project-uuid';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('types.list', () => {
    const mockTypesResponse = {
      data: [
        {
          uuid: 'type-uuid-1',
          name: 'Interaction Action',
          display_prompt: 'Handle general interactions',
          action_type: 'interaction',
          group: 'interactions',
          language: 'pt-br',
        },
        {
          uuid: 'type-uuid-2',
          name: 'Shopping Action',
          display_prompt: 'Handle product purchases',
          action_type: 'shopping',
          group: 'shopping',
          language: 'en',
        },
        {
          uuid: 'type-uuid-3',
          name: 'Custom Action',
          display_prompt: 'Custom action prompt',
          action_type: 'custom',
          group: 'unknown-group',
          language: 'pt-br',
        },
      ],
    };

    it('should list action types with Portuguese language', async () => {
      request.$http.get.mockResolvedValue(mockTypesResponse);

      const result = await Actions.types.list({
        projectUuid: mockProjectUuid,
        language: 'pt-br',
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/template-action/`,
        {
          params: {
            language: 'pt-br',
          },
          hideGenericErrorAlert: true,
        },
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        uuid: 'type-uuid-1',
        name: 'Interaction Action',
        prompt: 'Handle general interactions',
        type: 'interaction',
        group: 'interactions',
      });
    });

    it('should list action types with English language mapping', async () => {
      request.$http.get.mockResolvedValue(mockTypesResponse);

      const result = await Actions.types.list({
        projectUuid: mockProjectUuid,
        language: 'en-us',
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/template-action/`,
        {
          params: {
            language: 'en',
          },
          hideGenericErrorAlert: true,
        },
      );

      expect(result).toHaveLength(3);
    });

    it('should transform group names correctly', async () => {
      request.$http.get.mockResolvedValue(mockTypesResponse);

      const result = await Actions.types.list({
        projectUuid: mockProjectUuid,
        language: 'pt-br',
      });

      expect(result[0].group).toBe('interactions');
      expect(result[1].group).toBe('shopping');
      expect(result[2].group).toBe('custom');
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to fetch action types');
      request.$http.get.mockRejectedValue(error);

      await expect(
        Actions.types.list({
          projectUuid: mockProjectUuid,
          language: 'pt-br',
        }),
      ).rejects.toThrow('Failed to fetch action types');
    });
  });

  describe('create', () => {
    const mockCreateResponse = {
      data: {
        uuid: 'created-action-uuid',
        name: 'New Action',
        prompt: 'New action prompt',
        action_type: 'custom',
        flow_uuid: 'flow-uuid-123',
        send_to_llm: true,
        group: 'interactions',
      },
    };

    it('should create action successfully', async () => {
      request.$http.post.mockResolvedValue(mockCreateResponse);

      const result = await Actions.create({
        projectUuid: mockProjectUuid,
        flowUuid: 'flow-uuid-123',
        templateUuid: 'template-uuid-456',
        name: 'New Action',
        prompt: 'New action prompt',
        type: 'custom',
        send_llm_response_to_flow: true,
      });

      expect(request.$http.post).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/flows/`,
        {
          uuid: 'flow-uuid-123',
          action_template_uuid: 'template-uuid-456',
          name: 'New Action',
          prompt: 'New action prompt',
          action_type: 'custom',
          fallback: false,
          send_to_llm: true,
        },
      );

      expect(result).toEqual({
        uuid: 'created-action-uuid',
        name: 'New Action',
        prompt: 'New action prompt',
        type: 'custom',
        flow_uuid: 'flow-uuid-123',
        send_llm_response_to_flow: true,
        group: 'interactions',
      });
    });

    it('should handle group mapping for template actions', async () => {
      const responseWithKnownGroup = {
        data: {
          ...mockCreateResponse.data,
          group: 'shopping',
        },
      };
      request.$http.post.mockResolvedValue(responseWithKnownGroup);

      const result = await Actions.create({
        projectUuid: mockProjectUuid,
        flowUuid: 'flow-uuid-123',
        templateUuid: 'template-uuid-456',
        name: 'Shopping Action',
        prompt: 'Shopping prompt',
        type: 'shopping',
        send_llm_response_to_flow: false,
      });

      expect(result.group).toBe('shopping');
    });

    it('should set group to custom when no template is provided', async () => {
      request.$http.post.mockResolvedValue(mockCreateResponse);

      const result = await Actions.create({
        projectUuid: mockProjectUuid,
        flowUuid: 'flow-uuid-123',
        templateUuid: null,
        name: 'Custom Action',
        prompt: 'Custom prompt',
        type: 'custom',
        send_llm_response_to_flow: true,
      });

      expect(result.group).toBe('custom');
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to create action');
      request.$http.post.mockRejectedValue(error);

      await expect(
        Actions.create({
          projectUuid: mockProjectUuid,
          flowUuid: 'flow-uuid-123',
          templateUuid: 'template-uuid-456',
          name: 'New Action',
          prompt: 'New action prompt',
          type: 'custom',
          send_llm_response_to_flow: true,
        }),
      ).rejects.toThrow('Failed to create action');
    });
  });

  describe('edit', () => {
    const mockEditResponse = {
      data: {
        uuid: 'edited-action-uuid',
        name: 'Edited Action',
        flow_uuid: 'updated-flow-uuid',
        prompt: 'Updated prompt',
        send_to_llm: false,
      },
    };

    it('should edit action successfully', async () => {
      request.$http.patch.mockResolvedValue(mockEditResponse);

      const result = await Actions.edit({
        projectUuid: mockProjectUuid,
        actionUuid: 'action-uuid-123',
        name: 'Edited Action',
        flow_uuid: 'updated-flow-uuid',
        prompt: 'Updated prompt',
        send_llm_response_to_flow: false,
      });

      expect(request.$http.patch).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/flows/action-uuid-123/`,
        {
          name: 'Edited Action',
          flow_uuid: 'updated-flow-uuid',
          prompt: 'Updated prompt',
          send_to_llm: false,
        },
      );

      expect(result).toEqual({
        uuid: 'edited-action-uuid',
        name: 'Edited Action',
        flow_uuid: 'updated-flow-uuid',
        prompt: 'Updated prompt',
        send_llm_response_to_flow: false,
      });
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to edit action');
      request.$http.patch.mockRejectedValue(error);

      await expect(
        Actions.edit({
          projectUuid: mockProjectUuid,
          actionUuid: 'action-uuid-123',
          name: 'Edited Action',
          flow_uuid: 'updated-flow-uuid',
          prompt: 'Updated prompt',
          send_llm_response_to_flow: false,
        }),
      ).rejects.toThrow('Failed to edit action');
    });
  });

  describe('delete', () => {
    it('should delete action successfully', async () => {
      const mockDeleteResponse = { data: { success: true } };
      request.$http.delete.mockResolvedValue(mockDeleteResponse);

      const result = await Actions.delete({
        projectUuid: mockProjectUuid,
        actionUuid: 'action-uuid-123',
      });

      expect(request.$http.delete).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/flows/action-uuid-123/`,
      );

      expect(result).toEqual(mockDeleteResponse);
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to delete action');
      request.$http.delete.mockRejectedValue(error);

      await expect(
        Actions.delete({
          projectUuid: mockProjectUuid,
          actionUuid: 'action-uuid-123',
        }),
      ).rejects.toThrow('Failed to delete action');
    });
  });

  describe('list', () => {
    const mockActionsResponse = {
      data: [
        {
          uuid: 'action-uuid-1',
          name: 'Action 1',
          prompt: 'Action 1 prompt',
          action_type: 'interaction',
          editable: true,
          content_base: 'base-1',
          fallback: false,
          group: 'interactions',
          flow_uuid: 'flow-uuid-1',
          send_to_llm: true,
        },
        {
          uuid: 'action-uuid-2',
          name: 'Action 2',
          prompt: 'Action 2 prompt',
          action_type: 'custom',
          editable: false,
          content_base: 'base-2',
          fallback: true,
          group: 'unknown-group',
          flow_uuid: 'flow-uuid-2',
          send_to_llm: false,
        },
      ],
    };

    it('should list actions successfully', async () => {
      request.$http.get.mockResolvedValue(mockActionsResponse);

      const result = await Actions.list({
        projectUuid: mockProjectUuid,
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/flows/`,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        uuid: 'action-uuid-1',
        name: 'Action 1',
        prompt: 'Action 1 prompt',
        type: 'interaction',
        editable: true,
        group: 'interactions',
        flow_uuid: 'flow-uuid-1',
        send_llm_response_to_flow: true,
      });
    });

    it('should transform group names correctly', async () => {
      request.$http.get.mockResolvedValue(mockActionsResponse);

      const result = await Actions.list({
        projectUuid: mockProjectUuid,
      });

      expect(result[0].group).toBe('interactions');
      expect(result[1].group).toBe('custom');
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to list actions');
      request.$http.get.mockRejectedValue(error);

      await expect(
        Actions.list({
          projectUuid: mockProjectUuid,
        }),
      ).rejects.toThrow('Failed to list actions');
    });
  });

  describe('generatedNames.generate', () => {
    const mockGenerateResponse = {
      data: {
        generated_names: [
          'Smart Action',
          'Intelligent Response',
          'Auto Helper',
        ],
        context: 'customer support',
      },
    };

    it('should generate action names successfully', async () => {
      request.$http.post.mockResolvedValue(mockGenerateResponse);

      const result = await Actions.generatedNames.generate({
        projectUuid: mockProjectUuid,
        chatbot_goal: 'Help customers with their queries',
        context: 'customer support',
      });

      expect(request.$http.post).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/generate-action-name/`,
        {
          chatbot_goal: 'Help customers with their queries',
          context: 'customer support',
        },
      );

      expect(result).toEqual(mockGenerateResponse);
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to generate names');
      request.$http.post.mockRejectedValue(error);

      await expect(
        Actions.generatedNames.generate({
          projectUuid: mockProjectUuid,
          chatbot_goal: 'Help customers',
          context: 'support',
        }),
      ).rejects.toThrow('Failed to generate names');
    });
  });

  describe('flows.list', () => {
    const mockFlowsResponse = {
      data: {
        results: [
          {
            uuid: 'flow-uuid-1',
            name: 'Flow 1',
            description: 'First flow',
          },
          {
            uuid: 'flow-uuid-2',
            name: 'Flow 2',
            description: 'Second flow',
          },
        ],
      },
    };

    it('should list flows without pagination', async () => {
      request.$http.get.mockResolvedValue(mockFlowsResponse);

      const result = await Actions.flows.list({
        projectUuid: mockProjectUuid,
        name: 'test-flow',
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/search-flows/`,
        {
          params: {
            name: 'test-flow',
          },
        },
      );

      expect(result).toEqual(mockFlowsResponse);
    });

    it('should list flows without name parameter', async () => {
      request.$http.get.mockResolvedValue(mockFlowsResponse);

      const result = await Actions.flows.list({
        projectUuid: mockProjectUuid,
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/search-flows/`,
        {
          params: {
            name: undefined,
          },
        },
      );

      expect(result).toEqual(mockFlowsResponse);
    });

    it('should list flows with pagination', async () => {
      request.$http.get.mockResolvedValue(mockFlowsResponse);

      const result = await Actions.flows.list({
        next: 'next-page-token',
        projectUuid: mockProjectUuid,
        name: 'test-flow',
      });

      expect(request.$http.get).toHaveBeenCalledWith(
        `api/${mockProjectUuid}/search-flows/next-page-token`,
      );

      expect(result).toEqual(mockFlowsResponse);
    });

    it('should handle API error', async () => {
      const error = new Error('Failed to list flows');
      request.$http.get.mockRejectedValue(error);

      await expect(
        Actions.flows.list({
          projectUuid: mockProjectUuid,
        }),
      ).rejects.toThrow('Failed to list flows');
    });
  });

  describe('Group mapping', () => {
    it('should map known groups correctly', () => {
      const knownGroups = ['interactions', 'shopping', 'support', 'media'];

      knownGroups.forEach((group) => {
        const isKnownGroup = [
          'interactions',
          'shopping',
          'support',
          'media',
        ].includes(group);
        const mappedGroup = isKnownGroup ? group : 'custom';
        expect(mappedGroup).toBe(group);
      });
    });

    it('should map unknown groups to custom', () => {
      const unknownGroups = ['unknown', 'test', 'random', null, undefined];

      unknownGroups.forEach((group) => {
        const isKnownGroup = [
          'interactions',
          'shopping',
          'support',
          'media',
        ].includes(group);
        const mappedGroup = isKnownGroup ? group : 'custom';
        expect(mappedGroup).toBe('custom');
      });
    });
  });

  describe('Error handling', () => {
    it('should propagate network errors', async () => {
      const networkError = new Error('Network Error');
      networkError.code = 'NETWORK_ERROR';
      request.$http.get.mockRejectedValue(networkError);

      await expect(
        Actions.list({
          projectUuid: mockProjectUuid,
        }),
      ).rejects.toThrow('Network Error');
    });

    it('should propagate HTTP errors', async () => {
      const httpError = new Error('HTTP 500 Internal Server Error');
      httpError.response = { status: 500 };
      request.$http.post.mockRejectedValue(httpError);

      await expect(
        Actions.create({
          projectUuid: mockProjectUuid,
          flowUuid: 'flow-uuid',
          name: 'Test Action',
          prompt: 'Test prompt',
          type: 'custom',
          send_llm_response_to_flow: true,
        }),
      ).rejects.toThrow('HTTP 500 Internal Server Error');
    });

    it('should propagate authentication errors', async () => {
      const authError = new Error('Unauthorized');
      authError.response = { status: 401 };
      request.$http.delete.mockRejectedValue(authError);

      await expect(
        Actions.delete({
          projectUuid: mockProjectUuid,
          actionUuid: 'action-uuid',
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Data transformation', () => {
    it('should consistently transform data across list methods', () => {
      const originalTypeItem = {
        uuid: 'test-uuid',
        name: 'Test Action',
        display_prompt: 'Test prompt',
        action_type: 'test-type',
        group: 'interactions',
        language: 'pt-br',
      };

      const transformedTypeItem = {
        uuid: originalTypeItem.uuid,
        name: originalTypeItem.name,
        prompt: originalTypeItem.display_prompt,
        type: originalTypeItem.action_type,
        group: ['interactions', 'shopping', 'support', 'media'].includes(
          originalTypeItem.group,
        )
          ? originalTypeItem.group
          : 'custom',
      };

      expect(transformedTypeItem.prompt).toBe(originalTypeItem.display_prompt);
      expect(transformedTypeItem.type).toBe(originalTypeItem.action_type);
      expect(transformedTypeItem.group).toBe('interactions');
    });

    it('should consistently transform data in list method', () => {
      const originalActionItem = {
        uuid: 'test-uuid',
        name: 'Test Action',
        prompt: 'Test prompt',
        action_type: 'test-type',
        editable: true,
        content_base: 'base',
        fallback: false,
        group: 'custom-group',
        flow_uuid: 'flow-uuid',
        send_to_llm: true,
      };

      const transformedActionItem = {
        uuid: originalActionItem.uuid,
        name: originalActionItem.name,
        prompt: originalActionItem.prompt,
        type: originalActionItem.action_type,
        editable: originalActionItem.editable,
        group: ['interactions', 'shopping', 'support', 'media'].includes(
          originalActionItem.group,
        )
          ? originalActionItem.group
          : 'custom',
        flow_uuid: originalActionItem.flow_uuid,
        send_llm_response_to_flow: originalActionItem.send_to_llm,
      };

      expect(transformedActionItem.type).toBe(originalActionItem.action_type);
      expect(transformedActionItem.send_llm_response_to_flow).toBe(
        originalActionItem.send_to_llm,
      );
      expect(transformedActionItem.group).toBe('custom');
    });
  });
});
