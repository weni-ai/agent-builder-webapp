<template>
  <div
    v-if="!webchatPreviewStore.isWebchatReady"
    class="webchat-preview__loading"
  >
    <UnnnicIconLoading size="xl" />
  </div>

  <div
    v-show="webchatPreviewStore.isWebchatReady"
    id="weni-webchat-preview"
    class="webchat-preview"
    data-testid="webchat-preview"
  />
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount } from 'vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useProjectStore } from '@/store/Project';
import { useWebchatPreviewStore } from '@/store/WebchatPreview';

import { useWebchatLoader } from '@/composables/webchat/useWebchatLoader';
import { useWebSocketHistoryPatch } from '@/composables/webchat/useWebSocketHistoryPatch';
import { useWebchatDomInjector } from '@/composables/webchat/useWebchatDomInjector';

import env from '@/utils/env';
import { useI18n } from 'vue-i18n';

const WWC_SELECTOR = '#weni-webchat-preview';
const MESSAGE_SELECTOR = '.weni-message';
const MANAGER_STATUS_SELECTOR = '.webchat-manager-status';
const HISTORY_TIMEOUT_MS = 20000;

const { t } = useI18n();

const flowPreviewStore = useFlowPreviewStore();
const managerSelectorStore = useManagerSelectorStore();
const projectStore = useProjectStore();
const webchatPreviewStore = useWebchatPreviewStore();

const { preload, cleanup: cleanupLoader } = useWebchatLoader();
const { patch: patchWsHistory, restore: restoreWsHistory } =
  useWebSocketHistoryPatch();
const domInjector = useWebchatDomInjector(WWC_SELECTOR);

let historyTimeoutId = null;
let placeholderEl = null;
let placeholderObserver = null;

function mountPlaceholder() {
  const container = domInjector.getContainer();
  if (!container || placeholderEl) return;

  placeholderEl = domInjector.createElement({
    tag: 'p',
    className: 'webchat-placeholder',
    textContent: t('router.preview.placeholder'),
  });

  domInjector.appendToContainer(placeholderEl);

  placeholderObserver = new MutationObserver(() => {
    if (
      container.querySelector(MESSAGE_SELECTOR) ||
      container.querySelector(MANAGER_STATUS_SELECTOR)
    ) {
      unmountPlaceholder();
    }
  });

  placeholderObserver.observe(container, { childList: true, subtree: true });
}

function unmountPlaceholder() {
  placeholderObserver?.disconnect();
  placeholderObserver = null;
  placeholderEl?.remove();
  placeholderEl = null;
}

function setWebchatReady() {
  webchatPreviewStore.isWebchatReady = true;
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
      elevenLabs: {
        voiceId: env('WWC_VOICE_ID'),
      },
    },
  });
}

function injectManagerSelectedMessage(managerId) {
  const label = flowPreviewStore.getPreviewManagerLabel(managerId);
  const text = t('router.preview.manager_selected', { name: label });

  const el = domInjector.createElement({
    className: MANAGER_STATUS_SELECTOR.replace('.', ''),
    textContent: text,
  });

  domInjector.insertAfterLastAnchor(
    el,
    `${MESSAGE_SELECTOR}, ${MANAGER_STATUS_SELECTOR}`,
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
    domInjector.removeBySelector(MANAGER_STATUS_SELECTOR);
    unmountPlaceholder();
    mountPlaceholder();
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

  &:not(:has(.weni-view-product-catalog)) {
    :deep(.weni-chat-header) {
      display: none !important;
    }
  }

  :deep(.weni-widget) {
    position: absolute !important;

    width: 100%;
    height: 100%;
  }

  :deep(.weni-chat) {
    height: 100%;
    max-height: 100%;
    width: 100%;
    margin: 0;

    box-shadow: none;

    .weni-messages-list {
      padding: $unnnic-space-6;

      .weni-chat-presentation {
        display: none;
      }

      .webchat-placeholder {
        margin: auto;

        max-width: 180px;
        height: 100%;

        display: flex;
        align-items: center;
        justify-content: center;

        text-align: center;
        color: $unnnic-color-fg-muted;
        @include unnnic-font-body;
      }

      .webchat-manager-status {
        margin: $unnnic-space-2 0;

        display: flex;
        align-items: center;
        justify-content: center;

        text-align: center;
        color: $unnnic-color-fg-base;
        @include unnnic-font-caption-2;
      }
    }

    .weni-input-box__textarea {
      min-height: 24px;
    }

    .weni-chat__footer {
      .weni-input-box {
        margin: 0 $unnnic-space-6 $unnnic-space-6;
      }

      .weni-poweredby {
        display: none !important;
      }
    }
  }
}
</style>
