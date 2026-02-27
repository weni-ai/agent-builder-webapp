<template>
  <section
    class="my-agents"
    data-testid="my-agents"
  >
    <ManagerCard />

    <AssignedAgents />
  </section>
</template>

<script setup lang="ts">
import AssignedAgents from '@/components/AgentsTeam/MyAgents/AssignedAgents.vue';
import ManagerCard from '@/components/AgentsTeam/MyAgents/ManagerCard.vue';
</script>

<style lang="scss" scoped>
.my-agents {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-space-6;

  margin-top: $unnnic-space-4;
}
</style>
