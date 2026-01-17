import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useAlertStore } from './Alert';
import i18n from '@/utils/plugins/i18n';

import type { ManagerSelector } from './types/ManagerSelector.type';

export const useManagerSelectorStore = defineStore('ManagerSelector', () => {
  const alertStore = useAlertStore();

  const options = ref<ManagerSelector['options']>({
    currentManager: '',
    serverTime: '',
    managers: {
      new: {
        id: '',
        label: '',
      },
      legacy: {
        id: '',
        label: '',
        deprecation: '',
      },
    },
  });
  const status = ref<ManagerSelector['status']>('idle');
  const selectedManager = ref<ManagerSelector['selectedManager']>('');

  const shouldUpgradeManager = computed(() => {
    const { currentManager, managers } = options.value;
    if (!currentManager || !managers?.new?.id) {
      return false;
    }

    return currentManager !== managers.new.id;
  });

  const legacyDeprecationDate = computed(
    () => options.value.managers.legacy.deprecation || null,
  );

  const isLegacyDeprecated = computed(() => {
    const { serverTime } = options.value;
    if (!legacyDeprecationDate.value || !serverTime) {
      return false;
    }

    return new Date(serverTime) >= new Date(legacyDeprecationDate.value);
  });

  async function loadManagerData() {
    if (['loading', 'success'].includes(status.value)) {
      return;
    }

    try {
      status.value = 'loading';

      const { data } = await nexusaiAPI.router.tunings.manager.read();

      options.value = data;
      selectedManager.value = data.currentManager;
      status.value = 'success';
    } catch {
      status.value = 'error';
      alertStore.add({
        text: i18n.global.t('agent_builder.tunings.manager.load_error'),
        type: 'error',
      });
    }
  }

  function setSelectedManager(managerId: string) {
    selectedManager.value = managerId;
  }

  return {
    options,
    selectedManager,
    status,
    shouldUpgradeManager,
    legacyDeprecationDate,
    isLegacyDeprecated,
    loadManagerData,
    setSelectedManager,
  };
});
