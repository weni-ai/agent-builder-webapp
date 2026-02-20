import { defineStore } from 'pinia';
import { computed, inject, watch } from 'vue';

import { useProjectStore } from './Project';

import { gbKey } from '../utils/Growthbook';
import env from '@/utils/env';

export const useFeatureFlagsStore = defineStore('FeatureFlags', () => {
  const growthbook = inject(gbKey);

  const currentProjectUuid = computed(() => useProjectStore().uuid || '');

  const getListAtEnv = (key) => {
    return env(key)?.split(',') || [];
  };

  const isProjectEnabledForFlag = (flagKey) => {
    const projectList = getListAtEnv(flagKey);
    return projectList.includes(currentProjectUuid.value);
  };

  const flags = computed(() => ({
    supervisorExport: isProjectEnabledForFlag('FF_SUPERVISOR_EXPORT'),
    settingsAgentVoice: growthbook?.isOn('settings_agent_voice'),
    assignAgentsView: growthbook?.isOn('assign_agents_view'),
  }));

  watch(
    currentProjectUuid,
    (newProjectUuid) => {
      if (newProjectUuid && growthbook) {
        growthbook.setAttributes({
          ...growthbook.getAttributes(),
          weni_project: newProjectUuid,
        });
      }
    },
    { immediate: true },
  );

  return {
    flags,
  };
});
