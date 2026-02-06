<template>
  <section
    :class="['conversations', { 'conversations--empty': !hasConversations }]"
  >
    <UnnnicDisclaimer
      type="informational"
      :description="
        $t('agent_builder.supervisor.conversations_v2_disclaimer', {
          day: format(CONVERSATIONS_SWITCH_DATE, 'd'),
        })
      "
      data-testid="supervisor-conversations-v2-disclaimer"
    />

    <SupervisorFilters data-testid="supervisor-filters" />

    <ConversationsTable
      ref="conversationsTable"
      data-testid="conversations-table"
    />
  </section>
</template>

<script setup>
import { ref, defineExpose, computed } from 'vue';

import { format } from 'date-fns';

import SupervisorFilters from '../SupervisorFilters/index.vue';
import ConversationsTable from './ConversationsTable/index.vue';
import { useSupervisorStore } from '@/store/Supervisor';
import { CONVERSATIONS_SWITCH_DATE } from '@/api/nexus/Supervisor';

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
