<template>
  <section class="agents-list">
    <template v-if="isLoading">
      <AssignAgentCard
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
        data-testid="agent-card"
      />
    </template>
  </section>
</template>

<script setup>
import AssignAgentCard from '@/components/AgentsTeam/AssignAgentCard.vue';

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
