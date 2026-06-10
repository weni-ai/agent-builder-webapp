import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { useProjectStore } from './Project';

import nexusaiAPI from '@/api/nexusaiAPI';
import env from '@/utils/env';

export const useFeatureFlagsStore = defineStore('FeatureFlags', () => {
  const currentProjectUuid = computed(() => useProjectStore().uuid || '');

  const activeFeatures = ref([]);
  const isLoadingFeatureFlags = ref(false);

  const getListAtEnv = (key) => {
    return env(key)?.split(',') || [];
  };

  const isProjectEnabledForFlag = (flagKey) => {
    const projectList = getListAtEnv(flagKey);
    return projectList.includes(currentProjectUuid.value);
  };

  const isFeatureFlagEnabled = (flagName) => {
    return activeFeatures.value.includes(flagName);
  };

  async function getFeatureFlags() {
    try {
      isLoadingFeatureFlags.value = true;

      const { data } = await nexusaiAPI.feature_flags.read({
        projectUuid: currentProjectUuid.value,
      });

      activeFeatures.value = data.active_features || [];
    } catch (error) {
      console.error('Error getting feature flags', error);
      activeFeatures.value = [];
    } finally {
      isLoadingFeatureFlags.value = false;
    }
  }

  const flags = computed(() => ({
    supervisorExport: isProjectEnabledForFlag('FF_SUPERVISOR_EXPORT'),
    settingsAgentVoice: isFeatureFlagEnabled('settings_agent_voice'),
  }));

  return {
    flags,
    activeFeatures,
    isLoadingFeatureFlags,
    getFeatureFlags,
    isFeatureFlagEnabled,
  };
});
