<template>
  <section class="assigned-agents">
    <section
      v-if="isLoadingTeam || activeTeam.length"
      class="assigned-agents__cards"
    >
      <template v-if="isLoadingTeam">
        <AssignAgentCard
          v-for="(_, index) in Array(3)"
          :key="index"
          loading
          data-testid="loading-card"
        />
      </template>

      <template v-else>
        <AssignAgentCard
          v-for="agent in activeTeam"
          :key="agent.uuid"
          :agent="agent"
          :assignment="false"
          data-testid="team-card"
        />
      </template>
    </section>

    <section
      v-if="!isLoadingTeam && activeTeam.length === 0"
      class="assigned-agents__empty"
      data-testid="empty-state"
    >
      <UnnnicIcon
        class="assigned-agents__empty-icon"
        size="xl"
        scheme="neutral-soft"
        icon="workspaces"
        filled
      />

      <section class="assigned-agents__empty-content">
        <h3 class="assigned-agents__empty-title">
          {{ $t('agents.assigned_agents.no_agents.title') }}
        </h3>

        <p class="assigned-agents__empty-description">
          {{ $t('agents.assigned_agents.no_agents.description') }}
        </p>
      </section>

      <UnnnicButton
        class="assigned-agents__empty-button"
        :text="$t('agents.assigned_agents.no_agents.assign_agents_button')"
        type="primary"
        @click="handleAgentsGallery"
      />
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AssignAgentCard from '@/components/AgentsTeam/AssignAgentCard.vue';

const agentsTeamStore = useAgentsTeamStore();
const activeTeam = computed(
  () => agentsTeamStore.activeTeam.data?.agents || [],
);

const isLoadingTeam = computed(
  () => agentsTeamStore.activeTeam.status === 'loading',
);

function handleAgentsGallery() {
  agentsTeamStore.isAgentsGalleryOpen = true;
}
</script>

<style lang="scss" scoped>
.assigned-agents {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__empty {
    height: 100%;

    padding: $unnnic-spacing-xl $unnnic-spacing-sm;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    align-items: center;
    justify-content: center;

    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: $unnnic-space-2;
    }

    &-title {
      color: $unnnic-color-fg-emphasized;
      font: $unnnic-font-display-3;
    }

    &-description {
      color: $unnnic-color-fg-base;
      font: $unnnic-font-body;
    }

    &-button {
      width: 250px;
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;
  }
}
</style>
