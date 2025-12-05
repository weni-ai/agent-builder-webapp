<template>
  <section class="agents-team">
    <AgentBuilderHeader
      withDivider
      actionsSize="md"
      data-testid="agents-team-header"
    >
      <template #actions>
        <section class="agents-team__actions">
          <UnnnicButton
            data-testid="assign-agents-button"
            type="primary"
            @click="handleAgentsGallery"
          >
            {{ $t('router.agents_team.assign_agents') }}
          </UnnnicButton>
        </section>
      </template>
    </AgentBuilderHeader>

    <ActiveTeam data-testid="active-team" />

    <AgentsGalleryModal data-testid="agents-gallery-modal" />
  </section>
</template>

<script setup>
import AgentBuilderHeader from '@/components/Header.vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import ActiveTeam from './ActiveTeam.vue';
import AgentsGalleryModal from './AgentsGalleryModal.vue';

const handleAgentsGallery = () => {
  useAgentsTeamStore().isAgentsGalleryOpen = true;
};
</script>

<style lang="scss" scoped>
section.agents-team {
  display: grid;
  grid-template-rows: auto auto 1fr;
  height: 100%;

  .agents-team__actions {
    display: grid;
  }
}
</style>
