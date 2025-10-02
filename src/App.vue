<template>
  <div
    id="app"
    :class="`app-agent-builder app-agent-builder--${!isFederatedModule ? 'dev' : 'prod'}`"
  >
    <Sidebar data-testid="agent-builder-sidebar" />

    <main
      class="agent-builder__content"
      data-testid="agent-builder-content"
    >
      <RouterView />
    </main>

    <UnnnicAlert
      v-if="alertStore.data.text"
      :key="alertStore.id"
      data-testid="alert-pinia"
      class="app-alert"
      v-bind="alertStore.data"
      @close="alertStore.close"
    />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';

import { onMounted, watch } from 'vue';

import { useTuningsStore } from '@/store/Tunings';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert';
import { useProjectStore } from '@/store/Project';
import { useUserStore } from '@/store/User';
import { isFederatedModule } from './utils/moduleFederation';

import initHotjar from '@/utils/plugins/Hotjar.js';

import Sidebar from '@/components/Sidebar/index.vue';

const agentsTeamStore = useAgentsTeamStore();
const alertStore = useAlertStore();
const projectStore = useProjectStore();
const userStore = useUserStore();

onMounted(() => {
  useTuningsStore().fetchCredentials();
  agentsTeamStore.loadActiveTeam();
  agentsTeamStore.loadOfficialAgents();
  agentsTeamStore.loadMyAgents();
  useProfileStore().load();
  userStore.getUserDetails();

  if (!projectStore.details.contentBaseUuid) {
    projectStore.getRouterDetails();
  }
});

watch(
  () => userStore.user.email,
  (email) => {
    if (email) initHotjar(email);
  },
);
</script>

<style lang="scss" scoped>
.app-agent-builder {
  overflow: hidden;

  display: grid;
  grid-template-columns: auto 1fr;

  &--prod {
    height: 100%;
    width: 100%;
  }

  &--dev {
    height: 100vh;
    width: 100vw;
  }

  .agent-builder__content {
    padding: $unnnic-spacing-sm;

    overflow-y: auto;

    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;
  }
}

.app-alert {
  z-index: 100000;
}
</style>
