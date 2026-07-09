<template>
  <section class="conversations-improvements"></section>
</template>

<script setup>
import { onMounted } from 'vue';

import { useImprovementsStore } from '@/store/Improvements';

const improvementsStore = useImprovementsStore();

onMounted(() => {
  improvementsStore.fetchImprovements();
});
</script>

<style scoped lang="scss">
.conversations-improvements {
  padding: $unnnic-space-4;
  padding-top: 0;
}
</style>
