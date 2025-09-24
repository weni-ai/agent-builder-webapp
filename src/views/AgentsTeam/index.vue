<template>
  <section class="agents-team">
    <AgentBuilderHeader
      withDivider
      actionsSize="lg"
      data-testid="agents-team-header"
    >
      <template #actions>
        <section class="agents-team__actions">
          <UnnnicButton
            data-testid="assign-agents-button"
            type="secondary"
            iconLeft="add"
            @click="handleAgentsGallery"
          >
            {{ $t('router.agents_team.assign_agents') }}
          </UnnnicButton>

          <UnnnicButton
            data-testid="preview-button"
            type="primary"
            iconLeft="play_arrow"
            iconsFilled
            @click="handlePreview"
          >
            {{ $t('router.agents_team.preview') }}
          </UnnnicButton>
        </section>
      </template>
    </AgentBuilderHeader>

    <ActiveTeam data-testid="active-team" />

    <AgentsGalleryModal data-testid="agents-gallery-modal" />

    <PreviewDrawer
      v-model="isPreviewOpen"
      data-testid="preview-drawer"
    />
  </section>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

import AgentBuilderHeader from '@/components/Header.vue';
import PreviewDrawer from '@/components/Preview/PreviewDrawer.vue';

import { useAgentsTeamStore } from '@/store/AgentsTeam';
import { usePreviewStore } from '@/store/Preview';

import ActiveTeam from './ActiveTeam.vue';
import AgentsGalleryModal from './AgentsGalleryModal.vue';

const isPreviewOpen = ref(false);

const previewStore = usePreviewStore();

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
section.agents-team {
  display: grid;
  grid-template-rows: auto auto 1fr;
  height: 100%;

  .agents-team__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $unnnic-spacing-sm;
  }
}
</style>
