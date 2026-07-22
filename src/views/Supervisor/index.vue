<template>
  <section
    :class="[
      'supervisor',
      {
        'supervisor--with-conversation':
          isConversationsRoute && selectedConversation,
      },
    ]"
  >
    <section
      ref="scrollContainer"
      :class="[
        'supervisor__content',
        { 'supervisor__content--with-scroll': hasScroll },
      ]"
      @scroll="loadConversations"
    >
      <SupervisorHeader
        class="supervisor__header"
        data-testid="header"
      />
      <SupervisorConversations
        v-if="isConversationsRoute"
        ref="supervisorConversations"
        class="supervisor__conversations"
        data-testid="supervisor-conversations"
      />

      <RouterView v-else />
    </section>
    <Conversation
      v-if="isConversationsRoute && selectedConversation"
      class="supervisor__conversation"
      data-testid="supervisor-conversation"
    />
  </section>
</template>

<script setup>
import {
  computed,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  watch,
  ref,
  nextTick,
} from 'vue';
import { useRouter, useRoute, RouterView } from 'vue-router';

import SupervisorHeader from './SupervisorHeader.vue';
import SupervisorConversations from './SupervisorConversations/index.vue';
import Conversation from './SupervisorConversations/Conversation/index.vue';

import { hasMoreToLoad } from '@/api/adapters/supervisor/conversationSources';
import { useSupervisorStore } from '@/store/Supervisor';
import { cleanParams } from '@/utils/http';

const supervisorStore = useSupervisorStore();
const router = useRouter();
const route = useRoute();

const supervisorConversations = ref(null);
const scrollContainer = ref(null);
const isCheckingScroll = ref(false);
const hasScroll = ref(false);

const selectedConversation = computed(() => {
  return supervisorStore.selectedConversation;
});

const isConversationsRoute = computed(() => route.name === 'conversations');

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
  return hasMoreToLoad(
    supervisorStore.conversations.data,
    supervisorStore.conversations.status,
  );
}

function isScrollReachedBottom() {
  const { scrollTop, clientHeight, scrollHeight } = scrollContainer.value;

  const SAFE_DISTANCE = 10;
  const isInScrollBottom =
    scrollTop + clientHeight + SAFE_DISTANCE >= scrollHeight;

  return isInScrollBottom;
}

function updateHasScroll() {
  const container = scrollContainer.value;
  const next = !!container && container.scrollHeight > container.clientHeight;

  if (hasScroll.value !== next) {
    hasScroll.value = next;
  }
}

async function checkAndLoadMoreIfNeeded() {
  if (isCheckingScroll.value) return;

  isCheckingScroll.value = true;

  try {
    await nextTick();

    updateHasScroll();

    if (!scrollContainer.value) return;

    if (!hasMoreConversationsToLoad()) return;

    if (!hasScroll.value) {
      supervisorConversations.value?.loadMoreConversations?.();
    }
  } finally {
    isCheckingScroll.value = false;
  }
}

function loadConversations() {
  if (!hasMoreConversationsToLoad()) return;

  const shouldLoadMore = isScrollReachedBottom();

  if (shouldLoadMore) {
    supervisorConversations.value?.loadMoreConversations?.();
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

watch([isConversationsRoute, selectedConversation], async () => {
  await nextTick();
  updateHasScroll();
});

onBeforeMount(async () => {
  updateQuery();

  const { selectedConversation, queryConversationUuid } = supervisorStore;

  if (queryConversationUuid && !selectedConversation) {
    supervisorStore.selectConversation(queryConversationUuid);
  }
});

onMounted(() => {
  updateHasScroll();
  window.addEventListener('resize', updateHasScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHasScroll);
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

    overflow-y: auto;

    margin: $unnnic-spacing-sm 0;

    &--with-scroll {
      $scroll-margin: calc($unnnic-spacing-nano / 2 + $unnnic-spacing-nano);

      padding-right: $scroll-margin;
      margin-right: $scroll-margin;
    }
  }

  :deep(.supervisor__header) {
    padding: 0 $unnnic-space-4 $unnnic-space-4;
  }

  &__conversations {
    padding: 0 $unnnic-space-4;
  }
}
</style>
