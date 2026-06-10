<template>
  <section
    ref="scrollContainer"
    class="list-content-texts__list"
    data-testid="list-content-texts-list"
    @scroll="loadMoreIfNeeded"
  >
    <ContentItem
      v-for="text in contentTexts.data"
      :key="text.uuid"
      :file="toItemFile(text)"
      timeAgoLabelKey="time_ago_edited"
      clickable
      compressed
      data-testid="list-content-texts-item"
      @click="goToContentText(text.uuid)"
    />

    <ContentItem
      v-for="i in loadingPlaceholdersCount"
      :key="`loading-${i}`"
      loading
      compressed
      data-testid="list-content-texts-loading-item"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

import ContentItem from '@/components/Knowledge/ContentBase/ContentItem.vue';
import { useKnowledgeStore } from '@/store/Knowledge';

const router = useRouter();
const knowledgeStore = useKnowledgeStore();
const { contentTexts } = storeToRefs(knowledgeStore);

const scrollContainer = ref(null);

const loadingPlaceholdersCount = computed(() => {
  if (contentTexts.value.status !== 'loading') return 0;

  const INITIAL_LOADING_PLACEHOLDERS = 8;
  const PAGINATION_LOADING_PLACEHOLDERS = 4;

  return contentTexts.value.data.length === 0
    ? INITIAL_LOADING_PLACEHOLDERS
    : PAGINATION_LOADING_PLACEHOLDERS;
});

const toItemFile = (text) => ({
  uuid: text.uuid,
  created_file_name: text.title,
  created_at: text.last_updated_at,
  extension_file: 'text',
  status: 'uploaded',
});

const goToContentText = (uuid) => {
  router.push({ name: 'content-text', params: { uuid } });
};

const SCROLL_THRESHOLD = 16;

function loadMoreIfNeeded() {
  const element = scrollContainer.value;
  if (!element) return;
  if (!contentTexts.value.next) return;
  if (contentTexts.value.status === 'loading') return;

  const { scrollTop, clientHeight, scrollHeight } = element;
  const reachedBottom =
    scrollTop + clientHeight + SCROLL_THRESHOLD >= scrollHeight;

  if (!reachedBottom) return;

  knowledgeStore.loadNextContentTexts();
}

async function loadMoreAfterRender() {
  await nextTick();
  loadMoreIfNeeded();
}

onMounted(loadMoreAfterRender);

watch(
  [() => contentTexts.value.status, () => contentTexts.value.data.length],
  loadMoreAfterRender,
);
</script>

<style lang="scss" scoped>
.list-content-texts__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $unnnic-space-4;
  overflow-y: auto;
}
</style>
