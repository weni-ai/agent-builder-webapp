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
      @click="handleRunAnalysisClick"
    />
  </UnnnicToolTip>

  <RunAnalysisDialog v-model:open="isRunAnalysisDialogOpen" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';

import RunAnalysisDialog from './RunAnalysisDialog.vue';

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
const { runAnalysisBlockReason, improvements } = storeToRefs(improvementsStore);

const isRunAnalysisDialogOpen = ref(false);

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
    );
  }

  return '';
});

const handleRunAnalysisClick = () => {
  if (improvements.value.data.length > 0) {
    isRunAnalysisDialogOpen.value = true;
    return;
  }

  improvementsStore.runAnalysis();
};
</script>
