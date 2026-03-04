<template>
  <div
    id="weni-webchat-preview"
    class="webchat-preview"
    data-testid="webchat-preview"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const WWC_UMD_URL = 'https://cdn.stg.cloud.weni.ai/webchat-latest.umd.js';
const WWC_SELECTOR = '#weni-webchat-preview';

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

  window.WebChat.init({
    selector: WWC_SELECTOR,
    socketUrl: 'https://websocket.stg.cloud.weni.ai',
    host: 'https://flows.stg.cloud.weni.ai',
    channelUuid: '66c1f276-42d0-46f1-b5e3-37bb4d9e908d',
    params: {
      preview: true,
    },
    embedded: true,
    startFullScreen: true,
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
