<template>
  <section class="list-content-texts__list">
    <ContentItem
      v-for="text in contentTexts.data"
      :key="text.uuid"
      :file="toItemFile(text)"
      :loading="contentTexts.status === 'loading'"
      clickable
      compressed
      @click="goToContentText(text.uuid)"
    />
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router';

import ContentItem from '@/components/Knowledge/ContentBase/ContentItem.vue';
import { useKnowledgeStore } from '@/store/Knowledge';
import { storeToRefs } from 'pinia';

const router = useRouter();
const knowledgeStore = useKnowledgeStore();
const { contentTexts } = storeToRefs(knowledgeStore);

const toItemFile = (text) => ({
  uuid: text.uuid,
  created_file_name: text.title,
  created_at: text.last_updated_at,
  extension_file: 'text',
  status: 'uploaded',
});

const goToContentText = (uuid) => {
  router.push({ name: 'content-text', params: { uuid } });
};
</script>

<style lang="scss" scoped>
.list-content-texts__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $unnnic-space-4;
}
</style>
