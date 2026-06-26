<template>
  <div
    :class="[
      'conversations-table',
      { 'conversations-table--selected': supervisorStore.selectedConversation },
    ]"
    data-testid="conversations-table"
  >
    <template v-if="hasConversations || conversations.status === 'loading'">
      <UnnnicTable version="2">
        <UnnnicTableHeader class="conversations-table__header">
          <UnnnicTableRow>
            <UnnnicTableHead
              v-for="column in columns"
              :key="`conversation-table-head-${column}`"
              :class="`conversations-table__col conversations-table__col--${column}`"
            >
              {{ $t(`audit.conversations.columns.${column}`) }}
            </UnnnicTableHead>
          </UnnnicTableRow>
        </UnnnicTableHeader>

        <UnnnicTableBody class="conversations-table__rows">
          <template
            v-for="conversation in conversationResults"
            :key="conversation.uuid"
          >
            <ConversationRow
              data-testid="conversation-row"
              :conversation="conversation"
              :isSelected="
                conversation.uuid === supervisorStore.selectedConversation?.uuid
              "
              @click="handleRowClick(conversation)"
            />
          </template>
        </UnnnicTableBody>
      </UnnnicTable>

      <template v-if="conversations.status === 'loading'">
        <UnnnicSkeletonLoading
          v-for="i in 8"
          :key="i"
          tag="div"
          width="100%"
          height="68px"
        />
      </template>
    </template>

    <section
      v-else
      class="conversations-table__empty"
    >
      <UnnnicIcon
        icon="chat_bubble"
        size="avatar-sm"
        scheme="gray-100"
        filled
      />

      <p class="conversations-table__empty-title">
        {{ $t('audit.conversations.conversations_empty') }}
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref, watch, defineExpose } from 'vue';
import { isEqual } from 'lodash';

import { useSupervisorStore } from '@/store/Supervisor';

import ConversationRow from './ConversationRow.vue';

const supervisorStore = useSupervisorStore();

const conversations = computed(() => supervisorStore.conversations);
const hasConversations = computed(() => conversations.value.data.count > 0);
const conversationResults = computed(
  () => conversations.value.data.results || [],
);

const columns = computed(() => [
  'contact',
  'status',
  'feedback',
  'date',
  'hour',
]);

const pagination = ref({
  page: 1,
  interval: 15,
});

function handleRowClick(row) {
  supervisorStore.selectConversation(row.uuid);
}

function loadMoreConversations() {
  pagination.value.page++;
  supervisorStore.loadConversations(pagination.value.page);
}

watch(
  [
    () => supervisorStore.filters.start,
    () => supervisorStore.filters.end,
    () => supervisorStore.filters.search,
    () => supervisorStore.filters.status,
    () => supervisorStore.filters.csat,
    () => supervisorStore.filters.topics,
  ],
  (newValue, oldValue) => {
    const hasFiltersChanged = !isEqual(newValue, oldValue);

    if (!hasFiltersChanged) return;

    pagination.value.page = 1;
    supervisorStore.loadConversations();
  },
  { immediate: true, deep: true },
);

defineExpose({
  loadMoreConversations,
});
</script>

<style scoped lang="scss">
.conversations-table {
  margin-right: 0;
  margin-bottom: $unnnic-spacing-sm;

  height: 100%;

  overflow: hidden;

  display: flex;
  flex-direction: column;

  :deep(.conversations-table__col--contact),
  :deep(.conversations-table__col--status),
  :deep(.conversations-table__col--feedback) {
    width: calc(100% / 12 * 3);
  }

  :deep(.conversations-table__col--date) {
    width: calc(100% / 12 * 1);
  }

  :deep(.conversations-table__col--hour) {
    width: calc(100% / 12 * 2);
  }

  &--selected {
    :deep(.conversations-table__col--contact),
    :deep(.conversations-table__col--status),
    :deep(.conversations-table__col--feedback) {
      width: calc(100% / 12 * 2);
    }

    :deep(.conversations-table__col--hour) {
      width: calc(100% / 12 * 1);
    }
  }

  &__empty {
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    gap: $unnnic-spacing-nano;

    &-title {
      font: $unnnic-font-display-3;
      color: $unnnic-color-gray-900;
    }
  }
}
</style>
