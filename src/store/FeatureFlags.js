import { defineStore } from 'pinia';
import { computed, inject, nextTick, watch } from 'vue';

import { useProjectStore } from './Project';
import { useUserStore } from './User';

import { gbKey } from '../utils/Growthbook';
import env from '@/utils/env';

const USER_ATTRIBUTION_TIMEOUT_MS = 3000;

export const useFeatureFlagsStore = defineStore('FeatureFlags', () => {
  const growthbook = inject(gbKey);

  const currentProjectUuid = computed(() => useProjectStore().uuid || '');
  const currentUserEmail = computed(() => useUserStore().user.email || '');

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
    conversationsV2: growthbook?.isOn('conversations_v2'),
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

  watch(
    currentUserEmail,
    (currentUserEmail) => {
      if (currentUserEmail && growthbook) {
        growthbook.setAttributes({
          ...growthbook.getAttributes(),
          email: currentUserEmail,
        });
      }
    },
    { immediate: true },
  );

  /**
   * Returns a Promise that resolves when the user email is set in Growthbook
   * Resolves immediately if Growthbook is not available, or after a timeout
   * to avoid blocking forever when the user has no email.
   * @returns {Promise<void>}
   */
  function whenUserAttributed() {
    if (!growthbook) return Promise.resolve();

    const email = currentUserEmail.value;
    if (email) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        stopWatch();
        resolve();
      }, USER_ATTRIBUTION_TIMEOUT_MS);

      const stopWatch = watch(
        currentUserEmail,
        (newEmail) => {
          if (newEmail) {
            clearTimeout(timeoutId);
            stopWatch();
            resolve();
          }
        },
        { immediate: true },
      );
    });
  }

  return {
    flags,
    whenUserAttributed,
  };
});
