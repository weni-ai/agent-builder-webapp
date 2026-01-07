<template>
  <table
    class="conversations-table"
    data-testid="conversations-table"
  >
    <template v-if="hasConversations || conversations.status === 'loading'">
      <!-- Temporaly disabled while we're waiting for the endpoint is optimized -->
      <!-- <UnnnicIntelligenceText
        v-if="conversations.status !== 'loading'"
        data-testid="conversations-count"
        class="conversations-table__count"
        tag="p"
        color="neutral-clean"
        family="secondary"
        size="body-gt"
      >
        {{
          $t('agent_builder.supervisor.conversations_count', {
            count: conversations.data.count,
          })
        }}
      </UnnnicIntelligenceText> -->

      <tbody class="conversations-table__rows">
        <ConversationRow
          v-for="conversation in conversations.data.results"
          :key="conversation.uuid"
          data-testid="conversation-row"
          :conversation="conversation"
          :isSelected="
            conversation.uuid === supervisorStore.selectedConversation?.uuid
          "
          @click="handleRowClick(conversation)"
        />

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

import { useSupervisorStore } from '@/store/Supervisor';

import ConversationRow from './ConversationRow.vue';

const supervisorStore = useSupervisorStore();

const conversations = computed(() => supervisorStore.conversations);
const hasConversations = computed(() => conversations.value.data.count > 0);

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
}
</style>
