<template>
  <div
    id="weni-webchat-preview"
    class="webchat-preview"
    data-testid="webchat-preview"
  />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useWebchatLoader } from '@/composables/useWebchatLoader';
import env from '@/utils/env';

const WWC_SELECTOR = '#weni-webchat-preview';

const flowPreviewStore = useFlowPreviewStore();
const { preload, cleanup } = useWebchatLoader();

async function initWebchat() {
  await preload();

  flowPreviewStore.ensurePreviewInitialized();
  const contactUrn = flowPreviewStore.preview.contact.urn;
  console.log(contactUrn);

  window.WebChat.init({
    selector: WWC_SELECTOR,
    socketUrl: env('WWC_SOCKET_URL'),
    host: env('WWC_HOST_URL'),
    channelUuid: '4f21629b-babe-4d20-951a-609236da9c96',
    sessionId: contactUrn,
    params: {
      // TODO: Remove this once we have the preview API ready
      preview: true,
    },
    embedded: true,
    showChatAvatar: false,
  });
}

onMounted(() => {
  initWebchat();
});

onBeforeUnmount(() => {
  cleanup();
});
</script>

<style lang="scss" scoped>
.webchat-preview {
  width: 100%;
  height: 100%;
  position: relative;

  :deep(.weni-widget) {
    position: absolute !important;
  }

  :deep(.weni-chat) {
    position: absolute !important;

    .weni-chat-header {
      display: none !important;
    }

    .weni-chat__footer {
      margin-bottom: $unnnic-space-4;

      .weni-poweredby {
        display: none !important;
      }
    }
  }
}
</style>
