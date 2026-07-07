import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import nexusRequest from '@/api/nexusaiRequest';
import conversationsRequest from '@/api/conversationsRequest';
import { Supervisor } from '@/api/nexus/Supervisor';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
    },
  },
}));

vi.mock('@/api/conversationsRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
    },
  },
}));

describe('Supervisor.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('Intl', {
      DateTimeFormat: vi.fn().mockReturnValue({
        resolvedOptions: vi.fn().mockReturnValue({
          timeZone: 'America/Sao_Paulo',
        }),
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('conversations.getById', () => {
    const mockV2Response = {
      data: {
        messages: {
          results: [
            {
              id: 1,
              uuid: 'msg-1',
              text: 'Hello',
              source: 'incoming',
              created_at: '2023-01-15T12:30:00Z',
            },
            {
              id: 2,
              uuid: 'msg-2',
              text: 'Hi there!',
              source: 'outgoing',
              created_at: '2023-01-15T12:31:00Z',
            },
          ],
          next: null,
        },
      },
    };

    const mockV2ResponseWithNext = {
      data: {
        messages: {
          results: [
            {
              id: 1,
              uuid: 'msg-1',
              text: 'Hello',
              source: 'incoming',
              created_at: '2023-01-15T12:30:00Z',
            },
          ],
          next: 'https://api.example.com/api/v2/project-123/conversations/conv-123/?page=2',
        },
      },
    };

    /** Legacy API shape: results + next (ConversationMessageAdapter.fromApi) */
    const mockLegacyResponse = {
      data: {
        results: [
          {
            id: 1,
            uuid: 'msg-1',
            text: 'Hello',
            source_type: 'user',
            created_at: '2023-01-15T12:30:00Z',
          },
        ],
        next: null,
        previous: null,
      },
    };

    it('should get conversation by id (v2) without next param', async () => {
      nexusRequest.$http.get.mockResolvedValue(mockV2Response);

      const projectUuid = 'project-123';
      const uuid = 'conv-123';

      const result = await Supervisor.conversations.getById({
        projectUuid,
        uuid,
      });

      expect(nexusRequest.$http.get).toHaveBeenCalledWith(
        `/api/v2/${projectUuid}/conversations/${uuid}?timezone=America%2FSao_Paulo`,
      );
      expect(result.results).toHaveLength(2);
      expect(result.results[0]).toMatchObject({
        id: 1,
        uuid: 'msg-1',
        text: 'Hello',
        type: 'user',
        created_at: '2023-01-15T12:30:00Z',
      });
      expect(result.results[1]).toMatchObject({
        id: 2,
        uuid: 'msg-2',
        text: 'Hi there!',
        type: 'agent',
        created_at: '2023-01-15T12:31:00Z',
      });
      expect(result.next).toBeNull();
    });

    it('should get conversation by id with next param', async () => {
      nexusRequest.$http.get.mockResolvedValue(mockV2ResponseWithNext);

      const projectUuid = 'project-123';
      const uuid = 'conv-123';
      const next = `https://api.example.com/api/v2/${projectUuid}/conversations/${uuid}/?page=1&timezone=America%2FSao_Paulo`;

      const result = await Supervisor.conversations.getById({
        projectUuid,
        next,
        uuid,
      });

      expect(nexusRequest.$http.get).toHaveBeenCalledWith(
        next.slice(next.indexOf('/api')),
      );
      expect(result.results).toHaveLength(1);
      expect(result.next).toBe(
        'https://api.example.com/api/v2/project-123/conversations/conv-123/?page=2',
      );
    });

    it('should send timezone as query param for v2 endpoint', async () => {
      nexusRequest.$http.get.mockResolvedValue(mockV2Response);

      const projectUuid = 'project-123';
      const uuid = 'conv-123';
      const timezone = 'America/Sao_Paulo';

      await Supervisor.conversations.getById({
        projectUuid,
        uuid,
        source: 'v2',
        timezone,
      });

      const callUrl = nexusRequest.$http.get.mock.calls[0][0];
      expect(callUrl).toContain(`/api/v2/${projectUuid}/conversations/${uuid}`);
      expect(callUrl).toContain(new URLSearchParams({ timezone }).toString());
    });

    it('should get conversation by id with source legacy', async () => {
      nexusRequest.$http.get.mockResolvedValue(mockLegacyResponse);

      const projectUuid = 'project-123';
      const start = '01-01-2023';
      const end = '15-01-2023';
      const urn = 'tel:+123456789';

      const result = await Supervisor.conversations.getById({
        projectUuid,
        source: 'legacy',
        start,
        end,
        urn,
      });

      const expectedPath = `/api/${projectUuid}/conversations/`;
      expect(nexusRequest.$http.get).toHaveBeenCalledWith(
        expect.stringContaining(expectedPath),
      );
      const callUrl = nexusRequest.$http.get.mock.calls[0][0];
      expect(callUrl).toContain('contact_urn=tel%3A%2B123456789');
      expect(callUrl).toContain('start=01-01-2023');
      expect(callUrl).toContain('end=15-01-2023');
      expect(result.results).toHaveLength(1);
      expect(result.results[0]).toMatchObject({
        id: 1,
        uuid: 'msg-1',
        text: 'Hello',
        type: 'user',
        created_at: '2023-01-15T12:30:00Z',
      });
      expect(result.next).toBeNull();
    });

    it('should handle error when getting conversation by id', async () => {
      const error = new Error('API Error');
      nexusRequest.$http.get.mockRejectedValue(error);

      const projectUuid = 'project-123';
      const uuid = 'conv-123';

      await expect(
        Supervisor.conversations.getById({
          projectUuid,
          uuid,
        }),
      ).rejects.toThrow('API Error');
    });
  });

  describe('improvements', () => {
    const projectUuid = 'project-123';

    const mockApiResponse = {
      yesterday_conversations_count: 30,
      improvements_task: {
        is_running: false,
        progress: 5,
        total: 5,
        created_at: '2026-06-01T10:00:00Z',
      },
      improvements: [
        {
          uuid: 'improvement-uuid-1',
          text: 'Sample improvement',
          type: 'personality_deviation',
          conversations_count: 12,
        },
      ],
    };

    it('runAnalysis calls the run endpoint', async () => {
      conversationsRequest.$http.post.mockResolvedValue({ data: {} });

      await Supervisor.improvements.runAnalysis({ projectUuid });

      expect(conversationsRequest.$http.post).toHaveBeenCalledWith(
        `/api/v1/projects/${projectUuid}/improvements/run/`,
      );
      expect(nexusRequest.$http.post).not.toHaveBeenCalled();
    });

    it('getAnalysis calls the improvements endpoint and adapts the response', async () => {
      conversationsRequest.$http.get.mockResolvedValue({
        data: mockApiResponse,
      });

      const result = await Supervisor.improvements.getAnalysis({ projectUuid });

      expect(conversationsRequest.$http.get).toHaveBeenCalledWith(
        `/api/v1/projects/${projectUuid}/improvements/`,
      );
      expect(nexusRequest.$http.get).not.toHaveBeenCalled();
      expect(result).toEqual({
        yesterdayConversationsCount: 30,
        task: {
          isRunning: false,
          progress: 5,
          total: 5,
          createdAt: '2026-06-01T10:00:00Z',
        },
        improvements: [
          {
            uuid: 'improvement-uuid-1',
            text: 'Sample improvement',
            type: 'personality_deviation',
            conversationsCount: 12,
          },
        ],
      });
    });

    it('propagates errors from getAnalysis', async () => {
      const error = new Error('API Error');
      conversationsRequest.$http.get.mockRejectedValue(error);

      await expect(
        Supervisor.improvements.getAnalysis({ projectUuid }),
      ).rejects.toThrow('API Error');
    });

    it('getById calls the detail endpoint and adapts the response', async () => {
      const mockDetailApiResponse = {
        uuid: 'improvement-uuid-1',
        text: 'The agent tone does not match the configured brand voice in refund conversations.',
        type: 'personality_deviation',
        description:
          'In refund conversations, the agent uses informal language that conflicts with the configured brand voice.',
        suggested_change:
          'Update the tone instruction to reinforce formal and empathetic language during refund interactions.',
        status: 'pending',
        affected_instructions: [
          {
            instruction_id: 12,
            change_type: 'fix',
            was_changed: false,
          },
        ],
      };

      conversationsRequest.$http.get.mockResolvedValue({
        data: mockDetailApiResponse,
      });

      const result = await Supervisor.improvements.getById({
        projectUuid,
        improvementUuid: 'improvement-uuid-1',
      });

      expect(conversationsRequest.$http.get).toHaveBeenCalledWith(
        `/api/v1/projects/${projectUuid}/improvements/improvement-uuid-1/`,
      );
      expect(nexusRequest.$http.get).not.toHaveBeenCalled();
      expect(result).toEqual({
        uuid: 'improvement-uuid-1',
        text: 'The agent tone does not match the configured brand voice in refund conversations.',
        type: 'personality_deviation',
        description:
          'In refund conversations, the agent uses informal language that conflicts with the configured brand voice.',
        suggestedSolution:
          'Update the tone instruction to reinforce formal and empathetic language during refund interactions.',
        status: 'pending',
        affectedInstructions: [
          {
            id: 12,
            changeType: 'fix',
            wasChanged: false,
          },
        ],
      });
    });

    it('getById throws when the response is invalid', async () => {
      conversationsRequest.$http.get.mockResolvedValue({
        data: { uuid: 'unknown-uuid' },
      });

      await expect(
        Supervisor.improvements.getById({
          projectUuid,
          improvementUuid: 'unknown-uuid',
        }),
      ).rejects.toThrow('Invalid improvement detail response');
    });

    it('propagates errors from getById', async () => {
      const error = new Error('API Error');
      conversationsRequest.$http.get.mockRejectedValue(error);

      await expect(
        Supervisor.improvements.getById({
          projectUuid,
          improvementUuid: 'improvement-uuid-1',
        }),
      ).rejects.toThrow('API Error');
    });

    it('getAffectedConversations calls the endpoint and adapts the response', async () => {
      const mockAffectedConversationsResponse = {
        count: 25,
        next: 'https://api.example.com/page=2',
        previous: null,
        results: [
          {
            uuid: 'conversation-uuid-1',
            contact_urn: 'whatsapp:5511999999999',
            contact_name: 'Alessandra',
            messages: [
              {
                uuid: 'message-uuid-1',
                id: '1',
                text: 'Hello',
                source: 'incoming',
                created_at: '2026-06-23T09:44:26-03:00',
              },
            ],
          },
        ],
      };

      conversationsRequest.$http.get.mockResolvedValue({
        data: mockAffectedConversationsResponse,
      });

      const result = await Supervisor.improvements.getAffectedConversations({
        projectUuid,
        improvementUuid: 'improvement-uuid-1',
        page: 2,
        pageSize: 10,
      });

      expect(conversationsRequest.$http.get).toHaveBeenCalledWith(
        `/api/v1/projects/${projectUuid}/improvements/improvement-uuid-1/affected_conversations`,
        { params: { page: 2, page_size: 10 } },
      );
      expect(result).toEqual({
        count: 25,
        results: [
          {
            uuid: 'conversation-uuid-1',
            contactUrn: 'whatsapp:5511999999999',
            contactName: 'Alessandra',
            messages: [
              {
                uuid: 'message-uuid-1',
                id: '1',
                text: 'Hello',
                source: 'incoming',
                createdAt: '2026-06-23T09:44:26-03:00',
              },
            ],
          },
        ],
      });
    });
  });
});
