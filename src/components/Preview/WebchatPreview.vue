<template>
  <div
    id="weni-webchat-preview"
    class="webchat-preview"
    data-testid="webchat-preview"
  />
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount } from 'vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useWebchatLoader } from '@/composables/useWebchatLoader';
import env from '@/utils/env';
import { useI18n } from 'vue-i18n';
import { useProjectStore } from '@/store/Project';
import { useWebchatPreviewStore } from '@/store/WebchatPreview';

const WWC_SELECTOR = '#weni-webchat-preview';
const WWC_MESSAGES_SELECTOR = `${WWC_SELECTOR} .weni-messages-list`;

const { t } = useI18n();
const DIRECTION_GROUP_SELECTOR = '.weni-messages-list__direction-group';

const flowPreviewStore = useFlowPreviewStore();
const managerSelectorStore = useManagerSelectorStore();
const projectStore = useProjectStore();
const webchatPreviewStore = useWebchatPreviewStore();
const { preload, cleanup: cleanupLoader } = useWebchatLoader();

async function initWebchat() {
  await preload();

  flowPreviewStore.ensurePreviewInitialized();
  const contactUrn = flowPreviewStore.preview.contact.urn;

  window.WebChat.init({
    selector: WWC_SELECTOR,
    socketUrl: env('WWC_SOCKET_URL'),
    host: env('WWC_HOST_URL'),
    channelUuid: projectStore.project?.wwcChannelUuid,
    sessionId: contactUrn,
    inputTextFieldHint: t('router.preview.preview_tests_placeholder'),
    embedded: true,
    showChatAvatar: false,
  });
}

function injectManagerSelectedMessage(managerId) {
  const container = document.querySelector(WWC_MESSAGES_SELECTOR);
  if (!container) return;

  const label = flowPreviewStore.getPreviewManagerLabel(managerId);
  const text = t('router.preview.manager_selected', {
    name: label,
  });

  const el = document.createElement('div');
  el.className = 'webchat-manager-status';
  el.textContent = text;

  const anchors = container.querySelectorAll(
    `${DIRECTION_GROUP_SELECTOR}, .webchat-manager-status`,
  );
  const lastAnchor = anchors[anchors.length - 1];

  if (lastAnchor) {
    lastAnchor.after(el);
  } else {
    container.appendChild(el);
  }

  el.scrollIntoView({ behavior: 'smooth' });
}

watch(
  () => managerSelectorStore.selectedPreviewManager,
  (managerId, previousManagerId) => {
    if (!managerId || managerId === previousManagerId) return;

    try {
      webchatPreviewStore.changeManagerModel(managerId);
      injectManagerSelectedMessage(managerId);
    } catch (error) {
      console.error('Error changing manager model', error);
    }
  },
);

onMounted(() => {
  initWebchat();
});

onBeforeUnmount(() => {
  cleanupLoader();
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

    .weni-messages-list {
      padding: $unnnic-space-6;

      .webchat-manager-status {
        display: flex;
        align-items: center;
        justify-content: center;

        color: $unnnic-color-fg-base;
        font: $unnnic-font-caption-2;
      }
    }

    .weni-chat__footer {
      margin: 0 $unnnic-space-4 $unnnic-space-6;

      .weni-poweredby {
        display: none !important;
      }
    }
  }
}
</style>
