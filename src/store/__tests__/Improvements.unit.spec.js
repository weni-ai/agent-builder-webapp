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

const POLL_INTERVALS_MS = {
  fast: 5_000,
  medium: 10_000,
  slow: 15_000,
  minute: 60_000,
};

const MAX_POLL_REQUESTS = 50;

const getPollIntervalMs = (completedPollCount) => {
  if (completedPollCount < 10) {
    return POLL_INTERVALS_MS.fast;
  }

  if (completedPollCount < 20) {
    return POLL_INTERVALS_MS.medium;
  }

  if (completedPollCount < 30) {
    return POLL_INTERVALS_MS.slow;
  }

  return POLL_INTERVALS_MS.minute;
};

const buildAnalysisResponse = (overrides = {}) => ({
  conversationsCount: 10,
  task: { isRunning: false, progress: 1, total: 1, createdAt: null },
  improvements: [],
  ...overrides,
});

const buildImprovement = (overrides = {}) => ({
  uuid: 'improvement-uuid-1',
  text: 'Sample improvement',
  type: 'personality_deviation',
  conversationsCount: 10,
  ...overrides,
});

const advancePollingTimers = async (pollCount = MAX_POLL_REQUESTS) => {
  for (let index = 0; index < pollCount; index += 1) {
    await vi.advanceTimersByTimeAsync(getPollIntervalMs(index));
    await Promise.resolve();
  }
};

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
        conversationsCount: 0,
      });
      expect(store.improvements).toEqual({
        data: [],
        status: null,
      });
    });
  });

  describe('fetchImprovements', () => {
    it('loads improvements from the API and sets complete status', async () => {
      const improvements = [buildImprovement()];

      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          conversationsCount: 25,
          task: { isRunning: false, progress: 5, total: 5, createdAt: null },
          improvements,
        }),
      );

      await store.fetchImprovements();

      expect(improvementsApi.getAnalysis).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
      });
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
      expect(store.analysis.conversationsCount).toBe(25);
      expect(store.improvements.data).toEqual(improvements);
    });

    it('polls getAnalysis when the task is still running', async () => {
      const improvements = [buildImprovement({ uuid: 'final-uuid' })];

      improvementsApi.getAnalysis
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: true, progress: 0, total: 3, createdAt: null },
          }),
        )
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: true, progress: 2, total: 3, createdAt: null },
          }),
        )
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: false, progress: 3, total: 3, createdAt: null },
            improvements,
          }),
        );

      const promise = store.fetchImprovements();

      await advancePollingTimers(2);
      await promise;

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(3);
      expect(store.improvements.data).toEqual(improvements);
    });

    it('sets error status and rethrows when the request fails', async () => {
      improvementsApi.getAnalysis.mockRejectedValue(new Error('fetch failed'));

      await expect(store.fetchImprovements()).rejects.toThrow('fetch failed');

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
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
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          improvements: [buildImprovement()],
        }),
      );

      const promise = store.runAnalysis();

      expect(store.analysis.status).toBe('loading');
      expect(store.improvements.status).toBe('loading');
      expect(store.analysis.task).toBeNull();
      expect(store.analysis.conversationsCount).toBe(0);
      expect(store.improvements.data).toEqual([]);

      resolveRunAnalysis();

      await promise;
    });

    it('calls runAnalysis and getAnalysis with the current project uuid', async () => {
      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          improvements: [buildImprovement()],
        }),
      );

      await store.runAnalysis();

      expect(improvementsApi.runAnalysis).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
      });
      expect(improvementsApi.getAnalysis).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
      });
    });

    it('completes immediately when the initial response is already finished', async () => {
      const improvements = [buildImprovement()];

      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          task: { isRunning: false, progress: 5, total: 5, createdAt: null },
          improvements,
        }),
      );

      await store.runAnalysis();

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(1);
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
      expect(store.analysis.task).toEqual({
        isRunning: false,
        progress: 5,
        total: 5,
        createdAt: null,
      });
      expect(store.improvements.data).toEqual(improvements);
    });

    it('polls getAnalysis until the task is no longer running', async () => {
      const improvements = [buildImprovement({ uuid: 'final-uuid' })];

      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: true, progress: 0, total: 3, createdAt: null },
          }),
        )
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: true, progress: 2, total: 3, createdAt: null },
          }),
        )
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: false, progress: 3, total: 3, createdAt: null },
            improvements,
          }),
        );

      const promise = store.runAnalysis();

      await advancePollingTimers(2);
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
        createdAt: null,
      });
      expect(store.improvements.data).toEqual(improvements);
    });

    it('uses progressive polling intervals before each getAnalysis request', async () => {
      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          task: { isRunning: true, progress: 0, total: 1, createdAt: null },
        }),
      );

      const promise = store.runAnalysis();

      await advancePollingTimers();
      await promise;

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(
        MAX_POLL_REQUESTS + 1,
      );
    });

    it('stops polling after reaching the maximum number of requests', async () => {
      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          task: { isRunning: true, progress: 0, total: 1, createdAt: null },
        }),
      );

      const promise = store.runAnalysis();

      await advancePollingTimers();
      await promise;

      expect(improvementsApi.getAnalysis).toHaveBeenCalledTimes(
        MAX_POLL_REQUESTS + 1,
      );
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
      expect(store.analysis.task).toEqual({
        isRunning: true,
        progress: 0,
        total: 1,
        createdAt: null,
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
      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: true, progress: 0, total: 2, createdAt: null },
          }),
        )
        .mockRejectedValue(new Error('poll failed'));

      const promise = store.runAnalysis();

      await Promise.resolve();

      await Promise.all([
        vi.advanceTimersByTimeAsync(POLL_INTERVALS_MS.fast),
        expect(promise).rejects.toThrow('poll failed'),
      ]);

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
    });
  });
});
