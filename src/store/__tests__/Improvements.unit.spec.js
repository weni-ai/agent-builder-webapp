import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';
import { DEFAULT_IMPROVEMENTS_TASK } from '@/store/types/Improvements.types';
import { useAlertStore } from '@/store/Alert';
import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { getYesterdayFormattedDate } from '@/utils/formatters';

vi.mock('@/api/nexusaiAPI', () => ({
  default: {
    agent_builder: {
      supervisor: {
        improvements: {
          runAnalysis: vi.fn(),
          getAnalysis: vi.fn(),
          getById: vi.fn(),
          updateStatus: vi.fn(),
          contactSupport: vi.fn(),
          getAffectedConversations: vi.fn(),
        },
      },
    },
  },
}));

vi.mock('@/store/Project', () => ({
  useProjectStore: vi.fn(() => ({
    uuid: 'test-project-uuid',
    project: {
      name: 'Test Project',
    },
  })),
}));

vi.mock('@/store/User', () => ({
  useUserStore: vi.fn(() => ({
    user: {
      email: 'user@example.com',
    },
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
  yesterdayConversationsCount: 10,
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

const buildImprovementDetail = (overrides = {}) => ({
  uuid: 'improvement-uuid-1',
  text: 'Sample improvement',
  type: 'personality_deviation',
  description: 'Sample diagnosis',
  suggestedSolution: 'Update the tone instruction',
  status: 'pending',
  affectedInstructions: [
    {
      id: 42,
      changeType: 'fix',
      wasChanged: false,
    },
  ],
  ...overrides,
});

const buildAffectedConversationsResponse = (overrides = {}) => ({
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
        task: { ...DEFAULT_IMPROVEMENTS_TASK },
        yesterdayConversationsCount: 0,
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
          yesterdayConversationsCount: 25,
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
      expect(store.analysis.yesterdayConversationsCount).toBe(25);
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
      expect(store.analysis.task.isRunning).toBe(false);
      expect(store.analysis.status).toBe('complete');
      expect(store.improvements.status).toBe('complete');
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

  describe('runAnalysisBlockReason', () => {
    it('returns null while status is loading', () => {
      store.analysis.status = 'loading';
      store.analysis.yesterdayConversationsCount = 5;

      expect(store.runAnalysisBlockReason).toBeNull();
    });

    it('returns insufficient_volume when yesterday count is below minimum', () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 14;
      store.analysis.task = { ...DEFAULT_IMPROVEMENTS_TASK };

      expect(store.runAnalysisBlockReason).toBe('insufficient_volume');
    });

    it('returns null when yesterday count meets minimum', () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 15;
      store.analysis.task = { ...DEFAULT_IMPROVEMENTS_TASK };

      expect(store.runAnalysisBlockReason).toBeNull();
    });

    it('returns already_run_today when task was created less than 24 hours ago', () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 50;
      store.analysis.task = {
        isRunning: false,
        progress: 5,
        total: 5,
        createdAt: new Date().toISOString(),
      };

      expect(store.runAnalysisBlockReason).toBe('already_run_today');
    });

    it('does not return already_run_today when task was created 24 hours ago or more', () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 50;
      store.analysis.task = {
        isRunning: false,
        progress: 5,
        total: 5,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      };

      expect(store.runAnalysisBlockReason).toBeNull();
    });

    it('prioritizes already_run_today over insufficient_volume', () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 5;
      store.analysis.task = {
        isRunning: false,
        progress: 5,
        total: 5,
        createdAt: new Date().toISOString(),
      };

      expect(store.runAnalysisBlockReason).toBe('already_run_today');
    });
  });

  describe('isRunAnalysisDisabled', () => {
    it('is true while status is loading', () => {
      store.analysis.status = 'loading';

      expect(store.isRunAnalysisDisabled).toBe(true);
    });

    it('is true when task is running', () => {
      store.analysis.status = 'complete';
      store.analysis.task = {
        isRunning: true,
        progress: 1,
        total: 5,
        createdAt: null,
      };

      expect(store.isRunAnalysisDisabled).toBe(true);
    });

    it('is true when run analysis is blocked', () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 10;

      expect(store.isRunAnalysisDisabled).toBe(true);
    });
  });

  describe('runAnalysis', () => {
    it('does not call API when run analysis is disabled', async () => {
      store.analysis.status = 'complete';
      store.analysis.yesterdayConversationsCount = 5;

      await store.runAnalysis();

      expect(improvementsApi.runAnalysis).not.toHaveBeenCalled();
    });

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
      expect(store.analysis.task).toEqual({ ...DEFAULT_IMPROVEMENTS_TASK });
      expect(store.analysis.yesterdayConversationsCount).toBe(0);
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
          improvements,
        }),
      );

      await store.runAnalysis();

      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t(
          'audit.improvements.analysis_complete.title_with_count',
          { count: improvements.length },
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

  describe('updateImprovementStatus', () => {
    it('calls updateStatus with ignored status and removes the improvement from the list', async () => {
      const improvement = buildImprovement();
      store.improvements.data = [improvement];
      improvementsApi.updateStatus.mockResolvedValue();

      const result = await store.updateImprovementStatus(
        improvement.uuid,
        'ignored',
      );

      expect(improvementsApi.updateStatus).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        improvementUuid: improvement.uuid,
        status: 'ignored',
      });
      expect(store.improvements.data).toEqual([]);
      expect(result).toEqual({ status: 'complete' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t(
          'audit.improvements.status_update.success.ignored.title',
        ),
        description: i18n.global.t(
          'audit.improvements.status_update.success.description',
        ),
      });
    });

    it('calls updateStatus with resolved status and removes the improvement from the list', async () => {
      const improvement = buildImprovement({ uuid: 'improvement-uuid-2' });
      store.improvements.data = [improvement];
      improvementsApi.updateStatus.mockResolvedValue();

      const result = await store.updateImprovementStatus(
        improvement.uuid,
        'resolved',
      );

      expect(improvementsApi.updateStatus).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        improvementUuid: improvement.uuid,
        status: 'resolved',
      });
      expect(store.improvements.data).toEqual([]);
      expect(result).toEqual({ status: 'complete' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t(
          'audit.improvements.status_update.success.resolved.title',
        ),
        description: i18n.global.t(
          'audit.improvements.status_update.success.description',
        ),
      });
    });

    it('returns error status and keeps the improvement when the request fails', async () => {
      const improvement = buildImprovement();
      const error = new Error('update failed');
      store.improvements.data = [improvement];
      improvementsApi.updateStatus.mockRejectedValue(error);

      const result = await store.updateImprovementStatus(
        improvement.uuid,
        'ignored',
      );

      expect(store.improvements.data).toEqual([improvement]);
      expect(result).toEqual({ status: 'error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t(
          'audit.improvements.status_update.error.ignored.title',
        ),
        description: i18n.global.t(
          'audit.improvements.status_update.error.ignored.description',
        ),
      });
    });
  });

  describe('contactTechnicalSupport', () => {
    it('calls contactSupport and shows a success alert', async () => {
      const improvement = buildImprovement();
      store.improvementDetail.data = buildImprovementDetail({
        text: 'Poor product search results',
      });
      improvementsApi.contactSupport.mockResolvedValue();

      const result = await store.contactTechnicalSupport(improvement.uuid);

      expect(improvementsApi.contactSupport).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        improvementUuid: improvement.uuid,
        projectName: 'Test Project',
        email: 'user@example.com',
      });
      expect(result).toEqual({ status: 'complete' });
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'success',
        text: i18n.global.t(
          'audit.improvements.contact_technical_support_dialog.success.title',
        ),
        description: i18n.global.t(
          'audit.improvements.contact_technical_support_dialog.success.description',
          {
            improvement_title: 'Poor product search results',
          },
        ),
      });
    });

    it('returns error status and shows an error alert when the request fails', async () => {
      const improvement = buildImprovement();
      const error = new Error('contact support failed');
      improvementsApi.contactSupport.mockRejectedValue(error);

      const result = await store.contactTechnicalSupport(improvement.uuid);

      expect(result).toEqual({ status: 'error' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      expect(alertStore.add).toHaveBeenCalledWith({
        type: 'error',
        text: i18n.global.t(
          'audit.improvements.contact_technical_support_dialog.error',
        ),
      });
    });
  });

  describe('fetchImprovementDetail', () => {
    it('loads improvement detail and sets complete status', async () => {
      const detail = buildImprovementDetail();
      improvementsApi.getById.mockResolvedValue(detail);

      await store.fetchImprovementDetail(detail.uuid);

      expect(improvementsApi.getById).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        improvementUuid: detail.uuid,
      });
      expect(store.improvementDetail.status).toBe('complete');
      expect(store.improvementDetail.data).toEqual(detail);
    });

    it('sets error status when the request fails', async () => {
      const error = new Error('detail failed');
      improvementsApi.getById.mockRejectedValue(error);

      await store.fetchImprovementDetail('improvement-uuid-1');

      expect(store.improvementDetail.status).toBe('error');
      expect(store.improvementDetail.data).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('resetImprovementDetail', () => {
    it('clears improvement detail state', () => {
      store.improvementDetail.data = buildImprovementDetail();
      store.improvementDetail.status = 'complete';

      store.resetImprovementDetail();

      expect(store.improvementDetail.data).toBeNull();
      expect(store.improvementDetail.status).toBeNull();
    });
  });

  describe('fetchAffectedConversations', () => {
    it('loads affected conversations and sets complete status', async () => {
      const response = buildAffectedConversationsResponse();
      improvementsApi.getAffectedConversations.mockResolvedValue(response);

      await store.fetchAffectedConversations('improvement-uuid-1', 2);

      expect(improvementsApi.getAffectedConversations).toHaveBeenCalledWith({
        projectUuid: 'test-project-uuid',
        improvementUuid: 'improvement-uuid-1',
        page: 2,
        pageSize: 10,
      });
      expect(store.affectedConversations.status).toBe('complete');
      expect(store.affectedConversations.page).toBe(2);
      expect(store.affectedConversations.data).toEqual(response);
    });

    it('sets error status when the request fails', async () => {
      const error = new Error('affected conversations failed');
      improvementsApi.getAffectedConversations.mockRejectedValue(error);

      await store.fetchAffectedConversations('improvement-uuid-1');

      expect(store.affectedConversations.status).toBe('error');
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    });
  });

  describe('resetAffectedConversations', () => {
    it('clears affected conversations state', () => {
      store.affectedConversations.data = buildAffectedConversationsResponse();
      store.affectedConversations.status = 'complete';
      store.affectedConversations.page = 3;

      store.resetAffectedConversations();

      expect(store.affectedConversations.data).toEqual({
        count: 0,
        results: [],
      });
      expect(store.affectedConversations.status).toBeNull();
      expect(store.affectedConversations.page).toBe(1);
    });
  });
});
