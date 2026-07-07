<template>
  <section
    :class="[
      'category-accordion',
      { 'category-accordion--expanded': isExpanded },
    ]"
    data-testid="category-accordion"
  >
    <header class="category-accordion__header">
      <section
        class="category-accordion__toggle"
        data-testid="category-accordion-header"
      >
        <UnnnicButton
          type="tertiary"
          size="small"
          :iconCenter="
            isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'
          "
          data-testid="category-accordion-chevron"
          @click="toggle"
        />

        <UnnnicToolTip
          v-if="group.locked"
          side="top"
          :text="lockedTooltip"
          enabled
          data-testid="category-accordion-locked-tooltip"
        >
          <UnnnicTag
            scheme="gray"
            leftIcon="lock"
            :text="group.label"
            data-testid="category-accordion-tag"
          />
        </UnnnicToolTip>

        <UnnnicTag
          v-else
          scheme="gray"
          :text="group.label"
          data-testid="category-accordion-tag"
        />
      </section>

      <ContentItemActions
        v-if="!group.locked"
        :actions="actions"
        data-testid="category-accordion-actions"
      />
    </header>

    <div
      class="category-accordion__collapse"
      data-testid="category-accordion-body"
    >
      <section class="category-accordion__body">
        <Instruction
          v-for="instruction in group.instructions"
          :key="instruction.id"
          :instruction="instruction"
          :showActions="!instruction.locked"
          emitEditOnClick
          data-testid="category-accordion-instruction"
          @edit="$emit('edit', $event)"
        />

        <p
          v-if="group.instructions.length === 0"
          class="category-accordion__empty"
          data-testid="category-accordion-empty"
        >
          {{ emptyText }}
        </p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ContentItemActions from '@/components/ContentItemActions.vue';
import Instruction from '@/components/Instructions/Instruction.vue';
import { INSTRUCTION_GROUP_KEYS } from '@/store/helpers/instructionViewModels';

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  initiallyExpanded: {
    type: Boolean,
    default: false,
  },
  forceExpanded: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['delete-category', 'edit']);

const { t } = useI18n();
const viewT = (key) => t(`agents.instructions.view.${key}`);

const isExpanded = ref(props.initiallyExpanded);

watch(
  () => props.forceExpanded,
  (force) => {
    if (force) isExpanded.value = true;
  },
  { immediate: true },
);

const lockedTooltip = computed(() => {
  const tooltips = {
    [INSTRUCTION_GROUP_KEYS.uncategorized]: viewT('uncategorized_tooltip'),
    [INSTRUCTION_GROUP_KEYS.default]: viewT('locked_tooltip'),
  };

  return tooltips[props.group.key];
});
const emptyText = computed(() => viewT('empty_category'));

const actions = computed(() => [
  {
    text: viewT('delete_category'),
    icon: 'delete',
    scheme: 'red-10',
    onClick: () => emit('delete-category', props.group),
  },
]);

function toggle() {
  isExpanded.value = !isExpanded.value;
}
</script>

<style lang="scss" scoped>
.category-accordion {
  border: 1px solid $unnnic-color-border-base;
  border-radius: $unnnic-radius-2;

  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $unnnic-space-2;

    padding: $unnnic-space-4;
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
  }

  &__collapse {
    display: grid;
    grid-template-rows: 0fr;

    transition: grid-template-rows 0.2s ease;
  }

  &--expanded &__collapse {
    grid-template-rows: 1fr;
  }

  &__body {
    min-height: 0;

    overflow: hidden;
  }

  &--expanded &__body {
    border-top: 1px solid $unnnic-color-border-base;
  }

  &__empty {
    margin: 0;
    padding: $unnnic-space-5 $unnnic-space-4;

    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
  }
}
</style>
