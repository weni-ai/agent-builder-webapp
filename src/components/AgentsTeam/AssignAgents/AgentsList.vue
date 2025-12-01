<template>
  <section class="agents-list">
    <template v-if="isLoading">
      <AgentCard
        v-for="n in 6"
        :key="n"
        loading
        data-testid="agent-card-loading"
      />
    </template>

    <template v-else>
      <AgentCard
        v-for="agent in agents"
        :key="agent.uuid"
        :agent="agent"
        :tags="agent.systems ? getSystemsObjects(agent.systems) : []"
        data-testid="agent-card"
      />
    </template>
  </section>
</template>

<script setup>
import AgentCard from '@/components/AgentsTeam/AgentCard.vue';
import useAgentSystems from '@/composables/useAgentSystems';

defineProps({
  agents: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const { getSystemsObjects } = useAgentSystems();
</script>

<style lang="scss" scoped>
.agents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $unnnic-space-4;
}
</style>
