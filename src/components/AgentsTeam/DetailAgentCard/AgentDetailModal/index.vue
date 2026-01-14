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

      <section
        class="agent-detail-modal__details"
        data-testid="agent-detail-details"
      >
        <Section
          data-testid="agent-detail-about-section"
          :title="$t('agents.assigned_agents.agent_details.about')"
          :description="agent.description"
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
import { AgentGroupOrAgent } from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import Section from './Section.vue';
import ViewOptions from './ViewOptions.vue';

const emit = defineEmits(['update:open']);

defineProps<{
  agent: AgentGroupOrAgent;
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
