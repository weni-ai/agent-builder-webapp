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

const POLL_INTERVAL_MS = 1000;

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
  }>({
    status: null,
    task: null,
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
    improvements.data = response.improvements;
  }

  async function pollAnalysisUntilComplete() {
    let response = await supervisorApi.improvements.getAnalysis({
      projectUuid: projectUuid.value,
    });

    applyAnalysisResponse(response);

    while (response.task.isRunning) {
      await wait(POLL_INTERVAL_MS);

      response = await supervisorApi.improvements.getAnalysis({
        projectUuid: projectUuid.value,
      });

      applyAnalysisResponse(response);
    }

    return response;
  }

  async function runAnalysis() {
    analysis.status = 'loading';
    improvements.status = 'loading';
    analysis.task = null;
    improvements.data = [];

    try {
      const initialResponse = await supervisorApi.improvements.runAnalysis({
        projectUuid: projectUuid.value,
      });

      applyAnalysisResponse(initialResponse);

      if (initialResponse.task.isRunning) {
        await pollAnalysisUntilComplete();
      }

      analysis.status = 'complete';
      improvements.status = 'complete';
    } catch (error) {
      analysis.status = 'error';
      improvements.status = 'error';
      throw error;
    }
  }

  return {
    analysis,
    improvements,
    runAnalysis,
  };
});
