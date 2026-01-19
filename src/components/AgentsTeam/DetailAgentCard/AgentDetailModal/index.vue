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

        <McpSection
          v-if="agent.mcp"
          :mcp="agent.mcp"
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
import McpSection from './McpSection.vue';
import Section from './Section.vue';
import ViewOptions from './ViewOptions.vue';

defineProps<{
  agent: ActiveTeamAgent;
}>();

const emit = defineEmits(['update:open']);

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
