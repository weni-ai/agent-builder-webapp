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

      <section class="agent-detail-modal__details"></section>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import AgentIcon from '@/components/AgentsTeam/AgentIcon.vue';

defineEmits(['update:open']);

defineProps({
  agent: {
    type: Object,
    required: true,
  },
});

defineModel('open', {
  type: Boolean,
  required: true,
});
</script>

<style lang="scss" scoped>
.agent-detail-modal {
  &__header-icon {
    margin-right: $unnnic-space-2;
  }
}
</style>
