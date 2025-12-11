<template>
  <table class="details__table">
    <tbody>
      <Row
        :label="$t('agent_builder.supervisor.contact_urn')"
        :data="formattedUrn"
      />

      <Row
        :label="$t('agent_builder.supervisor.topic')"
        :data="formattedTopics"
      />

      <template v-if="!isCollapsed">
        <Row
          :label="$t('agent_builder.supervisor.filters.csat.csat')"
          :data="formattedCsat"
        />
      </template>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useSupervisorStore } from '@/store/Supervisor';

import { formatListToReadable, formatWhatsappUrn } from '@/utils/formatters';

import Row from './Row.vue';
import i18n from '@/utils/plugins/i18n';

defineProps<{
  isCollapsed: boolean;
}>();

const supervisorStore = useSupervisorStore();

const conversation = computed(() => supervisorStore.selectedConversation);

const formattedUrn = computed(() => formatWhatsappUrn(conversation.value?.urn));
const formattedTopics = computed(() => {
  const { topics } = conversation.value || '';

  if (topics.length === 0) return '-';
  if (Array.isArray(topics)) return formatListToReadable(topics);
  return topics;
});
const formattedCsat = computed(() => {
  const { csat } = conversation.value || '';

  if (!csat) return '-';
  return `${i18n.global.t(
    `agent_builder.supervisor.filters.csat.${csat.id}`,
  )} | CSAT: ${csat.score}`;
});
</script>

<style scoped lang="scss">
.details__table {
  width: fit-content;
}
</style>
