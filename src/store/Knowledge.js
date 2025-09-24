
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useKnowledgeStore = defineStore('Knowledge', () => {
  const contentText = reactive({
    uuid: null,
    current: '',
    old: '',
  });

  return {
    contentText,
  };
});
