<template>
  <section class="conversations-table">
    <ConversationsSearch />

    <UnnnicTableNext
      v-model:pagination="pagination.page"
      :class="{
        'conversations-table__table': true,
        'conversations-table__table--with-results':
          supervisorStore.conversations.status === 'complete' &&
          conversations.results.length,
      }"
      data-testid="conversations-table"
      hideHeaders
      :headers="table.headers"
      :rows="table.rows"
      :paginationTotal="conversations.count"
      :paginationInterval="pagination.interval"
      :isLoading="supervisorStore.conversations.status === 'loading'"
      @row-click="handleRowClick"
    />
  </section>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import Unnnic from '@weni/unnnic-system';

import { useOldSupervisorStore } from '@/store/OldSupervisor';

import i18n from '@/utils/plugins/i18n';

import ConversationInfos from './ConversationInfos.vue';
import ConversationDate from './ConversationDate.vue';
import ConversationsSearch from './ConversationsSearch.vue';

const t = (key) => i18n.global.t(key);
const supervisorStore = useOldSupervisorStore();

const conversations = computed(() => supervisorStore.conversations.data);

const pagination = ref({
  page: 1,
  interval: 15,
});

function handleRowClick(row) {
  supervisorStore.selectConversation(null);
  nextTick(() => {
    supervisorStore.selectConversation(row.id);
  });
}

const table = computed(() => {
  const getTagProps = (human_support) => {
    if (human_support) {
      return {
        scheme: 'aux-blue-500',
        leftIcon: 'forward',
        text: t('agent_builder.supervisor.forwarded_human_support.title'),
      };
    }

    return {
      scheme: 'aux-green-500',
      leftIcon: 'check',
      text: t('agent_builder.supervisor.attended_by_agent.title'),
    };
  };
  return {
    headers: [
      { content: '' },
      { content: '', size: 'auto' },
      { content: '', size: 'auto' },
    ],
    rows: conversations.value.results?.map(
      ({ urn, created_on, last_message, human_support, id }) => {
        const dateComponent = {
          component: ConversationDate,
          props: {
            date: created_on,
          },
        };

        const tagComponent = {
          component: Unnnic.unnnicTag,
          props: {
            type: 'default',
            ...getTagProps(human_support),
          },
        };

        const infoComponent = {
          component: ConversationInfos,
          props: {
            urn,
            lastMessage: last_message,
          },
        };

        return {
          content: [infoComponent, tagComponent, dateComponent],
          id,
        };
      },
    ),
  };
});

const selectedConversationIndex = computed(() =>
  conversations.value.results?.findIndex(
    (conversation) =>
      conversation.id === supervisorStore.selectedConversation?.id,
  ),
);

function highlightRow(index) {
  const rowsElements = document.querySelectorAll(
    '.unnnic-table-next__body-row',
  );

  rowsElements.forEach((row) => {
    row.style.backgroundColor = '';
  });

  if (rowsElements[index]) {
    const UNNNIC_COLOR_BACKGROUND_SKY = '#F4F6F8';
    rowsElements[index].style.backgroundColor = UNNNIC_COLOR_BACKGROUND_SKY;
  }
}

watch(selectedConversationIndex, (newConversation) => {
  highlightRow(newConversation);
});

watch(
  () => supervisorStore.filters,
  async () => {
    await supervisorStore.loadConversations();

    const { selectedConversation, filters } = supervisorStore;
    if (filters.conversationId && !selectedConversation) {
      supervisorStore.selectConversation(filters.conversationId);
    }
  },
  { immediate: true, deep: true },
);

watch(
  [
    () => supervisorStore.filters.search,
    () => supervisorStore.filters.start,
    () => supervisorStore.filters.end,
  ],
  ([newSearch, newStart, newEnd], [oldSearch, oldStart, oldEnd]) => {
    if (newSearch !== oldSearch || newStart !== oldStart || newEnd !== oldEnd) {
      pagination.value.page = 1;
    }
  },
);

watch(
  () => pagination.value.page,
  (newPage) => {
    supervisorStore.loadConversations(newPage);
  },
);
</script>

<style scoped lang="scss">
.conversations-table {
  display: grid;
  gap: $unnnic-spacing-xs;

  &__table {
    :deep(.unnnic-table-next__body) {
      .unnnic-table-next__body-row {
        $table-radius: $unnnic-border-radius-md;

        &:first-child {
          border-radius: $table-radius $table-radius 0 0;
        }

        &:last-child {
          border-radius: 0 0 $table-radius $table-radius;
        }
      }

      .unnnic-table-next__body-cell:nth-child(2) {
        padding: $unnnic-spacing-ant 0;
      }
    }

    &--with-results {
      :deep(.unnnic-table-next__body-row):hover {
        background-color: $unnnic-color-background-sky;

        cursor: pointer;
      }
    }
  }
}
</style>
