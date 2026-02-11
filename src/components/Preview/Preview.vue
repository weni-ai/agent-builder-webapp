<template>
  <PreviewMenu
    v-if="showPreviewMenu"
    data-testid="preview-menu"
    :modelValue="showPreviewMenu"
    :message="previewMenuMessage"
    @update:model-value="showPreviewMenu = false"
    @send-message="sendMenuMessage"
    @send-order="sendOrder"
  />

  <section
    v-else
    class="preview"
  >
    <PreviewPlaceholder
      v-if="shouldShowPreviewPlaceholder"
      class="preview__placeholder"
      data-testid="preview-placeholder"
    />

    <article
      v-else
      ref="messagesRef"
      class="preview__messages"
      data-testid="messages-container"
    >
      <MessageDisplay
        v-for="(message, index) in messages"
        :key="`message-${index}`"
        :message="message"
        data-testid="message-display"
      >
        <template #components>
          <MessageComponentResolver
            :message="treatMessageToComponents(message)"
            @send-message="sendMessage"
            @open-preview-menu="openPreviewMenu(message?.response?.msg)"
          />
        </template>
      </MessageDisplay>
    </article>

    <footer class="preview__footer">
      <MessageInput
        v-model="messageInput"
        class="footer__message-input"
        :placeholder="$t('router.preview.preview_tests_placeholder')"
        data-testid="message-input"
        @send="sendMessage"
      />
    </footer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';

import MessageDisplay from '@/components/QuickTest/MessageDisplay/index.vue';
import PreviewPlaceholder from '@/components/Preview/Placeholder.vue';
import MessageInput from './MessageInput.vue';
import MessageComponentResolver from '@/components/MessageComponents/MessageComponentResolver.vue';
import PreviewMenu from '@/components/Preview/Menu/index.vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

const emit = defineEmits(['messages']);

const flowPreviewStore = useFlowPreviewStore();
const managerSelectorStore = useManagerSelectorStore();

const messageInput = ref('');
const { messages } = storeToRefs(flowPreviewStore);
const messagesRef = ref(null);

const showPreviewMenu = ref(false);
const previewMenuMessage = ref(null);

const shouldShowPreviewPlaceholder = computed(
  () => messages.value.length === 0,
);

function treatMessageToComponents(message) {
  return flowPreviewStore.treatMessageToComponents(message);
}

function openPreviewMenu(message) {
  showPreviewMenu.value = true;
  previewMenuMessage.value = message;
}

watch(
  messages,
  (newMessages) => {
    emit('messages', newMessages);
    scrollToLastMessage();
  },
  { deep: true },
);

watch(
  () => managerSelectorStore.selectedPreviewManager,
  (managerId, previousManagerId) => {
    if (!managerId || managerId === previousManagerId) {
      return;
    }
    flowPreviewStore.addManagerSelectedMessage(managerId);
  },
);

function sendMenuMessage(messageContent) {
  previewMenuMessage.value = null;
  showPreviewMenu.value = false;

  sendMessage(messageContent);
}

function sendOrder(order) {
  showPreviewMenu.value = false;
  flowPreviewStore.sendOrder(order);
}

function sendMessage(messageContent) {
  let messageText = messageContent;
  if (!messageText) {
    const isFileMessage = typeof messageInput.value !== 'string';
    messageText = isFileMessage
      ? messageInput.value
      : messageInput.value.trim();
  }

  if (!messageText) {
    return;
  }

  flowPreviewStore.sendMessage(messageText);

  if (!messageContent) {
    messageInput.value = '';
  }
}

function scrollToLastMessage() {
  nextTick(() => {
    messagesRef.value?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
    });
  });
}

function initPreview() {
  flowPreviewStore.ensurePreviewInitialized();
}

onMounted(() => {
  initPreview();
});
</script>

<style lang="scss" scoped>
.button-send-message :deep(svg .primary) {
  fill: $unnnic-color-weni-600;
}

.preview {
  box-sizing: border-box;
  overflow: hidden;

  padding-top: $unnnic-spacing-sm;

  display: grid;
  grid-template-rows: 1fr auto;
  row-gap: $unnnic-spacing-xs;

  height: 100%;
  width: 100%;

  &__placeholder {
    height: 100%;
  }

  &__messages {
    flex: 1;
    padding: 0 $unnnic-spacing-sm;
    overflow: hidden overlay;

    display: flex;
    flex-direction: column;
    row-gap: $unnnic-spacing-xs;

    $scroll-size: $unnnic-inline-nano;

    &::-webkit-scrollbar {
      width: $scroll-size;
    }

    &::-webkit-scrollbar-thumb {
      background: $unnnic-color-neutral-clean;
      border-radius: $unnnic-border-radius-pill;
    }

    &::-webkit-scrollbar-track {
      background: $unnnic-color-neutral-soft;
      border-radius: $unnnic-border-radius-pill;
    }

    &__empty-text {
      color: $unnnic-color-neutral-clean;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
      font-weight: $unnnic-font-weight-regular;
    }
  }

  &__footer {
    display: flex;
    column-gap: $unnnic-spacing-nano;

    padding: 0 $unnnic-spacing-sm $unnnic-spacing-sm;

    .footer__message-input {
      width: 100%;
    }
  }
}
</style>
