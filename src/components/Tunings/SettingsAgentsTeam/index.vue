<template>
  <section
    class="settings-agents-team"
    data-testid="settings-agents-team"
  >
    <AgentsPreview
      v-if="showAgentsPreview"
      data-testid="agents-preview"
    />

    <HumanSupport data-testid="human-support" />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useProjectStore } from '@/store/Project';

import AgentsPreview from './AgentsPreview.vue';
import HumanSupport from './HumanSupport.vue';

const showAgentsPreview = computed(() => {
  return !useProjectStore().details?.backend?.toLowerCase().includes('openai');
});
</script>

<style lang="scss" scoped>
.settings-agents-team {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
