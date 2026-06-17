<template>
  <UnnnicDialog
    data-testid="export-instructions-modal"
    :open="modelValue"
    lazyMount
    @update:open="close"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ $t('agents.instructions.export_instructions.modal_title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>
      <p class="export-instructions-modal__description">
        {{ $t('agents.instructions.export_instructions.modal_description') }}
      </p>
      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            :text="$t('agents.instructions.export_instructions.cancel_button')"
            type="tertiary"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          :text="$t('agents.instructions.export_instructions.export_button')"
          type="primary"
          :loading="instructionsStore.isExportingInstructionsLoading"
          @click="exportInstructions"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { useInstructionsStore } from '@/store/Instructions';

const instructionsStore = useInstructionsStore();

const modelValue = defineModel('modelValue', {
  type: Boolean,
  required: true,
});

async function exportInstructions() {
  const response = await instructionsStore.exportInstructions();
  if (response.status === 'success') close();
}

function close() {
  modelValue.value = false;
}
</script>

<style lang="scss" scoped>
.export-instructions-modal {
  &__description {
    margin: $unnnic-space-6;

    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
