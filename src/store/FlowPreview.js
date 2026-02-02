import { defineStore } from 'pinia';
import { ref } from 'vue';
import { get } from 'lodash';

import useFlowPreview from '@/composables/useFlowPreview';

export const useFlowPreviewStore = defineStore('flowPreview', () => {
  const { preview, previewInit } = useFlowPreview();

  const messages = ref([]);
  const messageInput = ref('');

  function addMessage(message) {
    messages.value.push(message);
  }

  function clearMessages() {
    messages.value = [];
  }

  function setMessageInput(text) {
    messageInput.value = text;
  }

  function removeMessage(message) {
    const index = messages.value.indexOf(message);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  }

  function treatAnswerResponse(
    answer,
    data,
    { onBroadcast, fallbackMessage = '' },
  ) {
    if (data.type === 'broadcast') {
      handleBroadcastResponse(answer, data, fallbackMessage, onBroadcast);
    }
  }

  function handleBroadcastResponse(answer, data, fallbackMessage, onBroadcast) {
    answer.status = 'loaded';

    const message = get(data, 'message', fallbackMessage);

    if (Array.isArray(message) && message.length > 0) {
      answer.response = message[0];

      createAdditionalMessages(message.slice(1), answer.question_uuid);
    } else {
      answer.response = message;
    }

    if (onBroadcast) onBroadcast(answer);
  }

  function createAdditionalMessages(items, questionUuid) {
    items.forEach((item) => {
      const additionalMessage = {
        type: 'answer',
        status: 'loaded',
        response: item,
        question_uuid: questionUuid,
      };
      addMessage(additionalMessage);
    });
  }

  return {
    preview,
    messages,
    messageInput,

    previewInit,

    addMessage,
    clearMessages,
    setMessageInput,
    removeMessage,
    treatAnswerResponse,
  };
});
