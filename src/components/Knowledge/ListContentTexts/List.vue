<template>
  <section
    ref="scrollContainer"
    class="list-content-texts__list"
    data-testid="list-content-texts-list"
    @scroll="loadMoreIfNeeded"
  >
    <ContentItem
      v-for="text in itemsFiltered"
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

    <p
      v-if="showNoResults"
      class="list-content-texts__no-results"
      data-testid="list-content-texts-no-results"
    >
      {{ $t('content_bases.new_text.no_results') }}
    </p>
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

const normalizedSearchTerm = computed(() =>
  (contentTexts.value.searchTerm ?? '').trim().toLowerCase(),
);

const itemsFiltered = computed(() => {
  const term = normalizedSearchTerm.value;
  if (!term) return contentTexts.value.data;

  return contentTexts.value.data.filter((text) =>
    (text.title ?? '').toLowerCase().includes(term),
  );
});

const isPaginating = computed(() => contentTexts.value.next !== null);

const loadingPlaceholdersCount = computed(() => {
  if (contentTexts.value.status !== 'loading') return 0;

  const INITIAL_LOADING_PLACEHOLDERS = 8;
  const PAGINATION_LOADING_PLACEHOLDERS = 4;

  return contentTexts.value.data.length === 0
    ? INITIAL_LOADING_PLACEHOLDERS
    : PAGINATION_LOADING_PLACEHOLDERS;
});

// "No results" inline message is only definitive when there's no more pages
// to fetch. While `next !== null`, we keep paginating in the background and
// show skeletons instead of the empty message.
const showNoResults = computed(
  () =>
    !!normalizedSearchTerm.value &&
    itemsFiltered.value.length === 0 &&
    !isPaginating.value &&
    contentTexts.value.status !== 'loading',
);

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
  [
    () => contentTexts.value.status,
    () => contentTexts.value.data.length,
    () => contentTexts.value.searchTerm,
  ],
  loadMoreAfterRender,
);
</script>

<style lang="scss" scoped>
.list-content-texts {
  &__list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: $unnnic-space-4;
    overflow-y: auto;
  }

  &__no-results {
    grid-column: 1 / -1;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-muted;
  }
}
</style>
