<template>
  <UnnnicToolTip
    side="left"
    :text="tooltipText"
    :enabled="Boolean(improvementsStore.runAnalysisBlockReason)"
  >
    <UnnnicButton
      type="primary"
      :text="buttonText"
      :disabled="improvementsStore.isRunAnalysisDisabled"
      :loading="improvementsStore.analysis.status === 'loading'"
      :data-testid="dataTestid"
      @click="improvementsStore.runAnalysis"
    />
  </UnnnicToolTip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import {
  MIN_CONVERSATIONS_FOR_ANALYSIS,
  useImprovementsStore,
} from '@/store/Improvements';

const props = withDefaults(
  defineProps<{
    dataTestid?: string;
    translationKey?: string;
  }>(),
  {
    dataTestid: 'run-analysis-button',
    translationKey: 'audit.improvements.header.run_analysis',
  },
);

const { t } = useI18n();
const improvementsStore = useImprovementsStore();
const { runAnalysisBlockReason } = storeToRefs(improvementsStore);

const buttonText = computed(() => t(props.translationKey));

const tooltipText = computed(() => {
  if (runAnalysisBlockReason.value === 'already_run_today') {
    return t(
      'audit.improvements.header.run_analysis_already_run_today_tooltip',
    );
  }

  if (runAnalysisBlockReason.value === 'insufficient_volume') {
    return t(
      'audit.improvements.header.run_analysis_insufficient_volume_tooltip',
      { min: MIN_CONVERSATIONS_FOR_ANALYSIS },
    );
  }

  return '';
});
</script>
