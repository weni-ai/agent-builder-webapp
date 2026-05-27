<template>
  <UnnnicDialog
    data-testid="modal-delete-text"
    :open="modelValue"
    lazyMount
    @update:open="onUpdateOpen"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle data-testid="modal-delete-text-title">
          {{ t('content_bases.new_text.delete.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <i18n-t
        tag="p"
        class="modal-delete-text__description"
        keypath="content_bases.new_text.delete.description"
        data-testid="modal-delete-text-description"
      >
        <template #name>
          <b data-testid="modal-delete-text-description-name">{{
            displayName
          }}</b>
        </template>
      </i18n-t>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="modal-delete-text-cancel"
            :text="t('content_bases.new_text.delete.cancel')"
            type="tertiary"
            :disabled="isDeleting"
            @click="close"
          />
        </UnnnicDialogClose>

        <UnnnicButton
          data-testid="modal-delete-text-confirm"
          :text="t('content_bases.new_text.delete.confirm')"
          :loading="isDeleting"
          type="warning"
          @click="onConfirm"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useKnowledgeStore } from '@/store/Knowledge';
import { useAlertStore } from '@/store/Alert';

const props = defineProps({
  text: {
    type: Object,
    required: true,
    validator: (value) => Boolean(value?.uuid),
  },
});

const modelValue = defineModel('modelValue', {
  type: Boolean,
  required: true,
});

const emit = defineEmits(['confirm']);

const { t } = useI18n();
const knowledgeStore = useKnowledgeStore();
const alertStore = useAlertStore();

const isDeleting = ref(false);

const displayName = computed(() => {
  const trimmed = (props.text?.title ?? '').trim();
  return trimmed || t('content_bases.new_text.default_title');
});

function close() {
  modelValue.value = false;
}

function onUpdateOpen(value) {
  if (isDeleting.value) return;
  if (!value) close();
}

async function onConfirm() {
  if (isDeleting.value) return;

  isDeleting.value = true;

  try {
    await knowledgeStore.deleteContentText(props.text.uuid);

    alertStore.add({
      type: 'info',
      text: t('content_bases.new_text.delete.success'),
    });

    emit('confirm', props.text);
    close();
  } catch {
    alertStore.add({
      type: 'error',
      text: t('content_bases.new_text.delete.error'),
      description: t('content_bases.new_text.delete.error_hint'),
    });
  } finally {
    isDeleting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.modal-delete-text {
  &__description {
    margin: $unnnic-space-6;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;

    :deep(b) {
      font-weight: $unnnic-font-weight-bold;
    }
  }
}
</style>
