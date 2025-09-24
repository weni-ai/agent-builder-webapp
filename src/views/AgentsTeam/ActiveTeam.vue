<template>
  <section class="active-team">
    <section
      v-if="isLoadingTeam || activeTeam.length"
      class="active-team__cards"
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
      class="active-team__empty"
      data-testid="empty-state"
    >
      <UnnnicIcon
        class="empty__icon"
        size="xl"
        scheme="neutral-soft"
        icon="workspaces"
        filled
      />

      <UnnnicIntelligenceText
        tag="p"
        family="secondary"
        size="body-lg"
        color="neutral-dark"
        weight="bold"
      >
        {{ $t('router.agents_team.active_team.no_team') }}
      </UnnnicIntelligenceText>

      <section class="empty__description">
        <!-- This comment prevents from auto-capitalizing i18n-t to I18nT which would break the component -->
        <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
        <i18n-t
          class="description__text"
          keypath="router.agents_team.active_team.no_team_description"
          tag="p"
        >
          <template #assign_agents>
            <p
              class="description__assign-agents"
              data-testid="assign-agents-link"
              @click="handleAgentsGallery"
            >
              {{ $t('router.agents_team.assign_agents') }}
            </p>
          </template>
        </i18n-t>
      </section>
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
.active-team {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__empty {
    height: 100%;

    padding: $unnnic-spacing-xl $unnnic-spacing-sm;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .empty__icon {
      margin-bottom: $unnnic-spacing-ant;
      font-size: $unnnic-font-size-body-gt * 4;
    }

    .empty__description {
      display: flex;
      align-items: center;
      gap: $unnnic-spacing-nano / 2;

      .description__text {
        font-family: $unnnic-font-family-secondary;
        font-size: $unnnic-font-size-body-md;
        color: $unnnic-color-neutral-cloudy;
        display: contents;
      }

      .description__assign-agents {
        position: relative;

        font-size: $unnnic-font-size-body-md;
        color: $unnnic-color-neutral-cloudy;
        font-weight: $unnnic-font-weight-bold;

        cursor: pointer;

        &::after {
          content: '';

          position: absolute;
          bottom: 0;
          left: 0;

          width: 100%;
          height: 1px;

          background-color: $unnnic-color-neutral-cloudy;
        }
      }
    }
  }

  &__cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: $unnnic-spacing-sm;
  }
}
</style>
