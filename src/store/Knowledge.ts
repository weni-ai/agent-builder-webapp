import { defineStore } from 'pinia';
import { reactive } from 'vue';
import nexusaiAPI from '@/api/nexusaiAPI';
import type { ContentText } from './types/Knowledge.types';

function lastActivityAt(item: ContentText) {
  return new Date(item.last_updated_at ?? item.created_at).getTime();
}

function orderByLastActivity(array) {
  if (!Array.isArray(array)) return [];

  return array.sort((a, b) => lastActivityAt(b) - lastActivityAt(a));
}

export const useKnowledgeStore = defineStore('Knowledge', () => {
  const contentText = reactive({
    uuid: null,
    current: '',
    old: '',
  });

  const contentTexts = reactive({
    data: [] as ContentText[],
    status: null,
    next: null,
    searchTerm: '',
  });

  async function loadContentTexts() {
    contentTexts.status = 'loading';

    try {
      const { data } = await nexusaiAPI.knowledge.texts.list();

      contentTexts.data = orderByLastActivity(data?.results);
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

      contentTexts.data = orderByLastActivity([
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
    // Cached items from the list endpoint don't include the `text` body,
    // so we still need to fetch when it's missing.
    if (cached && 'text' in cached) return cached;

    const { data } = await nexusaiAPI.knowledge.texts.read({ uuid });

    const existingIndex = contentTexts.data.findIndex(
      (item) => item.uuid === data.uuid,
    );

    if (existingIndex === -1) {
      contentTexts.data = orderByLastActivity([...contentTexts.data, data]);
    } else {
      contentTexts.data[existingIndex] = {
        ...contentTexts.data[existingIndex],
        ...data,
      };
      contentTexts.data = orderByLastActivity([...contentTexts.data]);
    }

    return data;
  }

  async function patchContentText(uuid, payload) {
    const { data } = await nexusaiAPI.knowledge.texts.patch({
      uuid,
      payload,
    });

    const index = contentTexts.data.findIndex((item) => item.uuid === uuid);

    if (index === -1) {
      contentTexts.data = orderByLastActivity([...contentTexts.data, data]);
    } else {
      contentTexts.data[index] = { ...contentTexts.data[index], ...data };
      contentTexts.data = orderByLastActivity([...contentTexts.data]);
    }

    return data;
  }

  async function createContentText({
    text,
    title,
  }: {
    text: string;
    title: string;
  }): Promise<ContentText> {
    const { data } = await nexusaiAPI.knowledge.texts.create({ text, title });

    contentTexts.data = orderByLastActivity([data, ...contentTexts.data]);

    return data;
  }

  async function deleteContentText(uuid) {
    await nexusaiAPI.knowledge.texts.delete({ uuid });

    contentTexts.data = contentTexts.data.filter((item) => item.uuid !== uuid);
  }

  return {
    contentText,
    contentTexts,
    loadContentTexts,
    loadNextContentTexts,
    getContentText,
    patchContentText,
    createContentText,
    deleteContentText,
  };
});
