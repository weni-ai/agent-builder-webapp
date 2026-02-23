import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

import useFlowPreview from '@/composables/useFlowPreview';
import { useProjectStore } from '@/store/Project';
import { useManagerSelectorStore } from '@/store/ManagerSelector';

import nexusaiAPI from '@/api/nexusaiAPI';
import i18n from '@/utils/plugins/i18n';
import { getFileType } from '@/utils/medias';

export const useFlowPreviewStore = defineStore('flowPreview', () => {
  const projectStore = useProjectStore();
  const managerSelectorStore = useManagerSelectorStore();

  const { preview, previewInit } = useFlowPreview();

  const messages = ref([]);

  function addMessage(message) {
    messages.value.push(message);
  }

  function clearMessages() {
    messages.value = [];
  }

  function ensurePreviewInitialized() {
    if (preview.value?.contact?.uuid) return;
    previewInit();
  }

  function removeMessage(message) {
    const index = messages.value.indexOf(message);
    if (index !== -1) {
      messages.value.splice(index, 1);
    }
  }

  function isMedia(content) {
    return !!getFileType(content);
  }

  function getPreviewManagerLabel(managerId) {
    const { managers } = managerSelectorStore.options;
    const managerOptions = [managers.new, managers.legacy].filter(
      (manager) => manager?.id,
    );
    const matchedManager = managerOptions.find(
      (manager) => manager.id === managerId,
    );

    return matchedManager?.label || managerId;
  }

  function addManagerSelectedMessage(managerId) {
    if (!managerId) return;

    addMessage({
      type: 'manager_selected',
      name: getPreviewManagerLabel(managerId),
      question_uuid: null,
    });
  }

  function treatAnswerResponse(answer, data, { fallbackMessage = '' }) {
    if (data?.type === 'broadcast') {
      handleBroadcastResponse(answer, data, fallbackMessage);
    }
  }

  function handleBroadcastResponse(answer, data, fallbackMessage) {
    answer.status = 'loaded';

    const message = data?.message ?? fallbackMessage;

    if (Array.isArray(message) && message.length > 0) {
      answer.response = message[0];

      createAdditionalMessages(message.slice(1), answer.question_uuid);
    } else {
      answer.response = message;
    }
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

  function sendOrder(order) {
    addMessage({
      type: 'order',
      text: JSON.stringify(order),
      status: 'loaded',
      question_uuid: null,
    });
  }

  async function uploadQuestionMedia(question) {
    const isGeolocationMedia = typeof question === 'string';
    if (isGeolocationMedia) {
      return `geo:${question}`;
    }

    const {
      data: { file_url },
    } = await nexusaiAPI.router.preview.uploadFile({
      projectUuid: projectStore.uuid,
      file: question,
    });

    return file_url;
  }

  async function answer(question, { fallbackMessage } = {}) {
    const answerMessage = reactive({
      type: 'answer',
      text: '',
      status: 'loading',
      question_uuid: null,
    });

    addMessage(answerMessage);

    const handleError = () => {
      removeMessage(answerMessage);
    };

    let questionMediaUrl;
    const isQuestionMedia = isMedia(question);
    if (isQuestionMedia) {
      try {
        questionMediaUrl = await uploadQuestionMedia(question);
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
        contact_urn: preview.value.contact.urn,
        manager_uuid: managerSelectorStore.selectedPreviewManager,
      });

      treatAnswerResponse(answerMessage, data, {
        fallbackMessage:
          fallbackMessage ??
          i18n.global.t('quick_test.unable_to_find_an_answer'),
      });
    } catch {
      handleError();
    }
  }

  function sendMessage(messageText, { delayMs = 400, fallbackMessage } = {}) {
    if (!messageText) return;

    ensurePreviewInitialized();

    addMessage({
      type: 'question',
      text: messageText,
    });

    setTimeout(() => {
      answer(messageText, { fallbackMessage });
    }, delayMs);
  }

  return {
    preview,
    messages,

    previewInit,

    addMessage,
    clearMessages,
    ensurePreviewInitialized,
    removeMessage,
    addManagerSelectedMessage,
    treatAnswerResponse,
    isMedia,
    sendMessage,
    sendOrder,
  };
});
