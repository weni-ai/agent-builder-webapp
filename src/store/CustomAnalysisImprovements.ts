import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { useProjectStore } from './Project';
import { useAlertStore } from './Alert';

import type {
  CustomAnalysisImprovement,
  CustomAnalysisImprovementsStatus,
} from './types/CustomAnalysisImprovements.types';

const I18N_PREFIX = 'audit.improvements.custom_analysis_modal';

function isLimitError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    (error as { response?: { status?: number } }).response?.status === 400
  );
}

export const useCustomAnalysisImprovementsStore = defineStore(
  'CustomAnalysisImprovements',
  () => {
    const alertStore = useAlertStore();

    const projectUuid = computed(() => useProjectStore().uuid);
    const customAnalysisApi =
      nexusaiAPI.agent_builder.supervisor.improvements.customAnalysis;

    const customAnalysis = reactive<{
      data: CustomAnalysisImprovement[];
      status: CustomAnalysisImprovementsStatus;
    }>({
      data: [],
      status: 'idle',
    });

    const createCustomAnalysis = reactive<{
      status: CustomAnalysisImprovementsStatus;
    }>({
      status: 'idle',
    });

    const deleteCustomAnalysis = reactive<{
      customAnalysisUuid: string | null;
      status: CustomAnalysisImprovementsStatus;
    }>({
      customAnalysisUuid: null,
      status: 'idle',
    });

    async function fetchCustomAnalysis() {
      customAnalysis.status = 'loading';

      try {
        customAnalysis.data = await customAnalysisApi.list({
          projectUuid: projectUuid.value,
        });
        customAnalysis.status = 'complete';
      } catch (error) {
        customAnalysis.status = 'error';
        console.error(error);
      }
    }

    async function submitCustomAnalysis(text: string) {
      createCustomAnalysis.status = 'loading';

      try {
        const detail = await customAnalysisApi.create({
          projectUuid: projectUuid.value,
          title: text,
          definition: text,
          exclusions: '',
        });

        customAnalysis.data = [
          {
            uuid: detail.uuid,
            title: detail.title,
            conversationsCount: 0,
          },
          ...customAnalysis.data,
        ];
        createCustomAnalysis.status = 'complete';
        alertStore.add({
          type: 'success',
          text: i18n.global.t(`${I18N_PREFIX}.create.success.title`),
          description: i18n.global.t(
            `${I18N_PREFIX}.create.success.description`,
          ),
        });

        return { status: 'complete' as const };
      } catch (error) {
        createCustomAnalysis.status = 'error';
        alertStore.add({
          type: 'error',
          text: i18n.global.t(
            isLimitError(error)
              ? `${I18N_PREFIX}.create.limit_error`
              : `${I18N_PREFIX}.create.error`,
          ),
        });
        console.error(error);

        return { status: 'error' as const };
      }
    }

    async function submitDeleteCustomAnalysis(customAnalysisUuid: string) {
      deleteCustomAnalysis.customAnalysisUuid = customAnalysisUuid;
      deleteCustomAnalysis.status = 'loading';

      try {
        await customAnalysisApi.delete({
          projectUuid: projectUuid.value,
          customAnalysisUuid,
        });

        customAnalysis.data = customAnalysis.data.filter(
          (item) => item.uuid !== customAnalysisUuid,
        );
        deleteCustomAnalysis.status = 'complete';
        alertStore.add({
          type: 'informational',
          text: i18n.global.t(`${I18N_PREFIX}.delete.success.title`),
          description: i18n.global.t(
            `${I18N_PREFIX}.delete.success.description`,
          ),
        });

        return { status: 'complete' as const };
      } catch (error) {
        deleteCustomAnalysis.status = 'error';
        alertStore.add({
          type: 'error',
          text: i18n.global.t(`${I18N_PREFIX}.delete.error`),
        });
        console.error(error);

        return { status: 'error' as const };
      } finally {
        deleteCustomAnalysis.customAnalysisUuid = null;
      }
    }

    return {
      customAnalysis,
      createCustomAnalysis,
      deleteCustomAnalysis,
      fetchCustomAnalysis,
      submitCustomAnalysis,
      submitDeleteCustomAnalysis,
    };
  },
);
