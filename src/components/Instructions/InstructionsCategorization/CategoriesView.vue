<template>
  <section
    class="categories-view"
    data-testid="categories-view"
  >
    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        v-for="index in 7"
        :key="index"
        width="100%"
        height="68px"
        data-testid="categories-view-loading"
      />
    </template>

    <template v-else>
      <CategoryAccordion
        v-for="(group, index) in groups"
        :key="group.key"
        :group="group"
        :initiallyExpanded="index === 0"
        :forceExpanded="isSearching"
        :data-testid="`categories-view-group-${group.key}`"
        @delete-category="$emit('delete-category', $event)"
        @edit="$emit('edit', $event)"
      />
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

import CategoryAccordion from './CategoryAccordion.vue';

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['delete-category', 'edit']);

const instructionsStore = useInstructionsStore();

const groups = computed(() => instructionsStore.groupedInstructions);

const isSearching = computed(
  () => instructionsStore.searchTerm.trim().length > 0,
);
</script>

<style lang="scss" scoped>
.categories-view {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;
}
</style>
