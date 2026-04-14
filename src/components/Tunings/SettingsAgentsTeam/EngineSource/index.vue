<template>
  <UnnnicRadioGroup
    state="vertical"
    :label="$t('agent_builder.tunings.engine_source.title')"
    :modelValue="engineSourceStore.engineType"
    data-testid="engine-source-radio-group"
    @update:model-value="engineSourceStore.setEngineType($event)"
  >
    <UnnnicRadio
      data-testid="engine-source-radio-native"
      :label="$t('agent_builder.tunings.engine_source.native')"
      value="native"
    />

    <UnnnicRadio
      data-testid="engine-source-radio-custom"
      :label="$t('agent_builder.tunings.engine_source.own_api_key')"
      value="custom"
    />
  </UnnnicRadioGroup>
</template>

<script setup>
import { useEngineSourceStore } from '@/store/EngineSource';

const engineSourceStore = useEngineSourceStore();
</script>
