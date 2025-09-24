<template>
  <div id="app">
    <section class="agent-builder">
      <Sidebar data-testid="agent-builder-sidebar" />

      <main
        class="agent-builder__content"
        data-testid="agent-builder-content"
      >
        <RouterView />
      </main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

import { onMounted } from 'vue';

import { useTuningsStore } from '@/store/Tunings';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useProfileStore } from '@/store/Profile';

import Sidebar from '@/components/Sidebar/index.vue';

const agentsTeamStore = useAgentsTeamStore();

onMounted(() => {
  useTuningsStore().fetchCredentials();
  agentsTeamStore.loadActiveTeam();
  agentsTeamStore.loadOfficialAgents();
  agentsTeamStore.loadMyAgents();
  useProfileStore().load();
});
</script>

<style lang="scss" scoped>
.agent-builder {
  overflow: hidden;

  display: grid;
  grid-template-columns: auto 1fr;

  height: 100vh;
  width: 100vw;

  .agent-builder__content {
    padding: $unnnic-spacing-sm;

    overflow-y: auto;

    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
  }
}
</style>
