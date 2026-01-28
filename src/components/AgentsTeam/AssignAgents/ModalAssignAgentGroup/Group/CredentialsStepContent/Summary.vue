<template>
  <section
    :class="[
      'modal-assign-agent__third-step-summary',
      { 'modal-assign-agent__third-step-summary--no-system': !selectedSystem },
    ]"
    data-testid="concierge-summary"
  >
    <article
      v-if="selectedSystem"
      class="modal-assign-agent__summary-card"
      data-testid="concierge-summary-system-card"
    >
      <p class="modal-assign-agent__summary-card-title">
        {{ $t('agents.assign_agents.setup.third_step.system_card_title') }}
      </p>

      <Skill
        class="modal-assign-agent__summary-card-skill"
        :title="systemName"
        :icon="systemIcon"
        data-testid="concierge-summary-system-skill"
      />
    </article>

    <article
      class="modal-assign-agent__summary-card"
      data-testid="concierge-summary-mcp-card"
    >
      <p class="modal-assign-agent__summary-card-title">
        {{ $t('agents.assign_agents.setup.third_step.mcp_card_title') }}
      </p>

      <section class="modal-assign-agent__summary-mcp-details">
        <p
          class="modal-assign-agent__summary-mcp-name"
          data-testid="concierge-summary-mcp-name"
        >
          {{ selectedMCP.name }}
        </p>

        <p
          class="modal-assign-agent__summary-mcp-description"
          data-testid="concierge-summary-mcp-description"
        >
          {{ selectedMCP.description }}
        </p>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import useAgentSystems from '@/composables/useAgentSystems';
import { AgentMCP } from '@/store/types/Agents.types';

import Skill from '@/components/AgentsTeam/Skill.vue';

const props = defineProps<{
  selectedSystem?: string;
  selectedMCP: AgentMCP | null;
}>();

const { getSystemObject } = useAgentSystems();

const systemInfo = computed(() => {
  if (!props.selectedSystem) return null;
  return getSystemObject(props.selectedSystem);
});

const systemName = computed(() => {
  if (!props.selectedSystem) return '';
  return systemInfo.value?.name || props.selectedSystem;
});
const systemIcon = computed(() => systemInfo.value?.icon || '');
</script>

<style scoped lang="scss">
.modal-assign-agent__third-step-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;

  &--no-system {
    grid-template-columns: 1fr;
  }
}

.modal-assign-agent__summary {
  &-card {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;

    padding: $unnnic-space-4;

    border: 1px solid $unnnic-color-border-soft;
    background-color: $unnnic-color-bg-base;

    &:first-of-type {
      border-top-left-radius: $unnnic-radius-2;
      border-bottom-left-radius: $unnnic-radius-2;
    }

    &:last-of-type {
      border-top-right-radius: $unnnic-radius-2;
      border-bottom-right-radius: $unnnic-radius-2;
    }

    :not(:last-of-type) {
      border-right: none;
    }

    &-title {
      color: $unnnic-color-fg-emphasized;
      font: $unnnic-font-action;
    }

    &-skill {
      width: fit-content;
    }
  }

  &-mcp {
    &-name {
      color: $unnnic-color-fg-base;
      font: $unnnic-font-emphasis;
    }

    &-details {
      display: flex;
      flex-direction: column;
    }

    &-description {
      color: $unnnic-color-fg-muted;
      font: $unnnic-font-caption-1;
    }
  }
}
</style>
