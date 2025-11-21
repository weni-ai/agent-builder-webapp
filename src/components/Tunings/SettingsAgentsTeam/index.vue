<template>
  <section
    class="settings-agents-team"
    data-testid="settings-agents-team"
  >
    <AgentsPreview data-testid="agents-preview" />

    <VoiceSettings
      v-if="featureFlagsStore.flags.settingsAgentVoice"
      data-testid="voice-settings"
    />

    <HumanSupport data-testid="human-support" />
  </section>
</template>

<script setup>
import AgentsPreview from './AgentsPreview.vue';
import VoiceSettings from './VoiceSettings.vue';
import HumanSupport from './HumanSupport.vue';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';

const featureFlagsStore = useFeatureFlagsStore();
</script>

<style lang="scss" scoped>
.settings-agents-team {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;

  > :not(:last-child) {
    padding-bottom: $unnnic-space-6;
    border-bottom: 1px solid $unnnic-color-border-base;
  }
}
</style>
