<template>
  <UnnnicPopover
    v-model:open="isOpen"
    @update:open="handleOpenChange"
  >
    <UnnnicPopoverTrigger data-testid="suggested-category-trigger">
      <section
        :class="[
          'suggested-category__field',
          { 'suggested-category__field--open': isOpen },
        ]"
      >
        <p
          class="suggested-category__value"
          data-testid="suggested-category-value"
        >
          {{ selectedLabel }}
        </p>

        <UnnnicTag
          v-if="selectedCategoryIsNew"
          scheme="gray"
          size="small"
          :text="categoryT('new_badge')"
          data-testid="suggested-category-new-tag"
        />

        <UnnnicIcon
          class="suggested-category__chevron"
          :icon="isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          size="sm"
          scheme="fg-base"
        />
      </section>
    </UnnnicPopoverTrigger>

    <UnnnicPopoverContent
      align="start"
      width="100%"
      class="suggested-category__content"
    >
      <template v-if="mode === 'list'">
        <section class="suggested-category__list">
          <section
            v-if="suggestedCategory"
            class="suggested-category__category-section"
          >
            <p class="suggested-category__category-title">
              {{ categoryT('suggested_category') }}
            </p>

            <UnnnicPopoverOption
              data-testid="suggested-category-suggested-option"
              :active="isActive(suggestedCategory)"
              @click="selectCategory(suggestedCategory)"
            >
              <span class="suggested-category__suggested-value">
                {{ suggestedCategory.name }}
              </span>
              <UnnnicTag
                v-if="suggestedCategoryIsNew"
                scheme="gray"
                size="small"
                :text="categoryT('new_badge')"
                data-testid="suggested-category-suggested-new-tag"
              />
            </UnnnicPopoverOption>
          </section>

          <section
            v-if="otherCategories.length > 0"
            class="suggested-category__category-section"
          >
            <p class="suggested-category__category-title">
              {{ categoryT('other_categories') }}
            </p>

            <UnnnicPopoverOption
              v-for="option in otherCategories"
              :key="option.name"
              :label="option.name"
              :active="isActive(option)"
              :data-testid="`suggested-category-option-${option.name}`"
              @click="selectCategory(option)"
            />
          </section>
        </section>

        <UnnnicPopoverFooter>
          <UnnnicButton
            iconLeft="add"
            :text="categoryT('create_action')"
            type="secondary"
            data-testid="suggested-category-create-action"
            @click="mode = 'create'"
          />
        </UnnnicPopoverFooter>
      </template>

      <CategoryCreateForm
        v-else
        data-testid="suggested-category-create-form"
        @back="mode = 'list'"
        @create="handleCreate"
      />
    </UnnnicPopoverContent>
  </UnnnicPopover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';
import type { InstructionCategory } from '@/store/types/Instructions.types';

import CategoryCreateForm from './CategoryCreateForm.vue';
import { UnnnicPopoverOption } from '@weni/unnnic-system';

const { t } = useI18n();
const categoryT = (key: string) =>
  t(`agents.instructions.new_instruction_drawer.ai_analysis.category.${key}`);

const instructionsStore = useInstructionsStore();

const isOpen = ref(false);
const mode = ref<'list' | 'create'>('list');

const categoryOptions = computed(() => instructionsStore.categoryOptions);
const selectedCategory = computed(
  () => instructionsStore.newInstruction.category,
);
const selectedCategoryIsNew = computed(
  () => instructionsStore.selectedCategoryIsNew,
);
const suggestedCategory = computed(() => instructionsStore.suggestedCategory);
const suggestedCategoryIsNew = computed(
  () => instructionsStore.suggestedCategoryIsNew,
);

const selectedLabel = computed(
  () => selectedCategory.value?.name ?? categoryT('placeholder'),
);

const otherCategories = computed(() =>
  categoryOptions.value.filter(
    (option) => option.name !== suggestedCategory.value?.name,
  ),
);

function isActive(option: InstructionCategory | null) {
  const selected = selectedCategory.value;
  return !!selected && !!option && selected.name === option.name;
}

function selectCategory(option: InstructionCategory | null) {
  if (!option) return;
  instructionsStore.newInstruction.category = { ...option };
  isOpen.value = false;
}

function handleCreate(name: string) {
  instructionsStore.createCategory(name);
  isOpen.value = false;
  mode.value = 'list';
}

function handleOpenChange(open: boolean) {
  if (!open) mode.value = 'list';
}
</script>

<style lang="scss">
.suggested-category__content {
  padding: 0;

  width: 320px;
  height: 240px;
}
</style>

<style lang="scss" scoped>
.suggested-category {
  &__field {
    width: 320px;

    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    padding: $unnnic-space-3 $unnnic-space-4;

    border-radius: $unnnic-radius-2;
    border: 1px solid $unnnic-color-border-base;

    cursor: pointer;

    &--open {
      border-color: $unnnic-color-border-accent-strong;
    }
  }

  &__category-title {
    font: $unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;
  }

  &__value {
    flex: 1;

    text-align: left;
    font: $unnnic-font-body;
    color: $unnnic-color-fg-emphasized;
  }

  &__chevron {
    margin-left: auto;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;

    padding: $unnnic-space-4;
  }

  &__category-section {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__suggested-value {
    font: $unnnic-font-emphasis;
    color: $unnnic-color-fg-emphasized;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
  }
}
</style>
