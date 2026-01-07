<template>
  <section class="assign-agents">
    <aside>TODO: SIDEBAR</aside>
    <section class="assign-agents__content">
      <header>TODO: HEADER</header>
      <section>TODO: FILTERS</section>

      <AgentsList
        :agents="officialAgents.data"
        :isLoading="isLoading"
      />
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';

import AgentsList from '@/components/AgentsTeam/AssignAgents/AgentsList.vue';

const agentsTeamStore = useAgentsTeamStore();
const officialAgents = agentsTeamStore.officialAgents;
const isLoading = computed(
  () => agentsTeamStore.officialAgents.status === 'loading',
);
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
