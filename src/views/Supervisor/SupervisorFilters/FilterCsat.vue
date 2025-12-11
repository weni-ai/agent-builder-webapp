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

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const CSAT_SCALE = [
  { value: 'very_satisfied', score: 5 },
  { value: 'satisfied', score: 4 },
  { value: 'neutral', score: 3 },
  { value: 'dissatisfied', score: 2 },
  { value: 'very_dissatisfied', score: 1 },
] as const;

type CsatScaleValue = (typeof CSAT_SCALE)[number]['value'];
type CsatFilterValue = '' | CsatScaleValue;
type SelectOption = {
  label: string;
  value: CsatFilterValue;
};

const translateCsat = (filter: string) =>
  i18n.global.t(`agent_builder.supervisor.filters.csat.${filter}`);

const csatOptions = computed<SelectOption[]>(() => [
  { label: translateCsat('csat'), value: '' },
  ...CSAT_SCALE.map(({ value, score }) => ({
    label: `${translateCsat(value)} | CSAT: ${score}`,
    value,
  })),
]);

const csatFilter = ref<SelectOption[]>(
  supervisorStore.getInitialSelectFilter('csat', csatOptions),
);

watch(
  csatFilter,
  (selected) => {
    supervisorStore.temporaryFilters.csat = selected.map(
      (option) => option?.value ?? '',
    );
  },
  { immediate: true, deep: true },
);
</script>
