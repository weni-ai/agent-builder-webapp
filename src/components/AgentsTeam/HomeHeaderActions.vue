<template>
  <UnnnicButton
    v-if="canAssignAgents"
    data-testid="assign-agents-button"
    type="primary"
    :text="$t('router.agents_team.assign_agents')"
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
