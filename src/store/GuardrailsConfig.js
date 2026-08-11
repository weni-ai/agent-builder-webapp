import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { useAlertStore } from './Alert';
import { useProjectStore } from './Project';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

export const useGuardrailsConfigStore = defineStore('GuardrailsConfig', () => {
  const projectUuid = computed(() => useProjectStore().uuid);
  const alertStore = useAlertStore();

  const topics = ref([]);
  const blockingMessage = ref('');
  const writable = ref(false);
  const promptInjectionEnabled = ref(false);
  const status = ref(null);

  const isLoading = computed(() => status.value === 'loading');
  const isSaving = computed(() => status.value === 'saving');

  function setConfig(config) {
    topics.value = config.topics || [];
    blockingMessage.value = config.blockingMessage || '';
    writable.value = Boolean(config.writable);
  }

  async function fetchConfig() {
    status.value = 'loading';

    try {
      const [config, filter] = await Promise.all([
        nexusaiAPI.router.guardrails_config.read({
          projectUuid: projectUuid.value,
        }),
        nexusaiAPI.router.prompt_injection_filter.read({
          projectUuid: projectUuid.value,
        }),
      ]);

      setConfig(config);
      promptInjectionEnabled.value = filter.enabled;
      status.value = 'success';
      return config;
    } catch (error) {
      status.value = 'error';
      console.error(error);
      throw error;
    }
  }

  async function saveGuardrailsConfig({
    categoryStates,
    blockingMessage: nextBlockingMessage,
  }) {
    const data = {};

    if (categoryStates) data.categoryStates = categoryStates;
    if (typeof nextBlockingMessage === 'string') {
      data.blockingMessage = nextBlockingMessage;
    }

    if (Object.keys(data).length === 0) return;

    setConfig(
      await nexusaiAPI.router.guardrails_config.update({
        projectUuid: projectUuid.value,
        data,
      }),
    );
  }

  async function savePromptInjectionFilter(enabled) {
    if (typeof enabled !== 'boolean') return;

    const filter = await nexusaiAPI.router.prompt_injection_filter.update({
      projectUuid: projectUuid.value,
      data: { enabled },
    });

    promptInjectionEnabled.value = filter.enabled;
  }

  /**
   * @param {{
   *   categoryStates?: Record<string, boolean>,
   *   blockingMessage?: string,
   *   promptInjectionEnabled?: boolean,
   * }} params
   */
  async function updateConfig({
    categoryStates,
    blockingMessage: nextBlockingMessage,
    promptInjectionEnabled: enabled,
  } = {}) {
    status.value = 'saving';

    try {
      await Promise.all([
        saveGuardrailsConfig({
          categoryStates,
          blockingMessage: nextBlockingMessage,
        }),
        savePromptInjectionFilter(enabled),
      ]);

      status.value = 'success';

      alertStore.add({
        type: 'success',
        text: i18n.global.t(
          'agents.instructions.safety_guardrails.save_success',
        ),
      });
    } catch (error) {
      status.value = 'error';

      alertStore.add({
        type: 'error',
        text: i18n.global.t('agents.instructions.safety_guardrails.save_error'),
      });

      throw error;
    }
  }

  function buildCategoryStatesDiff(draftTopics, snapshotTopics) {
    const snapshotById = new Map(
      snapshotTopics.map((topic) => [topic.id, topic.enabled]),
    );

    const categoryStates = {};

    draftTopics.forEach((topic) => {
      const previousEnabled = snapshotById.get(topic.id);

      if (previousEnabled === topic.enabled) return;

      categoryStates[topic.id] = topic.enabled;
    });

    return categoryStates;
  }

  return {
    topics,
    blockingMessage,
    writable,
    promptInjectionEnabled,
    status,
    isLoading,
    isSaving,
    fetchConfig,
    updateConfig,
    buildCategoryStatesDiff,
  };
});
