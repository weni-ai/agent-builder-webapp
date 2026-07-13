<template>
  <UnnnicDialog
    data-testid="delete-custom-analysis-dialog"
    :open="open"
    lazyMount
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent size="medium">
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle data-testid="delete-custom-analysis-dialog-title">
          {{ t('audit.improvements.custom_analysis_modal.delete.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <i18n-t
        tag="p"
        class="delete-custom-analysis-dialog__description"
        keypath="audit.improvements.custom_analysis_modal.delete.description"
        data-testid="delete-custom-analysis-dialog-description"
      >
        <template #name>
          <b data-testid="delete-custom-analysis-dialog-description-name">
            "{{ customAnalysisTitle }}"
          </b>
        </template>
      </i18n-t>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="delete-custom-analysis-dialog-cancel"
            :text="t('audit.improvements.custom_analysis_modal.delete.cancel')"
            type="tertiary"
            :disabled="isDeleting"
            @click="close"
          />
        </UnnnicDialogClose>

        <UnnnicButton
          data-testid="delete-custom-analysis-dialog-confirm"
          :text="t('audit.improvements.custom_analysis_modal.delete.confirm')"
          :loading="isDeleting"
          type="warning"
          @click="onConfirm"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';

import { useCustomAnalysisImprovementsStore } from '@/store/CustomAnalysisImprovements';

const props = defineProps<{
  customAnalysisUuid: string;
  customAnalysisTitle: string;
}>();

const open = defineModel<boolean>('open', {
  required: true,
});

const { t } = useI18n();
const customAnalysisImprovementsStore = useCustomAnalysisImprovementsStore();
const { deleteCustomAnalysis } = storeToRefs(customAnalysisImprovementsStore);

const isDeleting = computed(
  () => deleteCustomAnalysis.value.status === 'loading',
);

function close() {
  if (isDeleting.value) return;
  open.value = false;
}

function handleOpenChange(value: boolean) {
  if (isDeleting.value) return;
  open.value = value;
}

async function onConfirm() {
  if (isDeleting.value) return;

  const result =
    await customAnalysisImprovementsStore.submitDeleteCustomAnalysis(
      props.customAnalysisUuid,
    );

  if (result.status === 'complete') {
    close();
  }
}
</script>

<style scoped lang="scss">
.delete-custom-analysis-dialog {
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
