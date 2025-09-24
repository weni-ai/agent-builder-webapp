import { defineStore } from 'pinia';
import { ref } from 'vue';
import { get, attempt } from 'lodash';

import useFlowPreview from '@/composables/useFlowPreview';

export const useFlowPreviewStore = defineStore('flowPreview', () => {
  const {
    preview,
    previewInit,
    previewStart,
    previewHasQuickReplies,
    previewResume,
  } = useFlowPreview();

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

  function replaceMessage(toReplace, newMessages) {
    const index = messages.value.indexOf(toReplace);
    if (index !== -1) {
      messages.value.splice(
        index,
        1,
        ...(Array.isArray(newMessages) ? newMessages : [newMessages]),
      );
    }
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
    {
      onBroadcast,
      onFlowStart,
      onMediaUnavailable,
      onCancelled,
      fallbackMessage = '',
    },
  ) {
    if (data.type === 'broadcast') {
      handleBroadcastResponse(answer, data, fallbackMessage, onBroadcast);
    } else if (data.type === 'flowstart') {
      // Insert a flowstart message before the answer
      const answerIndex = messages.value.indexOf(answer);
      messages.value.splice(answerIndex, 0, {
        type: 'flowstart',
        name: data.name,
        question_uuid: null,
        feedback: {
          value: null,
          reason: null,
        },
      });

      if (onFlowStart) onFlowStart(answer, data);
    } else if (data.type === 'media_and_location_unavailable') {
      answer.status = 'loaded';
      answer.type = data.type;

      if (onMediaUnavailable) onMediaUnavailable(answer);
    } else if (data.type === 'cancelled') {
      answer.status = 'loaded';
      removeMessage(answer);

      if (onCancelled) onCancelled();
    }
  }

  function handleBroadcastResponse(answer, data, fallbackMessage, onBroadcast) {
    answer.status = 'loaded';

    const message = get(data, 'message', fallbackMessage);
    const sources = get(data, 'fonts', []);

    if (Array.isArray(message) && message.length > 0) {
      answer.response = message[0];
      answer.sources = sources;

      createAdditionalMessages(message.slice(1), answer.question_uuid, sources);
    } else {
      answer.response = message;
      answer.sources = sources;
    }

    if (onBroadcast) onBroadcast(answer);
  }

  function createAdditionalMessages(items, questionUuid, sources) {
    items.forEach((item) => {
      const additionalMessage = {
        type: 'answer',
        status: 'loaded',
        response: item,
        question_uuid: questionUuid,
        sources,
        feedback: {
          value: null,
          reason: null,
        },
      };
      addMessage(additionalMessage);
    });
  }

  return {
    preview,
    messages,
    messageInput,

    previewInit,
    previewStart,
    previewResume,
    previewHasQuickReplies,

    addMessage,
    clearMessages,
    setMessageInput,
    replaceMessage,
    removeMessage,
    treatAnswerResponse,
  };
});
