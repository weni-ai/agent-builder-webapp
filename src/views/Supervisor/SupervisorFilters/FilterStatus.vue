<template>
  <UnnnicFormElement
    :label="$t('agent_builder.supervisor.filters.status.conversations')"
  >
    <UnnnicSelectSmart
      v-model:modelValue="statusFilter"
      data-testid="status-select"
      :options="statusOptions"
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

const getStatusTranslation = (filter) =>
  i18n.global.t(`agent_builder.supervisor.filters.status.${filter}`);

const statusOptions = computed(() => [
  { label: getStatusTranslation('conversations'), value: '' },
  ...[
    'optimized_resolution',
    'other_conclusion',
    'transferred_to_human_support',
    'in_progress',
    'unclassified',
  ].map((value) => ({
    label: getStatusTranslation(value),
    value,
  })),
]);

const statusFilter = ref(
  supervisorStore.getInitialSelectFilter('status', statusOptions),
);

watch(
  () => statusFilter.value,
  () => {
    supervisorStore.temporaryFilters.status = statusFilter.value.map(
      (status) => status?.value || '',
    );
  },
  { immediate: true, deep: true },
);
</script>
