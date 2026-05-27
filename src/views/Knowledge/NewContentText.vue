<template>
  <section
    class="new-content-text"
    data-testid="new-content-text"
  >
    <TextDetailHeader
      data-testid="new-content-text-header"
      :title="draftTitle"
      :defaultTitle="defaultTitle"
      :saveDisabled="saveDisabled"
      :saveLoading="saveLoading"
      @update:title="onTitleUpdate"
      @save="onSave"
      @back="onBack"
    />

    <TextDetailBody
      v-model="draftText"
      data-testid="new-content-text-textarea"
      :autofocus="!isEditMode"
    />

    <ModalUnsavedChanges
      data-testid="new-content-text-unsaved-modal"
      :open="unsavedModalOpen"
      @keep="onKeepEditing"
      @discard="onDiscardChanges"
    />
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { useKnowledgeStore } from '@/store/Knowledge';
import { useAlertStore } from '@/store/Alert';

import TextDetailHeader from '@/components/Knowledge/NewContentText/TextDetailHeader.vue';
import TextDetailBody from '@/components/Knowledge/NewContentText/TextDetailBody.vue';
import ModalUnsavedChanges from '@/components/Knowledge/NewContentText/ModalUnsavedChanges.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const knowledgeStore = useKnowledgeStore();
const alertStore = useAlertStore();

const currentUuid = ref(route.params.uuid ?? null);
const isEditMode = computed(() => Boolean(currentUuid.value));

const defaultTitle = t('content_bases.new_text.default_title');

const loading = ref(false);
const saveLoading = ref(false);
const draftTitle = ref(defaultTitle);
const draftText = ref('');
const lastSavedTitle = ref(defaultTitle);
const lastSavedText = ref('');

const hasTextChanged = computed(() => draftText.value !== lastSavedText.value);
const hasTitleChanged = computed(
  () => draftTitle.value !== lastSavedTitle.value,
);

const hasUnsavedChanges = computed(() => {
  if (isEditMode.value) {
    return hasTextChanged.value || hasTitleChanged.value;
  }
  return draftText.value.trim() !== '';
});

const unsavedModalOpen = ref(false);
const pendingNext = ref(null);
const bypassGuard = ref(false);

const saveDisabled = computed(() => {
  if (saveLoading.value) return true;
  if (draftText.value.trim() === '') return true;
  if (isEditMode.value && !hasTextChanged.value && !hasTitleChanged.value) {
    return true;
  }
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
}

async function onSave() {
  if (saveDisabled.value) return;

  saveLoading.value = true;

  try {
    if (isEditMode.value) {
      const payload = {};
      if (hasTextChanged.value) payload.text = draftText.value;
      if (hasTitleChanged.value) payload.title = draftTitle.value;

      const data = await knowledgeStore.patchContentText(
        currentUuid.value,
        payload,
      );

      lastSavedText.value = data?.text ?? draftText.value;
      lastSavedTitle.value = data?.title ?? draftTitle.value;
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

    alertStore.add({
      type: 'success',
      text: t('content_bases.new_text.save_success'),
    });
  } catch {
    alertStore.add({
      type: 'error',
      text: t('content_bases.new_text.save_error'),
      description: t('content_bases.new_text.save_error_hint'),
    });
  } finally {
    saveLoading.value = false;
  }
}

function onBack() {
  router.push({ name: 'knowledge' });
}

function onKeepEditing() {
  unsavedModalOpen.value = false;

  const next = pendingNext.value;
  pendingNext.value = null;

  if (typeof next === 'function') next(false);
}

function onDiscardChanges() {
  unsavedModalOpen.value = false;

  bypassGuard.value = true;

  const next = pendingNext.value;
  pendingNext.value = null;

  if (typeof next === 'function') next();
}

function onBeforeUnloadHandler(event) {
  if (!hasUnsavedChanges.value) return undefined;

  event.preventDefault();
  event.returnValue = '';
  return '';
}

onBeforeRouteLeave((to, from, next) => {
  if (bypassGuard.value || !hasUnsavedChanges.value) {
    next();
    return;
  }

  pendingNext.value = next;
  unsavedModalOpen.value = true;
});

onMounted(() => {
  window.addEventListener('beforeunload', onBeforeUnloadHandler);

  if (isEditMode.value) {
    initializeEditMode();
  } else {
    initializeCreateMode();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', onBeforeUnloadHandler);
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
