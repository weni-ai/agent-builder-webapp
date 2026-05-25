import { defineStore } from 'pinia';
import { reactive } from 'vue';
import nexusaiAPI from '@/api/nexusaiAPI';

function orderByLastUpdatedAt(array) {
  if (!Array.isArray(array)) return [];

  return array.sort(
    (a, b) => new Date(b.last_updated_at) - new Date(a.last_updated_at),
  );
}

export const useKnowledgeStore = defineStore('Knowledge', () => {
  const contentText = reactive({
    uuid: null,
    current: '',
    old: '',
  });

  const contentTexts = reactive({
    data: [],
    status: null,
  });

  async function loadContentTexts() {
    contentTexts.status = 'loading';

    try {
      const { data } = await nexusaiAPI.knowledge.texts.list();

      contentTexts.data = orderByLastUpdatedAt(data?.results);

      contentTexts.status = 'complete';
    } catch {
      contentTexts.data = [];
      contentTexts.status = 'error';
    }
  }

  return {
    contentText,
    contentTexts,
    loadContentTexts,
  };
});
