<template>
  <UnnnicButton
    data-testid="assign-agents-button"
    type="primary"
    iconLeft="add"
    :text="$t('agents.assign_agents_button')"
    @click="agentsTeamStore.openAgentsGallery"
  />
</template>

<script setup lang="ts">
import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();
</script>
