<template>
  <section class="assigned-agents">
    <h2
      class="assigned-agents__title"
      data-testid="assigned-agents-title"
    >
      {{ $t('agents.assigned_agents.title') }}
    </h2>

    <section
      v-if="isLoadingTeam || activeTeam.length"
      class="assigned-agents__cards"
    >
      <template v-if="isLoadingTeam">
        <AssignAgentCard
          v-for="(_, index) in Array(6)"
          :key="index"
          loading
          data-testid="loading-card"
        />
      </template>

      <template v-else>
        <component
          :is="agentCard"
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
        data-testid="assigned-agents-icon"
      />

      <section class="assigned-agents__empty-content">
        <h3
          class="assigned-agents__empty-title"
          data-testid="assigned-agents-empty-title"
        >
          {{ $t('agents.assigned_agents.no_agents.title') }}
        </h3>

        <p
          class="assigned-agents__empty-description"
          data-testid="assigned-agents-empty-description"
        >
          {{ $t('agents.assigned_agents.no_agents.description') }}
        </p>
      </section>

      <UnnnicButton
        class="assigned-agents__empty-button"
        :text="$t('agents.assigned_agents.no_agents.assign_agents_button')"
        type="primary"
        data-testid="assigned-agents-empty-button"
        @click="agentsTeamStore.openAgentsGallery"
      />
    </section>
  </section>

  <AgentsGalleryModal data-testid="agents-gallery-modal" />
</template>

<script setup>
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';

import AssignAgentCard from '@/components/AgentsTeam/AssignAgentCard.vue';
import DetailAgentCard from '@/components/AgentsTeam/DetailAgentCard/index.vue';
import AgentsGalleryModal from '@/views/AgentsTeam/AgentsGalleryModal.vue';

const agentsTeamStore = useAgentsTeamStore();
const activeTeam = computed(
  () => agentsTeamStore.activeTeam.data?.agents || [],
);
const isLoadingTeam = computed(
  () => agentsTeamStore.activeTeam.status === 'loading',
);

const featureFlagsStore = useFeatureFlagsStore();

const agentCard = computed(() =>
  featureFlagsStore.flags.assignAgentsView ? DetailAgentCard : AssignAgentCard,
);
</script>

<style lang="scss" scoped>
.assigned-agents {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__empty {
    height: 100%;

    padding: $unnnic-space-6 $unnnic-space-4;

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
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: $unnnic-space-4;
  }
}
</style>
