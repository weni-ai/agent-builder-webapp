<template>
  <section
    class="settings-agents-team"
    data-testid="settings-agents-team"
  >
    <ManagerDisclaimers data-testid="manager-disclaimers" />

    <EngineSource data-testid="engine-source" />

    <ManagerSelector
      v-if="engineSourceStore.engineType === 'native'"
      class="settings-agents-team__section--with-divider"
      data-testid="manager-selector"
    />

    <CustomModelConfig
      v-else
      class="settings-agents-team__section--with-divider"
      data-testid="custom-model-config"
    />

    <UnnnicDisclaimer
      v-if="showProviderComponentsDisclaimer"
      type="neutral"
      :description="
        $t('agent_builder.tunings.engine_source.no_components_support', {
          provider_name: engineSourceStore.selectedProvider?.label,
        })
      "
      data-testid="provider-no-components-disclaimer"
    />

    <AgentsPreview
      data-testid="agents-preview"
      :class="{
        'settings-agents-team__section--with-divider': hasAgentVoice,
      }"
    />

    <VoiceSettings
      v-if="hasAgentVoice"
      data-testid="voice-settings"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import AgentsPreview from './AgentsPreview.vue';
import VoiceSettings from './VoiceSettings.vue';
import ManagerSelector from './ManagerSelector/index.vue';
import ManagerDisclaimers from './ManagerDisclaimers.vue';
import EngineSource from './EngineSource/index.vue';
import CustomModelConfig from './CustomModelConfig/index.vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { useEngineSourceStore } from '@/store/EngineSource';

const featureFlagsStore = useFeatureFlagsStore();
const engineSourceStore = useEngineSourceStore();

const hasAgentVoice = computed(
  () => featureFlagsStore.flags.settingsAgentVoice,
);

const showProviderComponentsDisclaimer = computed(
  () =>
    engineSourceStore.engineType === 'custom' &&
    !engineSourceStore.selectedProviderAcceptsComponents,
);
</script>

<style lang="scss" scoped>
.settings-agents-team {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  &__section--with-divider {
    padding-bottom: $unnnic-space-6;
    border-bottom: 1px solid $unnnic-color-border-base;
  }
}
</style>
