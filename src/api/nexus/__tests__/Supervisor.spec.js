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
    const mockConversationResponse = {
      data: {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 'conv-123',
            created_on: '2023-01-15T12:30:00Z',
            contact: {
              name: 'John Doe',
              urn: 'tel:+123456789',
            },
            messages: [
              {
                id: 'msg-1',
                text: 'Hello',
                created_on: '2023-01-15T12:30:00Z',
                direction: 'in',
              },
              {
                id: 'msg-2',
                text: 'Hi there!',
                created_on: '2023-01-15T12:31:00Z',
                direction: 'out',
              },
            ],
            events: [
              {
                id: 'evt-1',
                type: 'forwarded',
                created_on: '2023-01-15T12:32:00Z',
              },
            ],
          },
        ],
      },
    };

    const mockConversationWithNextResponse = {
      data: {
        count: 1,
        next: 'https://api.example.com/api/project-123/supervisor/?page=2',
        previous: null,
        results: [
          {
            id: 'conv-123',
            created_on: '2023-01-15T12:30:00Z',
            contact: {
              name: 'John Doe',
              urn: 'tel:+123456789',
            },
            messages: [
              {
                id: 'msg-1',
                text: 'Hello',
                created_on: '2023-01-15T12:30:00Z',
                direction: 'in',
              },
            ],
          },
        ],
      },
    };

    it('should get conversation by id without next param', async () => {
      nexusRequest.$http.get.mockResolvedValue(mockConversationResponse);

      const projectUuid = 'project-123';
      const start = '2023-01-01';
      const end = '2023-01-31';
      const urn = 'tel:+123456789';

      const result = await Supervisor.conversations.getById({
        projectUuid,
        start,
        end,
        urn,
      });

      expect(nexusRequest.$http.get).toHaveBeenCalledWith(
        `/api/${projectUuid}/conversations/?start=2023-01-01&end=2023-01-31&contact_urn=tel%3A%2B123456789`,
      );
      expect(result).toEqual(mockConversationResponse.data);
      expect(result.results[0].contact.urn).toBe('tel:+123456789');
      expect(result.results[0].messages.length).toBe(2);
    });

    it('should get conversation by id with next param', async () => {
      nexusRequest.$http.get.mockResolvedValue(
        mockConversationWithNextResponse,
      );

      const projectUuid = 'project-123';
      const start = '2023-01-01';
      const urn = 'tel:+123456789';
      const next =
        'https://api.example.com/api/project-123/conversations/?page=1';

      const result = await Supervisor.conversations.getById({
        projectUuid,
        start,
        urn,
        next,
      });

      expect(nexusRequest.$http.get).toHaveBeenCalledWith(
        '/api.example.com/api/project-123/conversations/?page=1',
      );
      expect(result).toEqual(mockConversationWithNextResponse.data);
      expect(result.next).toBeTruthy();
    });

    it('should handle error when getting conversation by id', async () => {
      const error = new Error('API Error');
      nexusRequest.$http.get.mockRejectedValue(error);

      const projectUuid = 'project-123';
      const start = '2023-01-01';
      const urn = 'tel:+123456789';

      await expect(
        Supervisor.conversations.getById({
          projectUuid,
          start,
          urn,
        }),
      ).rejects.toThrow('API Error');
    });
  });
});
