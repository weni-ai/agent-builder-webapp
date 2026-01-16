<template>
  <UnnnicDialog
    class="agent-detail-modal"
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <UnnnicDialogContent size="large">
      <AgentModalHeader :agent="agent" />

      <section class="agent-detail-modal__details">
        <Section
          :title="$t('agents.assigned_agents.agent_details.about')"
          :description="agent.description"
        />

        <ViewOptions
          :agent="agent"
          @agent-removed="handleAgentRemoved"
        />
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { ActiveTeamAgent } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import Section from './Section.vue';
import ViewOptions from './ViewOptions.vue';

const emit = defineEmits(['update:open']);

defineProps<{
  agent: ActiveTeamAgent;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});

function handleAgentRemoved() {
  emit('update:open', false);
}
</script>

<style lang="scss" scoped>
.agent-detail-modal {
  &__details {
    padding: $unnnic-space-6;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
