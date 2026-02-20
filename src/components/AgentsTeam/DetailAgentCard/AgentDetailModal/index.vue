<template>
  <UnnnicDialog
    class="agent-detail-modal"
    data-testid="agent-detail-dialog"
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <UnnnicDialogContent
      data-testid="agent-detail-content"
      size="large"
    >
      <AgentModalHeader
        data-testid="agent-detail-header"
        :agent="agent"
      />

      <section class="agent-detail-modal__details">
        <section class="agent-detail-modal__summary">
          <AgentDetailSection
            :title="$t('agents.assigned_agents.agent_details.about')"
            :description="agent.description"
            data-testid="agent-detail-about-section"
          />

          <SystemSection
            v-if="agent.mcp?.system"
            :system="agent.mcp.system"
          />
        </section>

        <McpSection
          v-if="agent.mcp"
          :mcp="agent.mcp"
        />

        <ViewOptions
          data-testid="agent-detail-view-options"
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
import SystemSection from './SystemSection.vue';
import AgentDetailSection from './AgentDetailSection.vue';
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

  &__summary {
    display: flex;
    gap: $unnnic-space-4;

    > * {
      max-width: 50%;
    }

    > *:only-child {
      max-width: 100%;
    }
  }
}
</style>
