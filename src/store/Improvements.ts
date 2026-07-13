import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import { differenceInHours } from 'date-fns';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { getYesterdayFormattedDate } from '@/utils/formatters';
import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';

import type {
  AffectedConversationsResponse,
  Improvement,
  ImprovementDetail,
  ImprovementStatus,
  ImprovementsAnalysis,
  ImprovementsStatus,
  RunAnalysisBlockReason,
} from './types/Improvements.types';
import { DEFAULT_IMPROVEMENTS_TASK } from './types/Improvements.types';

export const AFFECTED_CONVERSATIONS_PAGE_SIZE = 10;

export const MIN_CONVERSATIONS_FOR_ANALYSIS = 15;

const POLL_INTERVALS_MS = {
  fast: 5_000,
  medium: 10_000,
  slow: 15_000,
  minute: 60_000,
} as const;

const POLL_PHASE_LIMITS = {
  fast: 10,
  medium: 20,
  slow: 30,
  minute: 50,
} as const;

function getPollIntervalMs(completedPollCount: number) {
  if (completedPollCount < POLL_PHASE_LIMITS.fast) {
    return POLL_INTERVALS_MS.fast;
  }

  if (completedPollCount < POLL_PHASE_LIMITS.medium) {
    return POLL_INTERVALS_MS.medium;
  }

  if (completedPollCount < POLL_PHASE_LIMITS.slow) {
    return POLL_INTERVALS_MS.slow;
  }

  return POLL_INTERVALS_MS.minute;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function notifyAnalysisComplete(
  alertStore: ReturnType<typeof useAlertStore>,
  improvementCount: number,
) {
  const date = getYesterdayFormattedDate();

  const analysisT = (field: string, params?: Record<string, string | number>) =>
    i18n.global.t(`audit.improvements.analysis_complete.${field}`, params);

  let alertText = analysisT('title');
  let alertDescription = analysisT('no_improvements_description', { date });

  if (improvementCount > 0) {
    alertText = analysisT('title_with_count', { count: improvementCount });
    alertDescription = analysisT('ready_description', { date });
  }

  alertStore.add({
    type: 'success',
    text: alertText,
    description: alertDescription,
  });
}

function notifyStatusUpdate(
  alertStore: ReturnType<typeof useAlertStore>,
  status: ImprovementStatus,
  outcome: 'success' | 'error',
) {
  const prefix = `audit.improvements.status_update.${outcome}`;

  alertStore.add({
    type: outcome,
    text: i18n.global.t(`${prefix}.${status}.title`),
    description: i18n.global.t(
      outcome === 'success'
        ? `${prefix}.description`
        : `${prefix}.${status}.description`,
    ),
  });
}

export const useImprovementsStore = defineStore('Improvements', () => {
  const alertStore = useAlertStore();

  const projectUuid = computed(() => useProjectStore().uuid);
  const supervisorApi = nexusaiAPI.agent_builder.supervisor;

  const analysis = reactive<{
    status: ImprovementsStatus;
    task: typeof DEFAULT_IMPROVEMENTS_TASK;
    yesterdayConversationsCount: number;
  }>({
    status: null,
    task: { ...DEFAULT_IMPROVEMENTS_TASK },
    yesterdayConversationsCount: 0,
  });

  const improvements = reactive<{
    data: Improvement[];
    status: ImprovementsStatus;
  }>({
    data: [],
    status: null,
  });

  const improvementDetail = reactive<{
    data: ImprovementDetail | null;
    status: ImprovementsStatus;
  }>({
    data: null,
    status: null,
  });

  const affectedConversations = reactive<{
    data: AffectedConversationsResponse;
    status: ImprovementsStatus;
    page: number;
    pageSize: number;
  }>({
    data: {
      count: 0,
      results: [],
    },
    status: null,
    page: 1,
    pageSize: AFFECTED_CONVERSATIONS_PAGE_SIZE,
  });

  function applyAnalysisResponse(response: ImprovementsAnalysis) {
    analysis.task = response.task;
    analysis.yesterdayConversationsCount = response.yesterdayConversationsCount;
    improvements.data = response.improvements;
  }

  const runAnalysisBlockReason = computed<RunAnalysisBlockReason>(() => {
    if (analysis.status !== 'complete') {
      return null;
    }

    const createdAt = analysis.task.createdAt;

    if (createdAt && differenceInHours(new Date(), new Date(createdAt)) < 24) {
      return 'already_run_today';
    }

    if (analysis.yesterdayConversationsCount < MIN_CONVERSATIONS_FOR_ANALYSIS) {
      return 'insufficient_volume';
    }

    return null;
  });

  const isRunAnalysisDisabled = computed(
    () =>
      analysis.status === 'loading' ||
      analysis.task.isRunning ||
      runAnalysisBlockReason.value !== null,
  );

  function setStatus(status: ImprovementsStatus) {
    analysis.status = status;
    improvements.status = status;
  }

  function resetAnalysisState() {
    analysis.task = { ...DEFAULT_IMPROVEMENTS_TASK };
    analysis.yesterdayConversationsCount = 0;
    improvements.data = [];
  }

  async function pollAnalysisUntilComplete(
    initialResponse: ImprovementsAnalysis,
  ) {
    let response = initialResponse;
    let pollCount = 0;

    while (response.task.isRunning && pollCount < POLL_PHASE_LIMITS.minute) {
      await wait(getPollIntervalMs(pollCount));

      response = await supervisorApi.improvements.getAnalysis({
        projectUuid: projectUuid.value,
      });

      applyAnalysisResponse(response);
      pollCount += 1;
    }

    return response;
  }

  async function loadImprovementsData() {
    const response = await supervisorApi.improvements.getAnalysis({
      projectUuid: projectUuid.value,
    });

    applyAnalysisResponse(response);

    if (response.task.isRunning) {
      await pollAnalysisUntilComplete(response);
    } else {
      setStatus('complete');
    }
  }

  async function fetchImprovements() {
    setStatus('loading');

    try {
      await loadImprovementsData();
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  }

  async function runAnalysis() {
    if (isRunAnalysisDisabled.value) {
      return;
    }

    setStatus('loading');
    resetAnalysisState();

    try {
      await supervisorApi.improvements.runAnalysis({
        projectUuid: projectUuid.value,
      });

      await loadImprovementsData();
      notifyAnalysisComplete(alertStore, improvements.data.length);
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  }

  async function contactTechnicalSupport(improvementUuid: string) {
    try {
      await supervisorApi.improvements.contactSupport({
        projectUuid: projectUuid.value,
        improvementUuid,
      });

      alertStore.add({
        type: 'success',
        text: i18n.global.t(
          'audit.improvements.contact_technical_support_dialog.success.title',
        ),
        description: i18n.global.t(
          'audit.improvements.contact_technical_support_dialog.success.description',
          {
            improvement_title: improvementDetail.data?.text ?? '',
          },
        ),
      });

      return { status: 'complete' as const };
    } catch (error) {
      console.error(error);
      alertStore.add({
        type: 'error',
        text: i18n.global.t(
          'audit.improvements.contact_technical_support_dialog.error',
        ),
      });
      return { status: 'error' as const };
    }
  }

  async function updateImprovementStatus(
    improvementUuid: string,
    status: ImprovementStatus,
  ) {
    try {
      await supervisorApi.improvements.updateStatus({
        projectUuid: projectUuid.value,
        improvementUuid,
        status,
      });

      improvements.data = improvements.data.filter(
        (item) => item.uuid !== improvementUuid,
      );

      notifyStatusUpdate(alertStore, status, 'success');

      return { status: 'complete' as const };
    } catch (error) {
      console.error(error);
      notifyStatusUpdate(alertStore, status, 'error');
      return { status: 'error' as const };
    }
  }

  function resetImprovementDetail() {
    improvementDetail.data = null;
    improvementDetail.status = null;
  }

  async function fetchImprovementDetail(improvementUuid: string) {
    improvementDetail.status = 'loading';
    improvementDetail.data = null;

    try {
      improvementDetail.data = await supervisorApi.improvements.getById({
        projectUuid: projectUuid.value,
        improvementUuid,
      });
      improvementDetail.status = 'complete';
    } catch (error) {
      improvementDetail.status = 'error';
      console.error(error);
    }
  }

  function resetAffectedConversations() {
    affectedConversations.data = {
      count: 0,
      results: [],
    };
    affectedConversations.status = null;
    affectedConversations.page = 1;
  }

  async function fetchAffectedConversations(improvementUuid: string, page = 1) {
    affectedConversations.status = 'loading';
    affectedConversations.page = page;

    try {
      affectedConversations.data =
        await supervisorApi.improvements.getAffectedConversations({
          projectUuid: projectUuid.value,
          improvementUuid,
          page,
          pageSize: affectedConversations.pageSize,
        });
      affectedConversations.status = 'complete';
    } catch (error) {
      affectedConversations.status = 'error';
      console.error(error);
    }
  }

  return {
    analysis,
    improvements,
    improvementDetail,
    affectedConversations,
    runAnalysisBlockReason,
    isRunAnalysisDisabled,
    fetchImprovements,
    fetchImprovementDetail,
    resetImprovementDetail,
    fetchAffectedConversations,
    resetAffectedConversations,
    runAnalysis,
    contactTechnicalSupport,
    updateImprovementStatus,
  };
});
