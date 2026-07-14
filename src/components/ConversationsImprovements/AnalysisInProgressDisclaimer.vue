<template>
  <UnnnicDisclaimer
    v-if="analysis.task?.isRunning"
    data-testid="analysis-in-progress-disclaimer"
    type="informational"
    :description="
      $t('audit.improvements.analysis_in_progress_disclaimer', {
        percentage,
      })
    "
  >
    <template #icon>
      <UnnnicIconLoading
        size="sm"
        stroke-width="3"
      />
    </template>
  </UnnnicDisclaimer>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useImprovementsStore } from '@/store/Improvements';
import { storeToRefs } from 'pinia';

const improvementsStore = useImprovementsStore();
const { analysis } = storeToRefs(improvementsStore);

const percentage = computed(() => {
  const progress = analysis.value.task?.progress ?? 0;
  const total = analysis.value.task?.total ?? 0;

  if (total <= 0) return 0;

  return Math.round((progress / total) * 100);
});
</script>
