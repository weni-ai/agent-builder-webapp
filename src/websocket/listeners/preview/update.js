import { useFlowPreviewStore } from '@/store/FlowPreview';
import i18n from '@/utils/plugins/i18n';

export default (message) => {
  const flowPreviewStore = useFlowPreviewStore();

  const lastMessage = flowPreviewStore.messages
    .filter((msg) => msg.type === 'answer')
    .at(-1);

  let answerToTreat = lastMessage;

  if (lastMessage?.status !== 'loading') {
    const answer = {
      type: 'answer',
      text: '',
      status: 'loading',
      question_uuid: null,
    };
    flowPreviewStore.addMessage(answer);
    answerToTreat = answer;
  }

  flowPreviewStore.treatAnswerResponse(answerToTreat, message.content, {
    fallbackMessage: i18n.global.t('quick_test.unable_to_find_an_answer'),
  });
};
