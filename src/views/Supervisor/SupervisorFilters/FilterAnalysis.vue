<template>
  <UnnnicRadioGroup
    v-model:modelValue="analysisFilter"
    state="vertical"
    data-testid="analysis-radio-group"
    :label="$t('audit.conversations.filters.analysis.label')"
  >
    <UnnnicRadio
      v-for="option in analysisOptions"
      :key="option.value"
      :data-testid="`analysis-radio-${option.value}`"
      :label="option.label"
      :value="option.value"
    />
  </UnnnicRadioGroup>
</template>

<script setup>
import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const getAnalysisTranslation = (filter) =>
  i18n.global.t(`audit.conversations.filters.analysis.${filter}`);

const analysisOptions = computed(() =>
  ['all_conversations', 'amazing_conversations'].map((value) => ({
    label: getAnalysisTranslation(value),
    value,
  })),
);

const analysisFilter = computed({
  get: () =>
    supervisorStore.temporaryFilters.isAmazing
      ? 'amazing_conversations'
      : 'all_conversations',
  set: (selected) => {
    supervisorStore.temporaryFilters.isAmazing =
      selected === 'amazing_conversations' ? true : null;
  },
});
</script>
