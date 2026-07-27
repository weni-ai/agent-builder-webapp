<template>
  <UnnnicFormElement
    :label="$t('audit.conversations.filters.status.conversations')"
  >
    <UnnnicMultiSelect
      v-model:modelValue="statusFilter"
      data-testid="status-select"
      :options="statusOptions"
      :placeholder="$t('audit.conversations.filters.status.conversations')"
      clearable
    />
  </UnnnicFormElement>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const getStatusTranslation = (filter) =>
  i18n.global.t(`audit.conversations.filters.status.${filter}`);

const statusOptions = computed(() =>
  [
    'optimized_resolution',
    'other_conclusion',
    'transferred_to_human_support',
    'in_progress',
    'unclassified',
  ].map((value) => ({
    label: getStatusTranslation(value),
    value,
  })),
);

const statusFilter = ref(
  supervisorStore.getInitialSelectFilter('status', statusOptions),
);

watch(
  statusFilter,
  (selected) => {
    supervisorStore.temporaryFilters.status = [...selected];
  },
  { immediate: true, deep: true },
);
</script>
