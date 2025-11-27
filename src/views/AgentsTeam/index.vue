<template>
  <section class="view-agents">
    <UnnnicPageHeader
      :title="$t('agents.title')"
      :description="$t('agents.description')"
      data-testid="agents-header"
    >
      <template
        v-if="agentsTeamStore.activeTeam.data.agents.length > 0"
        #actions
      >
        <UnnnicButton
          data-testid="assign-agents-button"
          type="primary"
          @click="handleAgentsGallery"
        >
          {{ $t('router.agents_team.assign_agents') }}
        </UnnnicButton>
      </template>
    </UnnnicPageHeader>

    <AssignedAgents data-testid="assigned-agents" />

    <AgentsGalleryModal data-testid="agents-gallery-modal" />
  </section>
</template>

<script setup>
import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AssignedAgents from './AssignedAgents.vue';
import AgentsGalleryModal from './AgentsGalleryModal.vue';

const agentsTeamStore = useAgentsTeamStore();

const handleAgentsGallery = () => {
  useAgentsTeamStore().isAgentsGalleryOpen = true;
};
</script>

<style lang="scss" scoped>
section.view-agents {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-space-4;
  height: 100%;
}
</style>
