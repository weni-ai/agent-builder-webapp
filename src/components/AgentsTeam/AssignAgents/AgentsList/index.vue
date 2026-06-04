<template>
  <section :class="['agents-list', { 'agents-list--empty': isEmpty }]">
    <template v-if="isLoading">
      <AgentCard
        v-for="n in 6"
        :key="n"
        loading
        data-testid="agent-card-loading"
      />
    </template>

    <AgentsListEmptyState v-else-if="isEmpty" />

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
import { computed } from 'vue';

import AgentCard from '@/components/AgentsTeam/AgentCard.vue';
import AssignAgentCard from '../AssignAgentCard.vue';
import AgentsListEmptyState from './EmptyState.vue';

const props = defineProps({
  agents: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

const isEmpty = computed(() => props.agents.length === 0 && !props.isLoading);
</script>

<style lang="scss" scoped>
.agents-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $unnnic-space-4;

  // Limit to 3 columns maximum for large desktops
  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }

  &--empty {
    height: 100%;

    grid-template-columns: 1fr;
    align-items: center;
  }
}
</style>
