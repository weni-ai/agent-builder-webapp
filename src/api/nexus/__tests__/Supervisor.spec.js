import { describe, it, expect, vi, beforeEach } from 'vitest';
import nexusRequest from '@/api/nexusaiRequest';
import { Supervisor } from '@/api/nexus/Supervisor';

vi.mock('@/api/nexusaiRequest', () => ({
  default: {
    $http: {
      get: vi.fn(),
    },
  },
}));

describe('Supervisor.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        `/api/v2/${projectUuid}/conversations/${uuid}`,
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
      const next = `https://api.example.com/api/v2/${projectUuid}/conversations/${uuid}/?page=1`;

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
});
