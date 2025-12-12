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
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useSupervisorStore } from '@/store/Supervisor';

import { formatListToReadable, formatWhatsappUrn } from '@/utils/formatters';

import Row from './Row.vue';

const supervisorStore = useSupervisorStore();

const conversation = computed(() => supervisorStore.selectedConversation);
const formattedUrn = computed(() => formatWhatsappUrn(conversation.value?.urn));

const formattedTopics = computed(() => {
  const { topics } = conversation.value || '';

  if (topics.length === 0) return '-';
  if (Array.isArray(topics)) return formatListToReadable(topics);
  return topics;
});
</script>
