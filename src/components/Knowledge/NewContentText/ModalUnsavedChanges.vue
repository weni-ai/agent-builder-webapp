<template>
  <UnnnicDialog
    data-testid="modal-unsaved-changes"
    :open="open"
    lazyMount
    @update:open="onUpdateOpen"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="attention">
        <UnnnicDialogTitle data-testid="modal-unsaved-changes-title">
          {{ t('content_bases.new_text.unsaved.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <p
        class="modal-unsaved-changes__description"
        data-testid="modal-unsaved-changes-description"
      >
        {{ t('content_bases.new_text.unsaved.description') }}
      </p>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="modal-unsaved-changes-keep"
            :text="t('content_bases.new_text.unsaved.keep')"
            type="tertiary"
            @click="onKeep"
          />
        </UnnnicDialogClose>

        <UnnnicButton
          data-testid="modal-unsaved-changes-discard"
          :text="t('content_bases.new_text.unsaved.discard')"
          type="attention"
          @click="onDiscard"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  open: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['keep', 'discard']);

const { t } = useI18n();

function onUpdateOpen(value) {
  if (!value) emit('keep');
}

function onKeep() {
  emit('keep');
}

function onDiscard() {
  emit('discard');
}
</script>

<style lang="scss" scoped>
.modal-unsaved-changes {
  &__description {
    margin: $unnnic-space-6;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
