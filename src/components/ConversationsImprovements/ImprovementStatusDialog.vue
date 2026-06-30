<template>
  <UnnnicDialog
    :data-testid="`improvement-status-dialog-${status}`"
    :open="open"
    lazyMount
    @update:open="handleOpenChange"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader>
        <UnnnicDialogTitle
          :data-testid="`improvement-status-dialog-${status}-title`"
        >
          {{ $t(`audit.improvements.status_dialog.${status}.title`) }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <p
        class="improvement-status-dialog__description"
        :data-testid="`improvement-status-dialog-${status}-description`"
      >
        {{ $t(`audit.improvements.status_dialog.${status}.description`) }}
      </p>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            :data-testid="`improvement-status-dialog-${status}-cancel`"
            :disabled="isSubmitting"
            :text="$t('audit.improvements.status_dialog.cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          :data-testid="`improvement-status-dialog-${status}-confirm`"
          :loading="isSubmitting"
          :text="confirmButtonText"
          type="primary"
          @click="confirm"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useImprovementsStore } from '@/store/Improvements';

import type { ImprovementStatus } from '@/store/types/Improvements.types';

const open = defineModel<boolean>('open', {
  required: true,
});

const props = defineProps<{
  status: ImprovementStatus;
  improvementUuid: string | null;
}>();

const emit = defineEmits<{
  success: [];
}>();

const { t } = useI18n();
const improvementsStore = useImprovementsStore();

const isSubmitting = ref(false);

const confirmButtonText = computed(() => {
  const key =
    props.status === 'ignored'
      ? 'audit.improvements.drawer.ignore_improvement'
      : 'audit.improvements.drawer.mark_as_resolved';

  return t(key);
});

function close() {
  open.value = false;
}

function handleOpenChange(value: boolean) {
  if (!value) {
    close();
  }
}

async function confirm() {
  if (!props.improvementUuid || isSubmitting.value) {
    return;
  }

  isSubmitting.value = true;

  const result = await improvementsStore.updateImprovementStatus(
    props.improvementUuid,
    props.status,
  );

  isSubmitting.value = false;

  if (result.status === 'complete') {
    close();
    emit('success');
  }
}
</script>

<style scoped lang="scss">
.improvement-status-dialog {
  &__description {
    margin: $unnnic-space-6;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
