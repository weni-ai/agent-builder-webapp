<template>
  <UnnnicButton
    v-if="canAssignAgents"
    data-testid="assign-agents-button"
    type="primary"
    @click="agentsTeamStore.openAgentsGallery"
  >
    {{ t('router.agents_team.assign_agents') }}
  </UnnnicButton>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import i18n from '@/utils/plugins/i18n';

const agentsTeamStore = useAgentsTeamStore();
const { t } = i18n.global;

const canAssignAgents = computed(() => {
  const teamData = agentsTeamStore.activeTeam?.data;

  return (teamData?.agents?.length ?? 0) > 0;
});
</script>
