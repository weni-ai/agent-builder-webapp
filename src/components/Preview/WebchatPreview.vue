<template>
  <div
    id="weni-webchat-preview"
    class="webchat-preview"
    data-testid="webchat-preview"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';

const WWC_UMD_URL = 'https://cdn.stg.cloud.weni.ai/webchat-latest.umd.js';
const WWC_SELECTOR = '#weni-webchat-preview';

const flowPreviewStore = useFlowPreviewStore();
const scriptElement = ref(null);

function loadUmdBundle() {
  return new Promise((resolve, reject) => {
    if (window.WebChat) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = WWC_UMD_URL;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
    scriptElement.value = script;
  });
}

async function initWebchat() {
  await loadUmdBundle();

  flowPreviewStore.ensurePreviewInitialized();
  const contactUrn = flowPreviewStore.preview.contact.urn;
  console.log(contactUrn);

  window.WebChat.init({
    selector: WWC_SELECTOR,
    socketUrl: 'https://websocket.stg.cloud.weni.ai',
    host: 'https://flows.stg.cloud.weni.ai',
    channelUuid: '4f21629b-babe-4d20-951a-609236da9c96',
    sessionId: contactUrn,
    params: {
      preview: true,
    },
    embedded: true,
    showChatAvatar: false,
  });
}

function cleanup() {
  window.WebChat?.destroy();
  scriptElement.value?.remove();
  scriptElement.value = null;
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
  }
}
</style>
