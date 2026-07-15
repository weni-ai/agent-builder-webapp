<template>
  <section
    class="category-create-form"
    data-testid="category-create-form"
  >
    <header class="category-create-form__header">
      <UnnnicButton
        iconCenter="keyboard_arrow_left"
        type="tertiary"
        size="small"
        data-testid="category-create-form-back"
        @click="$emit('back')"
      />

      <h3 class="category-create-form__title">
        {{ categoryT('create_title') }}
      </h3>
    </header>

    <form
      class="category-create-form__input-section"
      @submit.prevent="submit"
    >
      <UnnnicInput
        v-model="name"
        :label="categoryT('name_label')"
        :placeholder="categoryT('name_placeholder')"
        :maxlength="MAX_LENGTH"
        showMaxlengthCounter
        :errors="displayedErrors"
        data-testid="category-create-form-input"
        @blur="touched = true"
        @keyup.enter="submit"
      />
    </form>
  </section>

  <UnnnicPopoverFooter>
    <UnnnicButton
      type="tertiary"
      :text="categoryT('cancel')"
      data-testid="category-create-form-cancel"
      @click="$emit('back')"
    />
    <UnnnicButton
      type="primary"
      :text="categoryT('create')"
      :disabled="!isValid"
      data-testid="category-create-form-create"
      @click="submit"
    />
  </UnnnicPopoverFooter>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { UnnnicPopoverFooter } from '@weni/unnnic-system';

import { useInstructionsStore } from '@/store/Instructions';

import { useCategoryValidation } from './useCategoryValidation';

const MAX_LENGTH = 50;

const emit = defineEmits<{
  back: [];
  create: [name: string];
}>();

const { t } = useI18n();
const categoryT = (key: string) =>
  t(`agents.instructions.new_instruction_drawer.ai_analysis.category.${key}`);

const instructionsStore = useInstructionsStore();

const name = ref('');
const touched = ref(false);

const existingNames = computed(() =>
  instructionsStore.categoryOptions.map((category) => category.name),
);

const { error, isValid } = useCategoryValidation(name, existingNames);

const displayedErrors = computed(() =>
  touched.value && error.value ? [error.value] : [],
);

function submit() {
  touched.value = true;
  if (!isValid.value) return;
  emit('create', name.value.trim());
}
</script>

<style lang="scss">
.suggested-category__content {
  padding: 0;
}
</style>

<style lang="scss" scoped>
.category-create-form {
  &__header {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    padding: $unnnic-space-4;

    border-bottom: 1px solid $unnnic-color-border-base;
  }

  &__input-section {
    padding: $unnnic-space-4;
  }

  &__title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }
}
</style>
