<template>
  <section
    class="conversations-improvements"
    data-testid="conversations-improvements"
  >
    <ImprovementsSkeleton v-if="isLoadingImprovements" />
    <InsufficientConversationsVolume
      v-else-if="
        !analysis.task.createdAt &&
        runAnalysisBlockReason === 'insufficient_volume'
      "
    />
    <NoAnalysisPerformed v-else-if="!analysis.task.createdAt" />
    <RunningAnalysis
      v-else-if="analysis.task.isRunning && !improvements.data.length"
    />

    <template v-else>
      <AnalysisInProgressDisclaimer v-if="analysis.task.isRunning" />

      <ImprovementsHeader v-else />

      <NoImprovementIdentified v-if="!improvements.data.length" />
      <ImprovementsList v-else />
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';
import InsufficientConversationsVolume from '@/components/ConversationsImprovements/InsufficientConversationsVolume.vue';
import RunningAnalysis from '@/components/ConversationsImprovements/RunningAnalysis.vue';
import NoImprovementIdentified from '@/components/ConversationsImprovements/NoImprovementIdentified.vue';
import ImprovementsHeader from '@/components/ConversationsImprovements/ImprovementsHeader.vue';
import ImprovementsList from '@/components/ConversationsImprovements/ImprovementsList.vue';
import AnalysisInProgressDisclaimer from '@/components/ConversationsImprovements/AnalysisInProgressDisclaimer.vue';
import ImprovementsSkeleton from '@/components/ConversationsImprovements/ImprovementsSkeleton.vue';

const improvementsStore = useImprovementsStore();
const { analysis, improvements, runAnalysisBlockReason } =
  storeToRefs(improvementsStore);

const isLoadingImprovements = computed(
  () => analysis.value.status === 'loading' && !analysis.value.task.createdAt,
);

onMounted(() => {
  improvementsStore.fetchImprovements();
});
</script>

<style scoped lang="scss">
.conversations-improvements {
  height: 100%;

  padding: $unnnic-space-4;
  padding-top: 0;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-6;
}
</style>
