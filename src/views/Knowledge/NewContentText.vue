<template>
  <section
    class="new-content-text"
    data-testid="new-content-text"
  >
    <UnnnicPageHeader
      :title="draftTitle"
      hasBackButton
      data-testid="new-content-text-header"
      @back="router.push({ name: 'knowledge' })"
    >
    </UnnnicPageHeader>

    <textarea
      v-model="draftText"
      class="new-content-text__textarea"
      data-testid="new-content-text-textarea"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useKnowledgeStore } from '@/store/Knowledge';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const knowledgeStore = useKnowledgeStore();

const uuid = route.params.uuid;
const isEditMode = Boolean(uuid);

const loading = ref(false);
const draftTitle = ref('');
const draftText = ref('');
const lastSavedTitle = ref('');
const lastSavedText = ref('');

function initializeCreateMode() {
  const defaultTitle = t('content_bases.new_text.default_title');

  draftTitle.value = defaultTitle;
  draftText.value = '';
  lastSavedTitle.value = defaultTitle;
  lastSavedText.value = '';
}

async function initializeEditMode() {
  loading.value = true;

  try {
    const item = await knowledgeStore.getContentText(uuid);

    const title =
      item?.title.toLowerCase() === 'untitled' || !item?.title
        ? t('content_bases.new_text.default_title')
        : item?.title;

    const text = item?.text ?? '';

    draftTitle.value = title;
    draftText.value = text;
    lastSavedTitle.value = title;
    lastSavedText.value = text;
  } catch {
    console.error('Error getting content text');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (isEditMode) {
    initializeEditMode();
  } else {
    initializeCreateMode();
  }
});
</script>

<style lang="scss" scoped>
.new-content-text {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  height: 100%;
  width: 100%;

  &__textarea {
    flex: 1;
    width: 100%;

    border: 1px solid $unnnic-color-border-base;
    border-radius: $unnnic-radius-2;
    padding: $unnnic-space-4;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-muted;

    resize: none;
  }
}
</style>
