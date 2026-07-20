import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { useAlertStore } from './Alert';
import { useProjectStore } from './Project';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';

function mapCategoriesToTopics(categories = []) {
  return categories.map(({ slug, blocked }) => ({
    id: slug,
    enabled: blocked,
  }));
}

export const useGuardrailsConfigStore = defineStore('GuardrailsConfig', () => {
  const projectUuid = computed(() => useProjectStore().uuid);
  const alertStore = useAlertStore();

  const categories = ref([]);
  const topics = ref([]);
  const blockingMessage = ref('');
  const blockingMessageIsCustom = ref(false);
  const writable = ref(false);
  const status = ref(null);

  const isLoading = computed(() => status.value === 'loading');
  const isSaving = computed(() => status.value === 'saving');

  function setConfig(data) {
    categories.value = data.categories || [];
    topics.value = mapCategoriesToTopics(data.categories);
    blockingMessage.value = data.blocking_message || '';
    blockingMessageIsCustom.value = Boolean(data.blocking_message_is_custom);
    writable.value = Boolean(data.writable);
  }

  async function fetchConfig() {
    status.value = 'loading';

    try {
      const { data } = await nexusaiAPI.router.guardrails_config.read({
        projectUuid: projectUuid.value,
      });

      setConfig(data);
      status.value = 'success';
      return data;
    } catch (error) {
      status.value = 'error';
      console.error(error);
      throw error;
    }
  }

  /**
   * @param {{
   *   categoryStates?: Record<string, boolean>,
   *   blockingMessage?: string,
   * }} params
   */
  async function updateConfig({
    categoryStates,
    blockingMessage: nextBlockingMessage,
  } = {}) {
    status.value = 'saving';

    const payload = {};

    if (categoryStates) {
      payload.category_states = categoryStates;
    }

    if (typeof nextBlockingMessage === 'string') {
      payload.blocking_message = nextBlockingMessage;
    }

    try {
      const { data } = await nexusaiAPI.router.guardrails_config.update({
        projectUuid: projectUuid.value,
        payload,
      });

      setConfig(data);
      status.value = 'success';

      alertStore.add({
        type: 'success',
        text: i18n.global.t(
          'agents.instructions.safety_guardrails.save_success',
        ),
      });

      return data;
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
    categories,
    topics,
    blockingMessage,
    blockingMessageIsCustom,
    writable,
    status,
    isLoading,
    isSaving,
    fetchConfig,
    updateConfig,
    buildCategoryStatesDiff,
    mapCategoriesToTopics,
  };
});
