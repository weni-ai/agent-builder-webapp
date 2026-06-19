import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';
import nexusaiAPI from '@/api/nexusaiAPI';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      supervisor: {
        improvements: {
          runAnalysis: vi.fn(),
          getAnalysis: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({
    uuid: 'test-project-uuid',
  })),
}));

const buildImprovement = (overrides = {}) => ({
  uuid: 'improvement-uuid-1',
  text: 'Sample improvement',
  type: 'brand_voice_mismatch',
  conversationsCount: 10,
  ...overrides,
});

describe('Improvements Store', () => {
  let store;
  let improvementsApi;

  beforeEach(() => {
    vi.useFakeTimers();
    setActivePinia(createPinia());
    vi.clearAllMocks();

    store = useImprovementsStore();
    improvementsApi = nexusaiAPI.agent_builder.supervisor.improvements;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with empty analysis and improvements state', () => {
      expect(store.analysis).toEqual({
        status: null,
        task: null,
      });
      expect(store.improvements).toEqual({
        data: [],
        status: null,
      });
    });
  });

  describe('runAnalysis', () => {
    it('sets loading state and clears previous data before the request resolves', async () => {
      let resolveRunAnalysis;
      improvementsApi.runAnalysis.mockReturnValue(
        new Promise((resolve) => {
          resolveRunAnalysis = resolve;
        }),
      );

      const promise = store.runAnalysis();

      expect(store.analysis.status).toBe('loading');
      expect(store.improvements.status).toBe('loading');
      expect(store.analysis.task).toBeNull();
      expect(store.improvements.data).toEqual([]);

      resolveRunAnalysis({
        task: { isRunning: false, progress: 1, total: 1 },
        improvements: [buildImprovement()],
      });

      await promise;
    });

    it('calls runAnalysis with the current project uuid', async () => {
      improvementsApi.runAnalysis.mockResolvedValue({
        task: { isRunning: false, progress: 1, total: 1 },
        improvements: [buildImprovement()],
      });

      await store.runAnalysis();

      expect(improvementsApi.runAnalysis).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
      });
    });

    it('completes immediately when the initial response is already finished', async () => {
      const improvements = [buildImprovement()];

      improvementsApi.runAnalysis.mockResolvedValue({
        task: { isRunning: false, progress: 5, total: 5 },
        improvements,
      });

      await store.runAnalysis();

      expect(improvementsApi.getAnalysis).not.toHaveBeenCalled();
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
      expect(store.analysis.task).toEqual({
        isRunning: false,
        progress: 5,
        total: 5,
      });
      expect(store.improvements.data).toEqual(improvements);
    });

    it('polls getAnalysis until the task is no longer running', async () => {
      const improvements = [buildImprovement({ uuid: 'final-uuid' })];

      improvementsApi.runAnalysis.mockResolvedValue({
        task: { isRunning: true, progress: 0, total: 3 },
        improvements: [],
      });

      improvementsApi.getAnalysis
        .mockResolvedValueOnce({
          task: { isRunning: true, progress: 1, total: 3 },
          improvements: [],
        })
        .mockResolvedValueOnce({
          task: { isRunning: true, progress: 2, total: 3 },
          improvements: [],
        })
        .mockResolvedValueOnce({
          task: { isRunning: false, progress: 3, total: 3 },
          improvements,
        });

      const promise = store.runAnalysis();

      await vi.runAllTimersAsync();
      await promise;

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(3);
      expect(improvementsApi.getAnalysis).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
      });
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
      expect(store.analysis.task).toEqual({
        isRunning: false,
        progress: 3,
        total: 3,
      });
      expect(store.improvements.data).toEqual(improvements);
    });

    it('uses progressive polling intervals before each getAnalysis request', async () => {
      improvementsApi.runAnalysis.mockResolvedValue({
        task: { isRunning: true, progress: 0, total: 1 },
        improvements: [],
      });

      improvementsApi.getAnalysis.mockResolvedValue({
        task: { isRunning: true, progress: 0, total: 1 },
        improvements: [],
      });

      const promise = store.runAnalysis();

      for (let pollCount = 0; pollCount < 50; pollCount += 1) {
        const expectedInterval =
          pollCount < 10
            ? 5_000
            : pollCount < 20
              ? 10_000
              : pollCount < 30
                ? 15_000
                : 60_000;

        await vi.advanceTimersByTimeAsync(expectedInterval);
        await Promise.resolve();
      }

      await promise;

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(50);
    });

    it('stops polling after reaching the maximum number of requests', async () => {
      improvementsApi.runAnalysis.mockResolvedValue({
        task: { isRunning: true, progress: 0, total: 1 },
        improvements: [],
      });

      improvementsApi.getAnalysis.mockResolvedValue({
        task: { isRunning: true, progress: 0, total: 1 },
        improvements: [],
      });

      const promise = store.runAnalysis();

      await vi.runAllTimersAsync();
      await promise;

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(50);
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
      expect(store.analysis.task).toEqual({
        isRunning: true,
        progress: 0,
        total: 1,
      });
    });

    it('sets error status and rethrows when runAnalysis fails', async () => {
      improvementsApi.runAnalysis.mockRejectedValue(new Error('boom'));

      await expect(store.runAnalysis()).rejects.toThrow('boom');

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
      expect(improvementsApi.getAnalysis).not.toHaveBeenCalled();
    });

    it('sets error status and rethrows when polling fails', async () => {
      improvementsApi.runAnalysis.mockResolvedValue({
        task: { isRunning: true, progress: 0, total: 2 },
        improvements: [],
      });

      improvementsApi.getAnalysis.mockRejectedValue(new Error('poll failed'));

      const promise = store.runAnalysis();
      const assertion = await expect(promise).rejects.toThrow('poll failed');

      await vi.advanceTimersByTimeAsync(5_000);
      await assertion;

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
    });
  });
});
