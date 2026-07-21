<template>
  <UnnnicFormElement :label="$t('audit.conversations.filters.topic.topic')">
    <UnnnicMultiSelect
      v-model:modelValue="topicFilter"
      data-testid="topic-select"
      :options="topicOptions"
      :placeholder="$t('audit.conversations.filters.topic.topic')"
      enableSearch
      clearable
    />
  </UnnnicFormElement>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const UNCLASSIFIED_TOPIC = {
  label: i18n.global.t('audit.conversations.filters.topic.unclassified'),
  value: 'unclassified',
};

const topicOptions = computed(() => [
  UNCLASSIFIED_TOPIC,
  ...supervisorStore.topics,
]);

const topicFilter = ref(
  supervisorStore.getInitialSelectFilter('topics', topicOptions),
);

watch(
  topicFilter,
  (selectedValues) => {
    supervisorStore.temporaryFilters.topics = selectedValues.map((value) => {
      if (value === UNCLASSIFIED_TOPIC.value) return value;

      const option = topicOptions.value.find((topic) => topic.value === value);
      return option?.label || '';
    });
  },
  { immediate: true, deep: true },
);
</script>
