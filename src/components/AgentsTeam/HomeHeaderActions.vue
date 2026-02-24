<template>
  <UnnnicButton
    v-if="canAssignAgents"
    data-testid="assign-agents-button"
    type="primary"
    iconLeft="add"
    :text="$t('agents.assign_agents_button')"
    @click="agentsTeamStore.openAgentsGallery"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

const agentsTeamStore = useAgentsTeamStore();

const canAssignAgents = computed(() => {
  const teamData = agentsTeamStore.activeTeam?.data;

  return (teamData?.agents?.length ?? 0) > 0;
});
</script>
