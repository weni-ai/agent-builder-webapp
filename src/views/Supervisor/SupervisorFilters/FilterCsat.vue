<template>
  <UnnnicFormElement :label="$t('audit.conversations.filters.csat.csat')">
    <UnnnicMultiSelect
      v-model:modelValue="csatFilter"
      data-testid="csat-select"
      :options="csatOptions"
      :placeholder="$t('audit.conversations.filters.csat.csat')"
      clearable
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
type SelectOption = {
  label: string;
  value: CsatScaleValue;
};

const translateCsat = (filter: string) =>
  i18n.global.t(`audit.conversations.filters.csat.${filter}`);

const csatOptions = computed<SelectOption[]>(() =>
  CSAT_SCALE.map(({ value, score }) => ({
    label: `${translateCsat(value)} | CSAT: ${score}`,
    value,
  })),
);

const csatFilter = ref<string[]>(
  supervisorStore.getInitialSelectFilter('csat', csatOptions),
);

watch(
  csatFilter,
  (selected) => {
    supervisorStore.temporaryFilters.csat = [...selected];
  },
  { immediate: true, deep: true },
);
</script>
