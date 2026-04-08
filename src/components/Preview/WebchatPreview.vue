<template>
  <div
    v-if="!isWebchatReady"
    class="webchat-preview__loading"
  >
    <UnnnicIconLoading size="xl" />
  </div>

  <div
    v-show="isWebchatReady"
    id="weni-webchat-preview"
    class="webchat-preview"
    data-testid="webchat-preview"
  />
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useProjectStore } from '@/store/Project';
import { useWebchatPreviewStore } from '@/store/WebchatPreview';

import { useWebchatLoader } from '@/composables/webchat/useWebchatLoader';
import { useWebSocketHistoryPatch } from '@/composables/webchat/useWebSocketHistoryPatch';
import { useWebchatDomInjector } from '@/composables/webchat/useWebchatDomInjector';

import Placeholder from '@/components/Preview/Placeholder.vue';
import Unnnic from '@/utils/plugins/UnnnicSystem';
import i18n from '@/utils/plugins/i18n';
import env from '@/utils/env';
import { useI18n } from 'vue-i18n';

const WWC_SELECTOR = '#weni-webchat-preview';
const DIRECTION_GROUP_SELECTOR = '.weni-messages-list__direction-group';
const HISTORY_TIMEOUT_MS = 5000;

const { t } = useI18n();

const flowPreviewStore = useFlowPreviewStore();
const managerSelectorStore = useManagerSelectorStore();
const projectStore = useProjectStore();
const webchatPreviewStore = useWebchatPreviewStore();

const { preload, cleanup: cleanupLoader } = useWebchatLoader();
const { patch: patchWsHistory, restore: restoreWsHistory } =
  useWebSocketHistoryPatch();
const domInjector = useWebchatDomInjector(WWC_SELECTOR);

const isWebchatReady = ref(false);
let historyTimeoutId = null;
let placeholderHandle = null;
let placeholderObserver = null;

function mountPlaceholder() {
  const container = domInjector.getContainer();
  if (!container || placeholderHandle) return;

  placeholderHandle = domInjector.mountComponent(Placeholder, {
    plugins: [Unnnic, i18n],
    wrapperClass: 'webchat-placeholder-wrapper',
  });

  placeholderObserver = new MutationObserver(() => {
    if (container.querySelector(DIRECTION_GROUP_SELECTOR)) {
      unmountPlaceholder();
    }
  });

  placeholderObserver.observe(container, { childList: true, subtree: true });
}

function unmountPlaceholder() {
  placeholderObserver?.disconnect();
  placeholderObserver = null;
  placeholderHandle?.unmount();
  placeholderHandle = null;
}

function setWebchatReady() {
  isWebchatReady.value = true;
  clearTimeout(historyTimeoutId);
  historyTimeoutId = null;
  mountPlaceholder();
}

async function initWebchat() {
  await preload();

  flowPreviewStore.ensurePreviewInitialized();
  const contactUrn = flowPreviewStore.preview.contact.urn;

  webchatPreviewStore.endSession();
  patchWsHistory(setWebchatReady);

  historyTimeoutId = setTimeout(setWebchatReady, HISTORY_TIMEOUT_MS);

  window.WebChat.init({
    selector: WWC_SELECTOR,
    socketUrl: env('WWC_SOCKET_URL'),
    host: env('WWC_HOST_URL'),
    channelUuid: projectStore.project?.wwcChannelUuid,
    sessionId: contactUrn,
    inputTextFieldHint: t('router.preview.preview_tests_placeholder'),
    embedded: true,
    showChatAvatar: false,
    showCameraButton: false,
    voiceMode: {
      enabled: true,
    },
  });
}

function injectManagerSelectedMessage(managerId) {
  const label = flowPreviewStore.getPreviewManagerLabel(managerId);
  const text = t('router.preview.manager_selected', { name: label });

  const el = domInjector.createElement({
    className: 'webchat-manager-status',
    textContent: text,
  });

  domInjector.insertAfterLastAnchor(
    el,
    `${DIRECTION_GROUP_SELECTOR}, .webchat-manager-status`,
  );

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

watch(
  () => webchatPreviewStore.sessionVersion,
  () => {
    domInjector.removeBySelector('.webchat-manager-status');
  },
);

onMounted(() => {
  initWebchat();
});

onBeforeUnmount(() => {
  clearTimeout(historyTimeoutId);
  unmountPlaceholder();
  restoreWsHistory();
  cleanupLoader();
});
</script>

<style lang="scss" scoped>
.webchat-preview__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.webchat-preview {
  width: 100%;
  height: 100%;
  position: relative;

  *:not(.unnnic-icon) {
    font-family: Inter, sans-serif !important;
  }

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

      .webchat-placeholder-wrapper {
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: center;
      }

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
