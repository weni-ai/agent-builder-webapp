<template>
  <table
    class="conversations-table"
    data-testid="conversations-table"
  >
    <template v-if="hasConversations || conversations.status === 'loading'">
      <tbody class="conversations-table__rows">
        <template
          v-for="(conversation, index) in conversationResults"
          :key="conversation.uuid"
        >
          <tr
            v-if="separatorIndex === index"
            class="conversations-table__separator"
            data-testid="conversations-separator"
          >
            <td class="conversations-table__separator-text">
              {{ $t('agent_builder.supervisor.conversations_separator') }}
            </td>
          </tr>
          <ConversationRow
            data-testid="conversation-row"
            :conversation="conversation"
            :showDivider="shouldShowDivider(index)"
            :isSelected="
              conversation.uuid === supervisorStore.selectedConversation?.uuid
            "
            @click="handleRowClick(conversation)"
          />
        </template>

        <template v-if="conversations.status === 'loading'">
          <ConversationRow
            v-for="i in 8"
            :key="i"
            isLoading
          />
        </template>
      </tbody>
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
        {{ $t('agent_builder.supervisor.conversations_empty') }}
      </p>
    </section>
  </table>
</template>

<script setup>
import { computed, ref, watch, defineExpose } from 'vue';
import { isEqual } from 'lodash';

import { NEW_SOURCE } from '@/api/adapters/supervisor/conversationSources';
import { useSupervisorStore } from '@/store/Supervisor';

import ConversationRow from './ConversationRow.vue';

const supervisorStore = useSupervisorStore();

const conversations = computed(() => supervisorStore.conversations);
const hasConversations = computed(
  () => conversations.value.data.results.length > 0,
);
const conversationResults = computed(
  () => conversations.value.data.results || [],
);
const separatorIndex = computed(() => {
  const results = conversationResults.value;

  if (!results.length) return -1;

  const firstLegacyIndex = results.findIndex(
    (conversation) => conversation.source !== NEW_SOURCE,
  );
  const hasNew = results.some(
    (conversation) => conversation.source === NEW_SOURCE,
  );

  if (!hasNew || firstLegacyIndex <= 0) return -1;

  return firstLegacyIndex;
});

const pagination = ref({
  page: 1,
  interval: 15,
});

function handleRowClick(row) {
  supervisorStore.selectConversation(row.uuid);
}

function shouldShowDivider(index) {
  const lastIndex = conversationResults.value.length - 1;

  if (index >= lastIndex) return false;

  if (separatorIndex.value !== -1 && index === separatorIndex.value - 1) {
    return false;
  }

  return true;
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

  &__count {
    margin-bottom: $unnnic-spacing-xs;
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

  &__separator {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: $unnnic-space-2;

    td {
      text-align: center;
      font: $unnnic-font-body;
      color: $unnnic-color-fg-base;
    }

    &::before,
    &::after {
      content: '';
      display: block;
      background-color: $unnnic-color-gray-200;
      width: 100%;
      height: 1px;
    }
  }
}
</style>
