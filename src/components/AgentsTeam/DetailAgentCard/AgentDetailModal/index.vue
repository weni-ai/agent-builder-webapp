<template>
  <UnnnicDialog
    class="agent-detail-modal"
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader>
        <AgentIcon
          class="agent-detail-modal__header-icon"
          :icon="agent.icon"
          data-testid="agent-icon"
        />

        <UnnnicDialogTitle>{{ agent.name }}</UnnnicDialogTitle>

        <UnnnicTag
          class="agent-card__tag"
          :text="
            agent.is_official
              ? $t('router.agents_team.card.official')
              : $t('router.agents_team.card.custom')
          "
          :scheme="agent.is_official ? 'teal' : 'purple'"
          data-testid="agent-tag"
        />
      </UnnnicDialogHeader>

      <section class="agent-detail-modal__details">
        <Section
          :title="$t('agents.assigned_agents.agent_details.about')"
          :description="agent.description"
        />
      </section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import AgentIcon from '@/components/AgentsTeam/AgentIcon.vue';
import { AgentGroupOrAgent } from '@/store/types/Agents.types';

import Section from './Section.vue';

defineEmits(['update:open']);

defineProps<{
  agent: AgentGroupOrAgent;
}>();

defineModel('open', {
  type: Boolean,
  required: true,
});
</script>

<style lang="scss" scoped>
.agent-detail-modal {
  &__header-icon {
    margin-right: $unnnic-space-2;

    width: $unnnic-icon-size-xl;
    height: auto;
    aspect-ratio: 1/1;
  }

  &__details {
    padding: $unnnic-space-6;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
