import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import { isToday } from 'date-fns';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { getYesterdayFormattedDate } from '@/utils/formatters';
import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';

import type {
  Improvement,
  ImprovementStatus,
  ImprovementsAnalysis,
  ImprovementsStatus,
  ImprovementsTask,
  RunAnalysisBlockReason,
} from './types/Improvements.types';

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

export const useImprovementsStore = defineStore('Improvements', () => {
  const alertStore = useAlertStore();

  const projectUuid = computed(() => useProjectStore().uuid);
  const supervisorApi = nexusaiAPI.agent_builder.supervisor;

  const analysis = reactive<{
    status: ImprovementsStatus;
    task: ImprovementsTask | null;
    yesterdayConversationsCount: number;
  }>({
    status: null,
    task: null,
    yesterdayConversationsCount: 0,
  });

  const improvements = reactive<{
    data: Improvement[];
    status: ImprovementsStatus;
  }>({
    data: [],
    status: null,
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

    const createdAt = analysis.task?.createdAt;

    if (createdAt && isToday(new Date(createdAt))) {
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
      Boolean(analysis.task?.isRunning) ||
      runAnalysisBlockReason.value !== null,
  );

  function setStatus(status: ImprovementsStatus) {
    analysis.status = status;
    improvements.status = status;
  }

  function resetAnalysisState() {
    analysis.task = null;
    analysis.yesterdayConversationsCount = 0;
    improvements.data = [];
  }

  async function pollAnalysisUntilComplete(
    initialResponse: ImprovementsAnalysis,
  ) {
    let response = initialResponse;
    let pollCount = 0;

    while (response.task?.isRunning && pollCount < POLL_PHASE_LIMITS.minute) {
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

    if (response.task?.isRunning) {
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

      return { status: 'complete' as const };
    } catch (error) {
      console.error(error);
      return { status: 'error' as const };
    }
  }

  return {
    analysis,
    improvements,
    runAnalysisBlockReason,
    isRunAnalysisDisabled,
    fetchImprovements,
    runAnalysis,
    updateImprovementStatus,
  };
});
