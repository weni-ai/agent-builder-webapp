<template>
  <section class="modal-assign-agent__third-step">
    <header class="modal-assign-agent__third-step-header">
      <p class="modal-assign-agent__third-step-title">
        {{ $t('agents.assign_agents.setup.third_step.title') }}
      </p>

      <p class="modal-assign-agent__third-step-description">
        {{ $t('agents.assign_agents.setup.third_step.description') }}
      </p>
    </header>

    <Summary
      :selectedSystem="selectedSystem"
      :selectedMCP="selectedMCP"
    />

    <Credentials :credentials="selectedMCP?.credentials" />
  </section>
</template>

<script setup lang="ts">
import Summary from './Summary.vue';
import Credentials from './Credentials.vue';

import { AgentMCP, AgentSystem } from '@/store/types/Agents.types';

defineProps<{
  selectedSystem?: AgentSystem | '';
  selectedMCP: AgentMCP | null;
}>();
</script>

<style scoped lang="scss">
.modal-assign-agent__third-step {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  padding: $unnnic-space-6;
}

.modal-assign-agent__third-step-header {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;
}

.modal-assign-agent__third-step-title {
  color: $unnnic-color-fg-emphasized;
  font: $unnnic-font-display-3;
}

.modal-assign-agent__third-step-description {
  color: $unnnic-color-fg-base;
  font: $unnnic-font-body;
}
</style>
