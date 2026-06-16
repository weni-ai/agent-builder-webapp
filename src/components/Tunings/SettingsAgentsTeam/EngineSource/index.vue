<template>
  <UnnnicRadioGroup
    state="vertical"
    class="engine-source__radio-group"
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

<style lang="scss" scoped>
.engine-source__radio-group {
  :deep(.unnnic-label__label) {
    @include unnnic-font-action;
  }
}
</style>
