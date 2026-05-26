<template>
  <section
    class="new-content-text"
    data-testid="new-content-text"
  >
    <TextDetailHeader
      data-testid="new-content-text-header"
      :uuid="currentUuid"
      :title="draftTitle"
      :defaultTitle="defaultTitle"
      :saveDisabled="saveDisabled"
      :saveLoading="saveLoading"
      @update:title="onTitleUpdate"
      @save="onSave"
      @back="router.push({ name: 'knowledge' })"
    />

    <TextDetailBody
      v-model="draftText"
      data-testid="new-content-text-textarea"
      :autofocus="!isEditMode"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useKnowledgeStore } from '@/store/Knowledge';

import TextDetailHeader from '@/components/Knowledge/NewContentText/TextDetailHeader.vue';
import TextDetailBody from '@/components/Knowledge/NewContentText/TextDetailBody.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const knowledgeStore = useKnowledgeStore();

const currentUuid = ref(route.params.uuid ?? null);
const isEditMode = computed(() => Boolean(currentUuid.value));

const defaultTitle = t('content_bases.new_text.default_title');

const loading = ref(false);
const saveLoading = ref(false);
const draftTitle = ref(defaultTitle);
const draftText = ref('');
const lastSavedTitle = ref(defaultTitle);
const lastSavedText = ref('');

const saveDisabled = computed(() => {
  if (saveLoading.value) return true;
  if (draftText.value.trim() === '') return true;
  if (isEditMode.value && draftText.value === lastSavedText.value) return true;
  return false;
});

function initializeCreateMode() {
  draftTitle.value = defaultTitle;
  draftText.value = '';
  lastSavedTitle.value = defaultTitle;
  lastSavedText.value = '';
}

async function initializeEditMode() {
  loading.value = true;

  try {
    const item = await knowledgeStore.getContentText(currentUuid.value);

    const title =
      item?.title?.toLowerCase() === 'untitled' || !item?.title
        ? defaultTitle
        : item.title;

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

function onTitleUpdate(nextTitle) {
  draftTitle.value = nextTitle;

  if (isEditMode.value) {
    lastSavedTitle.value = nextTitle;
  }
}

async function onSave() {
  if (saveDisabled.value) return;

  saveLoading.value = true;

  try {
    if (isEditMode.value) {
      const data = await knowledgeStore.patchContentText(currentUuid.value, {
        text: draftText.value,
      });

      lastSavedText.value = data?.text ?? draftText.value;
    } else {
      const data = await knowledgeStore.createContentText({
        text: draftText.value,
        title: draftTitle.value,
      });

      lastSavedText.value = data?.text ?? draftText.value;
      lastSavedTitle.value = data?.title ?? draftTitle.value;

      if (data?.uuid) {
        currentUuid.value = data.uuid;
        router.replace({
          name: 'content-text',
          params: { uuid: data.uuid },
        });
      }
    }
  } catch {
    console.error('Error saving content text');
  } finally {
    saveLoading.value = false;
  }
}

onMounted(() => {
  if (isEditMode.value) {
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
}
</style>
