<template>
  <section
    :class="[
      'supervisor',
      { 'supervisor--with-conversation': selectedConversation },
    ]"
  >
    <section
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
</template>

<script setup>
import { computed, onBeforeMount, watch, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import SupervisorHeader from './SupervisorHeader.vue';
import SupervisorConversations from './SupervisorConversations/index.vue';
import Conversation from './SupervisorConversations/Conversation/index.vue';

import { useSupervisorStore } from '@/store/Supervisor';
import { cleanParams } from '@/utils/http';

const supervisorStore = useSupervisorStore();
const router = useRouter();
const route = useRoute();

const supervisorConversations = ref(null);

const selectedConversation = computed(() => {
  return supervisorStore.selectedConversation;
});

function updateQuery(filters = supervisorStore.filters) {
  const cleanedFilters = cleanParams(filters);
  router.replace({
    query: {
      ...cleanedFilters,
    },
  });
}

function loadConversations(event) {
  const { next } = supervisorStore.conversations.data;

  if (
    !next ||
    ['loading', 'error'].includes(supervisorStore.conversations.status)
  ) {
    return;
  }

  const { scrollTop, clientHeight, scrollHeight } = event.target;

  const safeDistance = 10;
  const isInScrollBottom =
    scrollTop + clientHeight + safeDistance >= scrollHeight;

  const shouldLoadMore = isInScrollBottom;

  if (shouldLoadMore) {
    supervisorConversations.value.loadMoreConversations();
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
