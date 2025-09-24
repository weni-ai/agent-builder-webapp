<template>
  <UnnnicFormElement :label="$t('agent_builder.supervisor.filters.csat.csat')">
    <UnnnicSelectSmart
      v-model:modelValue="csatFilter"
      data-testid="csat-select"
      :options="csatOptions"
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

const getCsatTranslation = (filter) =>
  i18n.global.t(`agent_builder.supervisor.filters.csat.${filter}`);

const csatOptions = computed(() => [
  { label: getCsatTranslation('csat'), value: '' },
  ...[
    'very_satisfied',
    'satisfied',
    'neutral',
    'dissatisfied',
    'very_dissatisfied',
  ].map((value) => ({
    label: getCsatTranslation(value),
    value,
  })),
]);

const csatFilter = ref(
  supervisorStore.getInitialSelectFilter('csat', csatOptions),
);

watch(
  () => csatFilter.value,
  () => {
    supervisorStore.temporaryFilters.csat = csatFilter.value.map(
      (csat) => csat?.value || '',
    );
  },
  { immediate: true, deep: true },
);
</script>
