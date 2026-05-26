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
    next: null,
    searchTerm: '',
  });

  async function loadContentTexts() {
    contentTexts.status = 'loading';

    try {
      const { data } = await nexusaiAPI.knowledge.texts.list();

      contentTexts.data = orderByLastUpdatedAt(data?.results);
      contentTexts.next = data?.next ?? null;
      contentTexts.status = 'complete';
    } catch {
      contentTexts.data = [];
      contentTexts.next = null;
      contentTexts.status = 'error';
    }
  }

  async function loadNextContentTexts() {
    if (!contentTexts.next || contentTexts.status === 'loading') return;

    contentTexts.status = 'loading';

    try {
      const { data } = await nexusaiAPI.knowledge.texts.list({
        next: contentTexts.next,
      });

      const existingUuids = new Set(contentTexts.data.map(({ uuid }) => uuid));
      const newItems = (data?.results ?? []).filter(
        ({ uuid }) => !existingUuids.has(uuid),
      );

      contentTexts.data = orderByLastUpdatedAt([
        ...contentTexts.data,
        ...newItems,
      ]);
      contentTexts.next = data?.next ?? null;
      contentTexts.status = 'complete';
    } catch {
      contentTexts.status = 'error';
    }
  }

  async function getContentText(uuid) {
    const cached = contentTexts.data.find((item) => item.uuid === uuid);
    if (cached) return cached;

    const { data } = await nexusaiAPI.knowledge.texts.read({ uuid });

    const existingIndex = contentTexts.data.findIndex(
      (item) => item.uuid === data.uuid,
    );

    if (existingIndex === -1) {
      contentTexts.data = orderByLastUpdatedAt([...contentTexts.data, data]);
    } else {
      contentTexts.data[existingIndex] = data;
    }

    return data;
  }

  return {
    contentText,
    contentTexts,
    loadContentTexts,
    loadNextContentTexts,
    getContentText,
  };
});
