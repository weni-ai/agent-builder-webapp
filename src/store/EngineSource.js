import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { cloneDeep } from 'lodash';

import { useAlertStore } from './Alert';
import { useProjectStore } from './Project';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import env from '@/utils/env';

const providersWithoutComponents = (env('PROVIDERS_WITHOUT_COMPONENTS') || '')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean);

export const useEngineSourceStore = defineStore('EngineSource', () => {
  const alertStore = useAlertStore();
  const projectUuid = computed(() => useProjectStore().uuid);

  const engineType = ref('native');
  const providers = ref([]);
  const current = ref(null);
  const selectedProviderId = ref('');
  const selectedModel = ref('');
  const credentials = ref([]);
  const status = ref('idle');
  const saveStatus = ref('idle');

  const initialSnapshot = ref(null);

  const selectedProvider = computed(() =>
    providers.value.find(
      (provider) => provider.uuid === selectedProviderId.value,
    ),
  );

  const availableModels = computed(() => selectedProvider.value?.models || []);

  const providerOptions = computed(() =>
    providers.value.map(({ label, uuid }) => ({ label, value: uuid })),
  );

  const modelOptions = computed(() =>
    availableModels.value.map((model) => ({ label: model, value: model })),
  );

  const isValid = computed(() => {
    if (engineType.value === 'native') return true;

    return (
      !!selectedProviderId.value &&
      !!selectedModel.value &&
      credentials.value.every((credential) => !!credential.value)
    );
  });

  const hasChanges = computed(() => {
    if (!initialSnapshot.value) return false;

    const currentState = {
      engineType: engineType.value,
      selectedProviderId: selectedProviderId.value,
      selectedModel: selectedModel.value,
      credentials: credentials.value.map(({ id, value }) => ({ id, value })),
    };

    return (
      JSON.stringify(currentState) !== JSON.stringify(initialSnapshot.value)
    );
  });

  const selectedProviderAcceptsComponents = computed(() => {
    if (!selectedProvider.value) return true;
    return !providersWithoutComponents.some((name) =>
      selectedProvider.value.label?.includes(name),
    );
  });

  function takeSnapshot() {
    initialSnapshot.value = {
      engineType: engineType.value,
      selectedProviderId: selectedProviderId.value,
      selectedModel: selectedModel.value,
      credentials: credentials.value.map(({ id, value }) => ({ id, value })),
    };
  }

  function setEngineType(type) {
    engineType.value = type;
  }

  function setProvider(providerId) {
    selectedProviderId.value = providerId;
    selectedModel.value = '';

    const provider = providers.value.find(
      (provider) => provider.uuid === providerId,
    );
    credentials.value = cloneDeep(provider?.credentials || []);
  }

  function setModel(modelId) {
    selectedModel.value = modelId;
  }

  function updateCredential(id, value) {
    const credential = credentials.value.find(
      (credential) => credential.id === id,
    );
    if (credential) {
      credential.value = value;
    }
  }

  async function loadEngineSource() {
    if (['loading', 'success'].includes(status.value)) return;

    try {
      status.value = 'loading';

      const [{ data }, { data: sourceData }] = await Promise.all([
        nexusaiAPI.router.tunings.engine_source.read({
          projectUuid: projectUuid.value,
        }),
        nexusaiAPI.router.tunings.engine_source.readSource({
          projectUuid: projectUuid.value,
        }),
      ]);

      providers.value = data.providers;
      current.value = data.current;

      engineType.value =
        sourceData.engine_source === 'OWN' ? 'custom' : 'native';

      if (data.current) {
        selectedProviderId.value = data.current.uuid;
        selectedModel.value = data.current.model;
        credentials.value = cloneDeep(data.current.credentials || []);
      }

      takeSnapshot();
      status.value = 'success';
    } catch {
      status.value = 'error';
      alertStore.add({
        text: i18n.global.t('agent_builder.tunings.engine_source.load_error'),
        type: 'error',
      });
    }
  }

  async function saveEngineSource() {
    try {
      saveStatus.value = 'loading';

      if (engineType.value === 'native') {
        await nexusaiAPI.router.tunings.engine_source.delete({
          projectUuid: projectUuid.value,
        });
      } else {
        const payload = {
          provider_uuid: selectedProviderId.value,
          model: selectedModel.value,
          credentials: credentials.value.map(({ id, value }) => ({
            id,
            value,
          })),
        };

        await nexusaiAPI.router.tunings.engine_source.edit({
          projectUuid: projectUuid.value,
          payload,
        });
      }

      takeSnapshot();
      saveStatus.value = 'success';
      return true;
    } catch {
      saveStatus.value = 'error';
      return false;
    }
  }

  return {
    engineType,
    providers,
    current,
    selectedProviderId,
    selectedModel,
    credentials,
    status,
    saveStatus,
    selectedProvider,
    availableModels,
    providerOptions,
    modelOptions,
    isValid,
    hasChanges,
    selectedProviderAcceptsComponents,
    setEngineType,
    setProvider,
    setModel,
    updateCredential,
    loadEngineSource,
    saveEngineSource,
  };
});
