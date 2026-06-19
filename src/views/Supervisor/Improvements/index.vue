<template>
  <section
    class="conversations-improvements"
    data-testid="conversations-improvements"
  >
    <NoAnalysisPerformed v-if="!analysis.task" />
    <RunningAnalysis
      v-else-if="analysis.task?.isRunning && !improvements.data.length"
    />

    <template v-else-if="improvements.data.length">
      <AnalysisInProgressDisclaimer v-if="analysis.task?.isRunning" />

      <ImprovementsHeader />

      <ImprovementsList />
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';
import RunningAnalysis from '@/components/ConversationsImprovements/RunningAnalysis.vue';
import ImprovementsHeader from '@/components/ConversationsImprovements/ImprovementsHeader.vue';
import ImprovementsList from '@/components/ConversationsImprovements/ImprovementsList.vue';
import AnalysisInProgressDisclaimer from '@/components/ConversationsImprovements/AnalysisInProgressDisclaimer.vue';

const improvementsStore = useImprovementsStore();
const { analysis, improvements } = storeToRefs(improvementsStore);

onMounted(() => {
  improvementsStore.fetchImprovements();
});
</script>

<style scoped lang="scss">
.conversations-improvements {
  height: 100%;

  padding: $unnnic-space-4;
  padding-top: 0;
}
</style>
