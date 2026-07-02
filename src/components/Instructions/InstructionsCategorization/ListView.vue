<template>
  <section
    class="list-view"
    data-testid="list-view"
  >
    <header
      class="list-view__columns"
      data-testid="list-view-columns"
    >
      <p class="list-view__column">
        {{ columnsT('instruction') }}
      </p>
      <p class="list-view__column">
        {{ columnsT('category') }}
      </p>
    </header>

    <ListInstructionRow
      v-for="instruction in instructions"
      :key="instruction.id"
      :instruction="instruction"
      :data-testid="`list-view-row-${instruction.id}`"
      @edit="$emit('edit', $event)"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';

import ListInstructionRow from './ListInstructionRow.vue';

defineEmits(['edit']);

const { t } = useI18n();
const columnsT = (key) => t(`agents.instructions.view.list_columns.${key}`);

const instructionsStore = useInstructionsStore();

const instructions = computed(() => instructionsStore.flatInstructions);
</script>

<style lang="scss" scoped>
.list-view {
  display: flex;
  flex-direction: column;

  &__columns {
    margin: $unnnic-space-2 0;

    display: grid;
    grid-template-columns: 1fr minmax(250px, 20%);
    gap: $unnnic-space-4;
  }

  &__column {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-caption-1;

    &:first-of-type {
      margin-left: $unnnic-space-3;
    }

    &:last-of-type {
      margin-right: $unnnic-space-3;
    }
  }
}
</style>
