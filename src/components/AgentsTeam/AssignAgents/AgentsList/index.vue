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
      <AssignAgentCard
        v-for="agent in agents"
        :key="agent.uuid"
        :agent="agent"
      />
    </template>
  </section>
</template>

<script setup>
import AgentCard from '@/components/AgentsTeam/AgentCard.vue';
import AssignAgentCard from '../AssignAgentCard.vue';

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
</script>

<style lang="scss" scoped>
.agents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $unnnic-space-4;
}
</style>
