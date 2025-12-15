<template>
  <div
    id="app"
    :class="[
      'app-agent-builder',
      !isFederatedModule ? 'app-agent-builder--dev' : 'app-agent-builder--prod',
      isBuildModule ? 'app-agent-builder--build' : '',
    ]"
  >
    <Sidebar
      v-if="isBuildModule"
      data-testid="build-sidebar"
    />

    <main
      class="agent-builder__content"
      data-testid="agent-builder-content"
    >
      <RouterView />
    </main>

    <TestAgentsButton
      v-if="showTestAgentsButton"
      data-testid="test-agents-button"
    />

    <UnnnicToast
      v-if="alertStore.data.text"
      :key="alertStore.id"
      data-testid="alert-pinia"
      class="app-alert"
      :title="alertStore.data.text"
      :type="alertStore.data.type"
      @destroy="alertStore.close"
    />
  </div>
</template>

<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';

import { computed, onMounted, watch } from 'vue';

import { useTuningsStore } from '@/store/Tunings';
import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { useProfileStore } from '@/store/Profile';
import { useAlertStore } from '@/store/Alert';
import { useProjectStore } from '@/store/Project';
import { useUserStore } from '@/store/User';
import { useCurrentModule } from '@/composables/useCurrentModule';
import { isFederatedModule } from './utils/moduleFederation';

import initHotjar from '@/utils/plugins/Hotjar.js';

import Sidebar from '@/components/Sidebar/index.vue';
import TestAgentsButton from '@/components/Preview/TestAgentsButton.vue';

const { isBuildModule, isAgentsModule } = useCurrentModule();

const route = useRoute();
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

const showTestAgentsButton = computed(
  () =>
    (isAgentsModule.value && route.name === 'agents-team') ||
    (isBuildModule.value &&
      ['instructions', 'knowledge'].includes(route.name as string)),
);

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

  &--build {
    grid-template-columns: auto 1fr;
  }

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
