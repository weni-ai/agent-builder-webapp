<template>
  <section class="list-content-texts">
    <NewContentTextHeader />
    <List />
  </section>
</template>

<script setup>
import { onMounted } from 'vue';

import NewContentTextHeader from './Header.vue';
import List from './List.vue';

import { useKnowledgeStore } from '@/store/Knowledge';

const knowledgeStore = useKnowledgeStore();

onMounted(() => {
  if (knowledgeStore.contentTexts.data.length === 0) {
    knowledgeStore.loadContentTexts();
  }
});
</script>

<style lang="scss" scoped>
.list-content-texts {
  display: grid;
  gap: $unnnic-spacing-md;
}
</style>
