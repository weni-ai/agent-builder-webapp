import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import { useProjectStore } from './Project';

import nexusaiAPI from '@/api/nexusaiAPI';
import { useAlertStore } from './Alert';
import i18n from '@/utils/plugins/i18n';
import { moduleStorage } from '@/utils/storage';

import type { ManagerSelector } from './types/ManagerSelector.type';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const POST_UPGRADE_DISCLAIMER_STORAGE_KEY =
  'manager-selector-post-upgrade-disclaimer';

const parseDate = (dateString?: string | null): Date | null => {
  if (!dateString) {
    return null;
  }

  const parsedDate = new Date(dateString);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const useManagerSelectorStore = defineStore('ManagerSelector', () => {
  const alertStore = useAlertStore();
  const projectUuid = useProjectStore().uuid;

  const options = ref<ManagerSelector['options']>({
    currentManager: '',
    serverTime: '',
    managers: {
      new: {
        id: '',
        label: '',
      },
      legacy: null,
    },
  });
  const status = ref<ManagerSelector['status']>('idle');
  const saveStatus = ref<ManagerSelector['status']>('idle');
  const selectedManager = ref<ManagerSelector['selectedManager']>('');
  const selectedPreviewManager = ref<ManagerSelector['selectedManager']>('');
  const postUpgradeDisclaimerVisible = ref(false);

  const shouldUpgradeManager = computed(() => {
    const { currentManager, managers } = options.value;
    if (!currentManager || !managers?.new?.id) {
      return false;
    }

    return currentManager !== managers.new.id;
  });

  const legacyDeprecationDate = computed(() =>
    parseDate(options.value.managers.legacy?.deprecation),
  );

  const isLegacyDeprecated = computed(() => {
    const serverDate = parseDate(options.value.serverTime);
    if (!legacyDeprecationDate.value || !serverDate) {
      return false;
    }

    return serverDate >= legacyDeprecationDate.value;
  });

  const isPostUpgradeScenario = computed(() => {
    const { currentManager, managers } = options.value;
    return currentManager === managers.new.id && isLegacyDeprecated.value;
  });

  const writePostUpgradeDisclaimerFlag = (value: boolean) =>
    moduleStorage.setItem(POST_UPGRADE_DISCLAIMER_STORAGE_KEY, value);

  const ensurePostUpgradeDisclaimerFlag = () => {
    const storedValue = moduleStorage.getItem(
      POST_UPGRADE_DISCLAIMER_STORAGE_KEY,
    );

    if (storedValue === null && isPostUpgradeScenario.value) {
      writePostUpgradeDisclaimerFlag(true);
      return true;
    }

    return storedValue === true;
  };

  const activatePostUpgradeDisclaimerIfNeeded = () => {
    if (!isPostUpgradeScenario.value || postUpgradeDisclaimerVisible.value) {
      return;
    }

    if (ensurePostUpgradeDisclaimerFlag()) {
      postUpgradeDisclaimerVisible.value = true;
      writePostUpgradeDisclaimerFlag(false);
    }
  };

  const resetPostUpgradeDisclaimerSession = () => {
    postUpgradeDisclaimerVisible.value = false;
  };

  watch(
    isPostUpgradeScenario,
    (isScenario) => {
      if (!isScenario) {
        resetPostUpgradeDisclaimerSession();
        return;
      }

      activatePostUpgradeDisclaimerIfNeeded();
    },
    { immediate: true },
  );

  const shouldShowPostUpgradeDisclaimer = computed(
    () => postUpgradeDisclaimerVisible.value,
  );

  const shouldShowUpgradeDisclaimer = computed(() => {
    const serverDate = parseDate(options.value.serverTime);
    const legacyDate = legacyDeprecationDate.value;

    if (!serverDate || !legacyDate) {
      return false;
    }

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

      const { data } = await nexusaiAPI.router.tunings.manager.read({
        projectUuid,
      });

      options.value = data;
      selectedManager.value = data.currentManager;
      selectedPreviewManager.value = data.currentManager;
      status.value = 'success';
    } catch {
      status.value = 'error';
      alertStore.add({
        text: i18n.global.t('agent_builder.tunings.manager.load_error'),
        type: 'error',
      });
    }
  }

  async function saveManager() {
    try {
      saveStatus.value = 'loading';

      await nexusaiAPI.router.tunings.manager.edit({
        projectUuid,
        manager: selectedManager.value,
      });

      options.value.currentManager = selectedManager.value;
      saveStatus.value = 'success';

      return true;
    } catch {
      saveStatus.value = 'error';
      return false;
    }
  }

  function setSelectedManager(managerId: string) {
    selectedManager.value = managerId;
  }

  return {
    options,
    selectedManager,
    status,
    saveStatus,
    shouldUpgradeManager,
    legacyDeprecationDate,
    isLegacyDeprecated,
    shouldShowUpgradeDisclaimer,
    shouldShowPostUpgradeDisclaimer,
    selectedPreviewManager,
    loadManagerData,
    saveManager,
    setSelectedManager,
    resetPostUpgradeDisclaimerSession,
  };
});
