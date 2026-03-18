<template>
  <section
    class="custom-model-config"
    data-testid="custom-model-config"
  >
    <UnnnicSelect
      :label="$t('agent_builder.tunings.engine_source.provider')"
      :options="engineSourceStore.providerOptions"
      :modelValue="engineSourceStore.selectedProviderId"
      data-testid="custom-model-config-provider-select"
      :optionsLines="getOptionsLines(engineSourceStore.providerOptions)"
      :placeholder="
        $t('agent_builder.tunings.engine_source.placeholder.provider')
      "
      @update:model-value="setProvider"
    />

    <UnnnicSelect
      :label="$t('agent_builder.tunings.engine_source.model')"
      :options="engineSourceStore.modelOptions"
      :modelValue="engineSourceStore.selectedModel"
      :disabled="!engineSourceStore.selectedProviderId"
      data-testid="custom-model-config-model-select"
      :optionsLines="getOptionsLines(engineSourceStore.modelOptions)"
      :placeholder="$t('agent_builder.tunings.engine_source.placeholder.model')"
      @update:model-value="setModel"
    />

    <CredentialField
      v-for="credential in engineSourceStore.credentials"
      :key="credential.id"
      :credential="credential"
      @update:value="engineSourceStore.updateCredential"
    />
  </section>
</template>

<script setup>
import { useEngineSourceStore } from '@/store/EngineSource';

import CredentialField from './CredentialField.vue';

const engineSourceStore = useEngineSourceStore();
const { setProvider, setModel } = engineSourceStore;

function getOptionsLines(options) {
  return options.length < 5 ? options.length : 5;
}
</script>

<style lang="scss" scoped>
.custom-model-config {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;
}
</style>
