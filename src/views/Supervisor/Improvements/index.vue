<template>
  <section
    class="conversations-improvements"
    data-testid="conversations-improvements"
  >
    <NoAnalysisPerformed v-if="!analysis.task" />
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useImprovementsStore } from '@/store/Improvements';

import NoAnalysisPerformed from '@/components/ConversationsImprovements/NoAnalysisPerformed.vue';

const improvementsStore = useImprovementsStore();
const { analysis } = storeToRefs(improvementsStore);

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
