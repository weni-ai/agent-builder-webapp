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
        :shouldShowSources="true"
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
        v-model="message"
        class="footer__message-input"
        :placeholder="$t('router.preview.preview_tests_placeholder')"
        data-testid="message-input"
        @send="sendMessage"
      />
    </footer>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, reactive } from 'vue';

import MessageDisplay from '@/components/QuickTest/MessageDisplay/index.vue';
import PreviewPlaceholder from '@/components/Preview/Placeholder.vue';
import MessageInput from './MessageInput.vue';
import MessageComponentResolver from '@/components/MessageComponents/MessageComponentResolver.vue';
import PreviewMenu from '@/components/Preview/Menu/index.vue';

import { useFlowPreviewStore } from '@/store/FlowPreview';
import { useProjectStore } from '@/store/Project';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

import { getFileType } from '@/utils/medias';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import env from '@/utils/env';

const emit = defineEmits(['messages']);

const projectStore = useProjectStore();
const flowPreviewStore = useFlowPreviewStore();
const managerSelectorStore = useManagerSelectorStore();

const message = ref('');
const messages = computed(() => flowPreviewStore.messages);
const messagesRef = ref(null);

const showPreviewMenu = ref(false);
const previewMenuMessage = ref(null);

const shouldShowPreviewPlaceholder = computed(
  () => messages.value.length === 0,
);

function messageHasDeprecatedQuickReplies(message) {
  const isTheLastMessage =
    messages.value
      .filter((msg) => ['answer', 'question'].includes(msg.type))
      .at(-1) === message;

  return (
    message.type === 'answer' &&
    isTheLastMessage &&
    flowPreviewStore.preview.quickReplies?.length > 0
  );
}

function treatMessageToComponents(message) {
  if (!messageHasDeprecatedQuickReplies(message)) {
    return message?.response?.msg;
  }

  const treatedMessage = { ...(message?.response?.msg || {}) };

  if (Object.keys(treatedMessage).length === 0 && message.text) {
    treatedMessage.text = message.text;
  }

  if (flowPreviewStore.preview.quickReplies?.length) {
    treatedMessage.quick_replies = flowPreviewStore.preview.quickReplies;
  }

  return treatedMessage;
}

function openPreviewMenu(message) {
  showPreviewMenu.value = true;
  previewMenuMessage.value = message;
}

function isEventCardBrain(event) {
  if (event.type !== 'webhook_called' || !event.url) {
    return false;
  }

  const url = new URL(event.url);
  const apiBaseUrl = new URL(env('NEXUS_API_BASE_URL')).origin;

  return (
    url.origin === apiBaseUrl &&
    url.pathname === '/messages' &&
    url.searchParams.has('token')
  );
}

watch(
  () => flowPreviewStore.messages,
  (newMessages) => {
    emit('messages', newMessages);
    scrollToLastMessage();
  },
  { deep: true },
);

watch(
  () => flowPreviewStore.preview.session?.status,
  (value, previous) => {
    if (previous === 'waiting' && value === 'completed') {
      flowPreviewStore.addMessage({
        type: 'flowsend',
        name: '',
        question_uuid: null,
        feedback: {
          value: null,
          reason: null,
        },
      });

      const lastEvent =
        flowPreviewStore.preview.events
          .filter(({ type }) => !['info'].includes(type))
          .at(-1) || {};

      const shouldForwardToBrain = isEventCardBrain(lastEvent);

      if (shouldForwardToBrain) {
        flowPreviewStore.addMessage({
          type: 'message_forwarded_to_brain',
          name: '',
          question_uuid: null,
          feedback: {
            value: null,
            reason: null,
          },
        });

        const { text: lastQuestion } = flowPreviewStore.messages.findLast(
          ({ type }) => type === 'question',
        );

        answer(lastQuestion);
      }
    }
  },
);

function isMedia(message) {
  return !!getFileType(message);
}

function sendMenuMessage(messageContent) {
  previewMenuMessage.value = null;
  showPreviewMenu.value = false;

  sendMessage(messageContent);
}

function sendOrder(order) {
  showPreviewMenu.value = false;

  flowPreviewStore.addMessage({
    type: 'order',
    text: JSON.stringify(order),
    status: 'loaded',
    question_uuid: null,
    feedback: {
      value: null,
      reason: null,
    },
  });

  scrollToLastMessage();
}

function sendMessage(messageContent) {
  let messageText;

  if (messageContent) {
    messageText = messageContent;
  } else {
    const isFileMessage = typeof message.value !== 'string';
    messageText = isFileMessage ? message.value : message.value.trim();
  }

  if (!messageText) {
    return;
  }

  flowPreviewStore.addMessage({
    type: 'question',
    text: messageText,
  });

  if (!messageContent) {
    message.value = '';
  }

  scrollToLastMessage();
  setTimeout(() => answer(messageText), 400);
}

async function answer(question) {
  const answer = reactive({
    type: 'answer',
    text: '',
    status: 'loading',
    question_uuid: null,
    feedback: {
      value: null,
      reason: null,
    },
  });

  flowPreviewStore.addMessage(answer);
  scrollToLastMessage();

  const handleError = () => {
    flowPreviewStore.removeMessage(answer);
  };

  let questionMediaUrl;
  const isQuestionMedia = isMedia(question);
  if (isQuestionMedia) {
    try {
      const isGeolocationMedia = typeof question === 'string';
      if (isGeolocationMedia) {
        questionMediaUrl = `geo:${question}`;
      } else {
        const {
          data: { file_url },
        } = await nexusaiAPI.router.preview.uploadFile({
          projectUuid: projectStore.uuid,
          file: question,
        });
        questionMediaUrl = file_url;
      }
    } catch {
      handleError();
      return;
    }
  }

  try {
    const { data } = await nexusaiAPI.router.preview.create({
      projectUuid: projectStore.uuid,
      text: isQuestionMedia ? '' : question,
      attachments: questionMediaUrl ? [questionMediaUrl] : [],
      contact_urn: flowPreviewStore.preview.contact.urns[0],
      manager_uuid: managerSelectorStore.selectedPreviewManager,
    });

    flowPreviewStore.treatAnswerResponse(answer, data, {
      onBroadcast: () => scrollToLastMessage(),
      fallbackMessage: i18n.global.t('quick_test.unable_to_find_an_answer'),
    });
  } catch {
    handleError();
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
  if (flowPreviewStore.preview.contact.uuid) return;

  flowPreviewStore.previewInit({
    contentBaseUuid: projectStore.details.contentBaseUuid,
  });

  window.brainPreviewAddMessage = (messageData) => {
    flowPreviewStore.addMessage(messageData);
  };
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
