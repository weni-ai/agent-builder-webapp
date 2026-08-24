<template>
  <UnnnicDialog
    data-testid="modal"
    :open="modelValue"
    lazyMount
    @update:open="onUpdateOpen"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader>
        <UnnnicDialogTitle>
          {{ renameT('modal_title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="modal-rename-category__body">
        <UnnnicInput
          ref="inputRef"
          v-model="name"
          :label="renameT('name_label')"
          :maxlength="MAX_LENGTH"
          showMaxlengthCounter
          :errors="displayedErrors"
          data-testid="name-input"
          @blur="touched = true"
          @keyup.enter="submit"
        />

        <UnnnicDisclaimer
          type="informational"
          :description="renameT('disclaimer')"
          data-testid="disclaimer"
        />
      </section>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="cancel-button"
            :text="renameT('cancel')"
            type="tertiary"
            :disabled="isSaving"
            @click="close"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          data-testid="confirm-button"
          :text="renameT('confirm')"
          type="primary"
          :disabled="!canSave"
          :loading="isSaving"
          @click="submit"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';
import { useCategoryValidation } from '@/components/Instructions/NewInstructionDrawer/useCategoryValidation';

const MAX_LENGTH = 50;

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

const emit = defineEmits(['renamed']);

const { t } = useI18n();
const renameT = (key) => t(`agents.instructions.rename_category.${key}`);

const instructionsStore = useInstructionsStore();

const inputRef = ref(null);
const name = ref('');
const touched = ref(false);
const isSaving = ref(false);

const otherNames = computed(() =>
  instructionsStore.categoryOptions
    .map((option) => option.name)
    .filter((existing) => existing !== props.category.name),
);

const { error, isValid } = useCategoryValidation(name, otherNames);

const isUnchanged = computed(() => name.value.trim() === props.category.name);

const canSave = computed(() => isValid.value && !isUnchanged.value);

const displayedErrors = computed(() =>
  touched.value && error.value ? [error.value] : [],
);

function close() {
  modelValue.value = false;
}

function onUpdateOpen(open) {
  if (isSaving.value) return;
  if (!open) close();
}

function focusInput() {
  const root = inputRef.value?.$el ?? inputRef.value;
  root?.querySelector?.('input')?.focus();
}

watch(
  modelValue,
  async (open) => {
    if (!open) return;

    name.value = props.category.name;
    touched.value = false;
    await nextTick();
    focusInput();
  },
  { immediate: true },
);

async function submit() {
  touched.value = true;
  if (!canSave.value || isSaving.value) return;

  isSaving.value = true;
  const trimmedName = name.value.trim();
  const { status } = await instructionsStore.renameCategory(
    props.category.id,
    trimmedName,
  );
  isSaving.value = false;

  if (status === 'error') return;

  emit('renamed', props.category.id);
  close();
}
</script>

<style lang="scss" scoped>
.modal-rename-category {
  &__body {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    margin: $unnnic-space-6;
  }
}
</style>
