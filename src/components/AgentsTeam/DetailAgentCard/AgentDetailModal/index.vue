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
          v-if="(props.agent as Agent).mcp"
          :mcp="agentMcp"
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
import { computed } from 'vue';

import {
  Agent,
  AgentAssignedMCP,
  AgentGroupOrAgent,
} from '@/store/types/Agents.types';

import AgentModalHeader from '@/components/AgentsTeam/AgentModalHeader.vue';
import McpSection from './McpSection.vue';
import Section from './Section.vue';
import ViewOptions from './ViewOptions.vue';

const props = defineProps<{
  agent: AgentGroupOrAgent;
}>();

const emit = defineEmits(['update:open']);

defineModel('open', {
  type: Boolean,
  required: true,
});

const agentMcp = computed<AgentAssignedMCP | null>(
  () => (props.agent as Agent)?.mcp,
);

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
