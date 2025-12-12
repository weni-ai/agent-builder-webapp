<template>
  <section
    class="agent-detail-modal__view-options"
    data-testid="agent-view-options"
  >
    <button
      class="agent-detail-modal__view-options-trigger"
      :aria-expanded="isExpanded"
      @click="toggleExpanded"
    >
      <UnnnicIcon
        :class="[
          'agent-detail-modal__view-options-icon',
          { 'agent-detail-modal__view-options-icon--expanded': isExpanded },
        ]"
        icon="keyboard_arrow_right"
        size="ant"
        scheme="fg-emphasized"
      />

      <p class="agent-detail-modal__view-options-label">
        {{ $t('agents.assigned_agents.agent_details.view_options') }}
      </p>
    </button>

    <section
      v-if="isExpanded"
      :class="['agent-detail-modal__view-options-actions']"
      data-testid="agent-view-options-actions"
    >
      <UnnnicButton
        class="agent-detail-modal__view-options-action"
        :text="$t('agents.assigned_agents.agent_details.remove_agent')"
        type="warning"
        :loading="isRemovingAgent"
        @click="handleRemoveAgent"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import type { AgentGroupOrAgent } from '@/store/types/Agents.types';

const props = defineProps<{
  agent: AgentGroupOrAgent;
}>();

const emit = defineEmits<{
  (_event: 'agent-removed'): void;
}>();

const agentsTeamStore = useAgentsTeamStore();

const isExpanded = ref(false);
const isRemovingAgent = ref(false);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

async function handleRemoveAgent() {
  if (isRemovingAgent.value || !props.agent?.uuid) return;

  isRemovingAgent.value = true;

  try {
    const { status } = await agentsTeamStore.toggleAgentAssignment({
      uuid: props.agent.uuid,
      is_assigned: false,
    });

    if (status === 'success') {
      emit('agent-removed');
    }
  } finally {
    isRemovingAgent.value = false;
  }
}
</script>

<style scoped lang="scss">
.agent-detail-modal__view-options {
  padding-top: $unnnic-space-4;
  border-top: 1px solid $unnnic-color-border-soft;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;

  &-trigger {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    cursor: pointer;
  }

  &-icon {
    margin: $unnnic-space-2;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &-label {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;
  }

  &-actions {
    display: flex;
  }

  &-action {
    width: 50%;
  }
}
</style>
