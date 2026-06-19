<template>
  <UnnnicDisclaimer
    v-if="analysis.task?.isRunning"
    data-testid="analysis-in-progress-disclaimer"
    type="informational"
    :description="
      $t('audit.improvements.analysis_in_progress_disclaimer', {
        progress: analysis.task?.progress ?? 0,
        total: analysis.task?.total ?? 0,
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
import { useImprovementsStore } from '@/store/Improvements';
import { storeToRefs } from 'pinia';

const improvementsStore = useImprovementsStore();
const { analysis } = storeToRefs(improvementsStore);
</script>
