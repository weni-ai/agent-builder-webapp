<template>
  <section
    class="settings-agents-team"
    data-testid="settings-agents-team"
  >
    <AgentsPreview data-testid="agents-preview" />

    <VoiceSettings data-testid="voice-settings" />

    <HumanSupport data-testid="human-support" />
  </section>
</template>

<script setup>
import AgentsPreview from './AgentsPreview.vue';
import VoiceSettings from './VoiceSettings.vue';
import HumanSupport from './HumanSupport.vue';
</script>

<style lang="scss" scoped>
.settings-agents-team {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
