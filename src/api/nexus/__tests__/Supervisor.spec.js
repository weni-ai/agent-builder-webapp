import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function startMockAnalysis() {
      const promise = Supervisor.improvements.runAnalysis({
        projectUuid: 'project-123',
      });

      await vi.advanceTimersByTimeAsync(400);

      return promise;
    }

    async function pollMockAnalysis() {
      const promise = Supervisor.improvements.getAnalysis({
        projectUuid: 'project-123',
      });

      await vi.advanceTimersByTimeAsync(400);

      return promise;
    }

    it('runAnalysis returns an initial running task with empty improvements', async () => {
      const result = await startMockAnalysis();

      expect(result.task).toEqual({
        isRunning: true,
        progress: 0,
        total: 5,
      });
      expect(result.improvements).toEqual([]);
    });

    it('getAnalysis throws when no analysis task was started', async () => {
      vi.resetModules();

      const { Supervisor: FreshSupervisor } = await import(
        '@/api/nexus/Supervisor'
      );

      await expect(
        FreshSupervisor.improvements.getAnalysis({
          projectUuid: 'project-123',
        }),
      ).rejects.toThrow('No improvements analysis task found.');
    });

    it('getAnalysis advances progress until improvements are returned', async () => {
      await startMockAnalysis();

      let result;

      for (let step = 1; step <= 5; step += 1) {
        result = await pollMockAnalysis();

        expect(result.task).toEqual({
          isRunning: step < 5,
          progress: step,
          total: 5,
        });

        if (step < 4) {
          expect(result.improvements).toEqual([]);
        } else if (step === 4) {
          expect(result.improvements).toHaveLength(3);
          expect(result.improvements[0]).toMatchObject({
            uuid: 'improvement-uuid-1',
            type: 'brand_voice_mismatch',
          });
          expect(result.improvements[2]).toMatchObject({
            uuid: 'improvement-uuid-3',
            type: 'missing_static_knowledge',
          });
        }
      }

      expect(result.task).toEqual({
        isRunning: false,
        progress: 5,
        total: 5,
      });
      expect(result.improvements).toHaveLength(6);
      expect(result.improvements[0]).toMatchObject({
        uuid: 'improvement-uuid-1',
        type: 'brand_voice_mismatch',
        conversationsCount: 18,
      });
      expect(result.improvements[5]).toMatchObject({
        uuid: 'improvement-uuid-6',
        type: 'amazing_conversation',
        conversationsCount: 3,
      });
    });

    it('getAnalysis keeps returning completed data without changing progress', async () => {
      await startMockAnalysis();

      let completedResult;

      for (let step = 0; step < 5; step += 1) {
        completedResult = await pollMockAnalysis();
      }

      const result = await pollMockAnalysis();

      expect(result.task).toEqual(completedResult.task);
      expect(result.improvements).toEqual(completedResult.improvements);
    });
  });
});
