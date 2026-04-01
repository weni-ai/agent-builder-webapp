<template>
  <div
    id="app"
    :class="[
      'app-agent-builder',
      !isFederatedModule ? 'app-agent-builder--dev' : 'app-agent-builder--prod',
    ]"
  >
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
import { useUserStore } from '@/store/User';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useProjectStore } from './store/Project';
import { useCurrentModule } from '@/composables/useCurrentModule';
import { isFederatedModule } from './utils/moduleFederation';

import initHotjar from '@/utils/plugins/Hotjar.js';

import TestAgentsButton from '@/components/Preview/TestAgentsButton.vue';

const { isAgentsModule, isKnowledgeModule } = useCurrentModule();

const route = useRoute();
const agentsTeamStore = useAgentsTeamStore();
const alertStore = useAlertStore();
const userStore = useUserStore();
const managerSelectorStore = useManagerSelectorStore();

async function loadAgentsData() {
  agentsTeamStore.loadActiveTeam();
  // The official agents need to be loaded first to get the available systems to active team
  await agentsTeamStore.loadOfficialAgents();
  agentsTeamStore.loadMyAgents();
}

onMounted(() => {
  loadAgentsData();

  useTuningsStore().fetchCredentials();
  useProfileStore().load();
  userStore.getUserDetails();
  managerSelectorStore.loadManagerData();
  useProjectStore().getProject();
});

const showTestAgentsButton = computed(
  () =>
    (isAgentsModule.value &&
      ['agents-team', 'instructions'].includes(route.name as string)) ||
    isKnowledgeModule.value,
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
