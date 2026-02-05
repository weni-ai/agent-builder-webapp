<template>
  <UnnnicButton
    class="test-agents-button"
    data-testid="test-agents-button"
    type="primary"
    iconLeft="play_arrow"
    iconsFilled
    @click="handleTestAgents"
  >
    {{ $t('router.preview.trigger') }}
  </UnnnicButton>

  <PreviewDrawer
    v-model="isPreviewOpen"
    data-testid="preview-drawer"
  />
</template>

<script setup>
import { ref, onUnmounted } from 'vue';

import PreviewDrawer from './Drawer/index.vue';

import { usePreviewStore } from '@/store/Preview';

const previewStore = usePreviewStore();

const isPreviewOpen = ref(false);

const handleTestAgents = () => {
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
.test-agents-button.unnnic-button {
  position: fixed;
  bottom: $unnnic-space-4;
  right: $unnnic-space-4;

  min-width: 250px;
  width: 20%;

  border-radius: $unnnic-radius-full;
  box-shadow: $unnnic-shadow-1;
}
</style>
