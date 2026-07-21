<template>
  <UnnnicDialog
    data-testid="modal"
    :open="modelValue"
    lazyMount
    @update:open="onUpdateOpen"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>
          {{ t('agents.instructions.delete_category.modal_title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <i18n-t
        tag="p"
        class="modal-remove-category__description"
        :keypath="modalDescriptionKey"
        data-testid="description"
      >
        <template
          v-if="instructionsCount > 0"
          #count
        >
          {{
            t('agents.instructions.delete_category.instructions_count', {
              count: instructionsCount,
            })
          }}
        </template>
        <template #name>
          <b
            class="modal-remove-category__description-category-name"
            data-testid="category-name"
            >{{ category.name }}</b
          >
        </template>
      </i18n-t>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="cancel-button"
            :text="t('agents.instructions.delete_category.cancel')"
            type="tertiary"
            :disabled="isDeleting"
            @click="close"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          data-testid="confirm-button"
          :text="t('agents.instructions.delete_category.confirm')"
          :loading="isDeleting"
          type="warning"
          @click="confirm"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
});

const modelValue = defineModel('modelValue', {
  type: Boolean,
  required: true,
});

const { t } = useI18n();

const instructionsStore = useInstructionsStore();

const isDeleting = ref(false);

const instructionsCount = computed(
  () =>
    instructionsStore.instructions.data.filter(
      (instruction) => instruction.category?.id === props.category.id,
    ).length,
);

const modalDescriptionKey = computed(() =>
  instructionsCount.value > 0
    ? 'agents.instructions.delete_category.modal_description'
    : 'agents.instructions.delete_category.modal_description_empty',
);

function close() {
  modelValue.value = false;
}

function onUpdateOpen(open) {
  if (isDeleting.value) return;
  if (!open) close();
}

async function confirm() {
  if (isDeleting.value) return;

  isDeleting.value = true;
  const { status } = await instructionsStore.deleteCategory(props.category.id);
  isDeleting.value = false;

  if (status !== 'error') close();
}
</script>

<style lang="scss" scoped>
.modal-remove-category {
  &__description {
    margin: $unnnic-space-6;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;

    &-category-name {
      font-weight: $unnnic-font-weight-bold;
    }
  }
}
</style>
