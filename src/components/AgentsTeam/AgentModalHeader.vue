<template>
  <UnnnicDialogHeader>
    <AgentIcon
      class="agent-modal-header__icon"
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
</template>

<script setup lang="ts">
import AgentIcon from '@/components/AgentsTeam/AgentIcon.vue';
import { AgentGroup } from '@/store/types/Agents.types';

defineProps<{
  agent: AgentGroup;
}>();
</script>

<style lang="scss" scoped>
.agent-modal-header {
  &__icon {
    margin-right: $unnnic-space-2;
    padding: 6px;

    width: 48px;
    height: auto;
    aspect-ratio: 1/1;
  }
}
</style>
