<template>
  <section
    :class="['conversations', { 'conversations--empty': !hasConversations }]"
  >
    <SupervisorFilters data-testid="supervisor-filters" />

    <ConversationsTable
      ref="conversationsTable"
      data-testid="conversations-table"
    />
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

const conversationsTable = ref(null);

defineExpose({
  loadMoreConversations: () => conversationsTable.value.loadMoreConversations(),
});
</script>

<style scoped lang="scss">
.conversations {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: $unnnic-spacing-sm;
  align-items: start;

  &--empty {
    height: 100%;
  }
}
</style>
