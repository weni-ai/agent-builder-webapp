<template>
  <section
    :class="['conversations', { 'conversations--empty': !hasConversations }]"
  >
    <SupervisorFilters data-testid="supervisor-filters" />

    <div class="conversations__list">
      <p
        class="conversations__count"
        data-testid="conversations-count"
      >
        {{
          $t('audit.conversations.conversations_count', {
            count: conversationsCount,
          })
        }}
      </p>

      <ConversationsTable
        ref="conversationsTable"
        data-testid="conversations-table"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, defineExpose, computed } from 'vue';

import SupervisorFilters from '../SupervisorFilters/index.vue';
import ConversationsTable from './ConversationsTable/index.vue';
import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const hasConversations = computed(
  () => supervisorStore.conversations.data.results.length > 0,
);

const conversationsCount = computed(
  () => supervisorStore.conversations.data.count ?? 0,
);

const conversationsTable = ref(null);

defineExpose({
  loadMoreConversations: () => conversationsTable.value.loadMoreConversations(),
});
</script>

<style scoped lang="scss">
.conversations {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-space-4;
  align-items: start;

  &--empty {
    height: 100%;
  }

  &__list {
    display: grid;
    grid-template-rows: auto 1fr;
    gap: $unnnic-space-3;
    min-height: 0;
  }

  &__count {
    @include unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;

    margin-left: $unnnic-space-3;
  }
}
</style>
