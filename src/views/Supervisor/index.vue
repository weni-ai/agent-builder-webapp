<template>
  <section
    v-if="featureFlagsStore.flags.newSupervisor"
    :class="[
      'supervisor',
      { 'supervisor--with-conversation': selectedConversation },
    ]"
  >
    <section
      ref="scrollContainer"
      class="supervisor__content"
      @scroll="loadConversations"
    >
      <SupervisorHeader
        class="supervisor__header"
        data-testid="header"
      />
      <SupervisorConversations
        ref="supervisorConversations"
        class="supervisor__conversations"
        data-testid="supervisor-conversations"
      />
    </section>
    <Conversation
      v-if="selectedConversation"
      class="supervisor__conversation"
      data-testid="supervisor-conversation"
    />
  </section>
  <OldSupervisor v-else />
</template>

<script setup>
import { computed, onBeforeMount, watch, ref, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import SupervisorHeader from './SupervisorHeader.vue';
import SupervisorConversations from './SupervisorConversations/index.vue';
import Conversation from './SupervisorConversations/Conversation/index.vue';
import OldSupervisor from '@/views/OldSupervisor/index.vue';

import { useSupervisorStore } from '@/store/Supervisor';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';
import { cleanParams } from '@/utils/http';

const supervisorStore = useSupervisorStore();
const featureFlagsStore = useFeatureFlagsStore();
const router = useRouter();
const route = useRoute();

const supervisorConversations = ref(null);
const scrollContainer = ref(null);
const isCheckingScroll = ref(false);

const selectedConversation = computed(() => {
  return supervisorStore.selectedConversation;
});

const conversations = computed(() => supervisorStore.conversations);

function updateQuery(filters = supervisorStore.filters) {
  const cleanedFilters = cleanParams(filters);
  router.replace({
    query: {
      ...cleanedFilters,
    },
  });
}

function hasMoreConversationsToLoad() {
  const { next } = supervisorStore.conversations.data;
  const isLoading = supervisorStore.conversations.status === 'loading';
  const hasError = supervisorStore.conversations.status === 'error';

  return next && !isLoading && !hasError;
}

function isScrollReachedBottom() {
  const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;

  const SAFE_DISTANCE = 10;
  const isInScrollBottom =
    scrollTop + clientHeight + SAFE_DISTANCE >= scrollHeight;

  return isInScrollBottom;
}

function hasScrollbar() {
  const container = scrollContainer.value;
  return container.scrollHeight > container.clientHeight;
}

async function checkAndLoadMoreIfNeeded() {
  if (isCheckingScroll.value) return;

  isCheckingScroll.value = true;

  try {
    await nextTick();

    if (!scrollContainer.value) return;

    if (!hasMoreConversationsToLoad()) return;

    if (!hasScrollbar()) {
      supervisorConversations.value?.loadMoreConversations();
    }
  } finally {
    isCheckingScroll.value = false;
  }
}

function loadConversations() {
  if (!hasMoreConversationsToLoad()) return;

  const shouldLoadMore = isScrollReachedBottom();

  if (shouldLoadMore) {
    supervisorConversations.value?.loadMoreConversations();
  }
}

watch(
  () => supervisorStore.filters,
  () => {
    updateQuery();
  },
  { deep: true },
);

watch(
  () => supervisorStore.queryConversationUuid,
  (conversationUuid) => {
    updateQuery({
      ...route.query,
      conversationUuid,
    });
  },
);

watch(
  () => conversations.value.data.results?.length,
  () => {
    checkAndLoadMoreIfNeeded();
  },
  { immediate: true },
);

onBeforeMount(async () => {
  updateQuery();

  const { selectedConversation, queryConversationUuid } = supervisorStore;

  if (queryConversationUuid && !selectedConversation) {
    supervisorStore.selectConversation(queryConversationUuid);
  }
});
</script>

<style lang="scss" scoped>
.supervisor {
  margin: -$unnnic-spacing-sm;

  min-height: 100%;

  display: grid;

  overflow: hidden;

  &--with-conversation {
    grid-template-columns: 7fr 5fr;
  }

  &__content {
    display: flex;
    flex-direction: column;

    $scroll-margin: calc($unnnic-spacing-nano / 2 + $unnnic-spacing-nano);

    overflow-y: auto;

    margin: $unnnic-spacing-sm 0;
    padding-right: $scroll-margin;
    margin-right: $scroll-margin;
  }

  :deep(.supervisor__header) {
    padding: 0 $unnnic-spacing-sm $unnnic-spacing-md;
  }

  &__conversations {
    padding-left: $unnnic-spacing-sm;

    & > * {
      margin-right: $unnnic-spacing-sm;
    }
  }
}
</style>
