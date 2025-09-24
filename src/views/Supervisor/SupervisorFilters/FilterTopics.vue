<template>
  <UnnnicFormElement
    :label="$t('agent_builder.supervisor.filters.topic.topic')"
  >
    <UnnnicSelectSmart
      v-model:modelValue="topicFilter"
      data-testid="topic-select"
      :options="topicOptions"
      orderedByIndex
      multiple
      multipleWithoutSelectsMessage
      autocomplete
    />
  </UnnnicFormElement>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const topicOptions = computed(() => [
  {
    label: i18n.global.t(`agent_builder.supervisor.filters.topic.topic`),
    value: '',
  },
  ...supervisorStore.topics,
]);
const topicFilter = ref(
  supervisorStore.getInitialSelectFilter('topics', topicOptions),
);

watch(
  () => topicFilter.value,
  () => {
    supervisorStore.temporaryFilters.topics = topicFilter.value.map(
      (subject) => subject?.label || '',
    );
  },
  { immediate: true, deep: true },
);
</script>
