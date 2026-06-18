<template>
  <section
    class="conversations-improvements"
    data-testid="conversations-improvements"
  >
    <NoAnalysisPerformed v-if="!analysis.task" />
    <RunningAnalysis
      v-else-if="analysis.task?.isRunning && !improvements.data.length"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';
import RunningAnalysis from '@/components/ConversationsImprovements/RunningAnalysis.vue';

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
