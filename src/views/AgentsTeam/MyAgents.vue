<template>
  <section
    class="my-agents"
    data-testid="my-agents"
  >
    <AssignedAgents />
  </section>
</template>

<script setup lang="ts">
import AssignedAgents from '@/components/AgentsTeam/MyAgents/AssignedAgents.vue';
</script>

<style lang="scss" scoped>
.my-agents {
  display: grid;
  gap: $unnnic-space-4;

  margin-top: $unnnic-space-4;
}
</style>
