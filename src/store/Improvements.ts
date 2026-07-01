import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useProjectStore } from './Project';

import type {
  Improvement,
  ImprovementsAnalysis,
  ImprovementsStatus,
  ImprovementsTask,
} from './types/Improvements.types';

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

export const useImprovementsStore = defineStore('Improvements', () => {
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
    setStatus('loading');
    resetAnalysisState();

    try {
      await supervisorApi.improvements.runAnalysis({
        projectUuid: projectUuid.value,
      });

      await loadImprovementsData();
    } catch (error) {
      setStatus('error');
      console.error(error);
    }
  }

  return {
    analysis,
    improvements,
    fetchImprovements,
    runAnalysis,
  };
});
