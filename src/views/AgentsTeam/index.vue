<template>
  <section class="view-agents">
    <UnnnicPageHeader
      :title="$t('agents.title')"
      :description="$t('agents.description')"
      data-testid="agents-header"
    >
      <template
        v-if="agentsTeamStore.activeTeam.data.agents.length > 0"
        #actions
      >
        <UnnnicButton
          :text="$t('agents.assign_agents_button')"
          type="secondary"
          data-testid="assign-agents-button"
          @click="handleAgentsGallery"
        />
        <UnnnicButton
          data-testid="preview-button"
          type="primary"
          iconLeft="play_arrow"
          iconsFilled
          @click="handlePreview"
        >
          {{ $t('router.agents_team.preview') }}
        </UnnnicButton>
      </template>
    </UnnnicPageHeader>

    <AssignedAgents data-testid="assigned-agents" />

    <AgentsGalleryModal data-testid="agents-gallery-modal" />

    <PreviewDrawer
      v-model="isPreviewOpen"
      data-testid="preview-drawer"
    />
  </section>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

import PreviewDrawer from '@/components/Preview/PreviewDrawer.vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { usePreviewStore } from '@/store/Preview';

import AssignedAgents from './AssignedAgents.vue';
import AgentsGalleryModal from './AgentsGalleryModal.vue';

const isPreviewOpen = ref(false);

const previewStore = usePreviewStore();
const agentsTeamStore = useAgentsTeamStore();

const handleAgentsGallery = () => {
  useAgentsTeamStore().isAgentsGalleryOpen = true;
};

const handlePreview = () => {
  isPreviewOpen.value = true;
};

onUnmounted(() => {
  if (previewStore.ws) {
    previewStore.disconnectWS();
    previewStore.clearLogs();
  }
});
</script>

<style lang="scss" scoped>
section.view-agents {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-space-4;
  height: 100%;
}
</style>
