<template>
  <section class="assign-agents">
    <AssignAgentsSidebar />

    <section class="assign-agents__content">
      <AssignAgentsHeader />

      <AgentsListFilters />

      <AgentsList
        :agents="agents?.data || []"
        :isLoading="isLoading"
      />
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AgentsList from '@/components/AgentsTeam/AssignAgents/AgentsList/index.vue';
import AgentsListFilters from '@/components/AgentsTeam/AssignAgents/AgentsList/Filters.vue';
import AssignAgentsHeader from '@/components/AgentsTeam/AssignAgents/AssignAgentsHeader.vue';
import AssignAgentsSidebar from '@/components/AgentsTeam/AssignAgents/Sidebar/index.vue';

const agentsTeamStore = useAgentsTeamStore();
const agents = computed(() => {
  return agentsTeamStore.assignAgentsFilters.system === 'ALL_CUSTOM'
    ? agentsTeamStore.myAgents
    : agentsTeamStore.officialAgents;
});
const isLoading = computed(() => agents.value.status === 'loading');
</script>

<style lang="scss" scoped>
.assign-agents {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: $unnnic-space-4;

  height: 100%;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
