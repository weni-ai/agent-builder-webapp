import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useAlertStore } from './Alert';
import i18n from '@/utils/plugins/i18n';

import type { ManagerSelector } from './types/ManagerSelector.type';

const parseDate = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(dateString);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

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

  const legacyDeprecationDate = computed(() =>
    parseDate(options.value.managers.legacy.deprecation),
  );

  const isLegacyDeprecated = computed(() => {
    const serverDate = parseDate(options.value.serverTime);
    if (!legacyDeprecationDate.value || !serverDate) {
      return false;
    }

    return serverDate >= legacyDeprecationDate.value;
  });

  const shouldShowUpgradeDisclaimer = computed(() => {
    const serverDate = parseDate(options.value.serverTime);
    const legacyDate = legacyDeprecationDate.value;

    if (!serverDate || !legacyDate) {
      return false;
    }

    const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

    const weekFromServerTime = new Date(serverDate.getTime() + WEEK_IN_MS);
    const isWithinDeprecationWindow = weekFromServerTime >= legacyDate;

    return (
      shouldUpgradeManager.value &&
      !isLegacyDeprecated.value &&
      isWithinDeprecationWindow
    );
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
    shouldShowUpgradeDisclaimer,
    loadManagerData,
    setSelectedManager,
  };
});
