<template>
  <section
    class="categories-view"
    data-testid="categories-view"
  >
    <CategoryAccordion
      v-for="(group, index) in groups"
      :key="group.key"
      :group="group"
      :initiallyExpanded="index === 0"
      :forceExpanded="instructionsStore.isSearching"
      :data-testid="`categories-view-group-${group.key}`"
      @delete-category="$emit('delete-category', $event)"
      @edit="$emit('edit', $event)"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

import CategoryAccordion from './CategoryAccordion.vue';

defineEmits(['delete-category', 'edit']);

const instructionsStore = useInstructionsStore();

const groups = computed(() => instructionsStore.groupedInstructions);
</script>

<style lang="scss" scoped>
.categories-view {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;
}
</style>
