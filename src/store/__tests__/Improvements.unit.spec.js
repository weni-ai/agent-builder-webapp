import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { subDays } from 'date-fns';

import { useImprovementsStore } from '@/store/Improvements';
import { useAlertStore } from '@/store/Alert';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { formatMonthDayDate } from '@/utils/formatters';

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
  let consoleErrorSpy;
  let alertStore;

  const getYesterdayFormattedDate = () =>
    formatMonthDayDate(subDays(new Date(), 1).toISOString());

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-18T12:00:00'));
    setActivePinia(createPinia());
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    store = useImprovementsStore();
    alertStore = useAlertStore();
    vi.spyOn(alertStore, 'add');
    improvementsApi = nexusaiAPI.agent_builder.supervisor.improvements;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
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
      expect(alertStore.add).not.toHaveBeenCalled();
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
      expect(store.analysis.status).toBe('loading');
      expect(store.improvements.status).toBe('loading');
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('sets error status and logs error when the request fails', async () => {
      const error = new Error('fetch failed');
      improvementsApi.getAnalysis.mockRejectedValue(error);

      await store.fetchImprovements();

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(alertStore.add).not.toHaveBeenCalled();
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
      expect(store.analysis.status).toBe('loading');
      expect(store.improvements.status).toBe('loading');
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
      expect(store.analysis.status).toBe('loading');
      expect(store.improvements.status).toBe('loading');
      expect(store.analysis.task).toEqual({
        isRunning: true,
        progress: 0,
        total: 1,
        createdAt: null,
      });
    });

    it('sets error status and logs error when runAnalysis fails', async () => {
      const error = new Error('boom');
      improvementsApi.runAnalysis.mockRejectedValue(error);

      await store.runAnalysis();

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
      expect(improvementsApi.getAnalysis).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('sets error status and logs error when polling fails', async () => {
      const error = new Error('poll failed');

      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis
        .mockResolvedValueOnce(
          buildAnalysisResponse({
            task: { isRunning: true, progress: 0, total: 2, createdAt: null },
          }),
        )
        .mockRejectedValue(error);

      const promise = store.runAnalysis();

      await vi.advanceTimersByTimeAsync(POLL_INTERVALS_MS.fast);
      await promise;

      expect(store.analysis.status).toBe('error');
      expect(store.improvements.status).toBe('error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(alertStore.add).not.toHaveBeenCalled();
    });

    it('shows a success alert when analysis completes without improvements', async () => {
      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          conversationsCount: 0,
          improvements: [],
        }),
      );

      await store.runAnalysis();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t('audit.improvements.analysis_complete.title'),
        description: i18n.global.t(
          'audit.improvements.analysis_complete.no_improvements_description',
          { date: getYesterdayFormattedDate() },
        ),
      });
    });

    it('shows a success alert when analysis completes with improvements', async () => {
      const improvements = [
        buildImprovement(),
        buildImprovement({ uuid: 'improvement-uuid-2' }),
      ];

      improvementsApi.runAnalysis.mockResolvedValue();
      improvementsApi.getAnalysis.mockResolvedValue(
        buildAnalysisResponse({
          conversationsCount: 25,
          improvements,
        }),
      );

      await store.runAnalysis();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t(
          'audit.improvements.analysis_complete.title_with_count',
          { count: 25 },
        ),
        description: i18n.global.t(
          'audit.improvements.analysis_complete.ready_description',
          { date: getYesterdayFormattedDate() },
        ),
      });
    });

    it('does not show a success alert when analysis fails', async () => {
      improvementsApi.runAnalysis.mockRejectedValue(new Error('boom'));

      await store.runAnalysis();

      expect(alertStore.add).not.toHaveBeenCalled();
    });
  });
});
