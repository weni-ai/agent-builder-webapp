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
      <p
        v-if="isSearching"
        class="categories-view__results-count"
        data-testid="categories-view-results-count"
      >
        {{ resultsCountText }}
      </p>

      <CategoryAccordion
        v-for="(group, index) in groups"
        :key="group.key"
        :group="group"
        :initiallyExpanded="index === 0"
        :forceExpanded="isSearching"
        :data-testid="`categories-view-group-${group.key}`"
        @delete-category="$emit('delete-category', $event)"
      />
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';

import CategoryAccordion from './CategoryAccordion.vue';

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['delete-category']);

const { t } = useI18n();

const instructionsStore = useInstructionsStore();

const groups = computed(() => instructionsStore.groupedInstructions);

const isSearching = computed(
  () => instructionsStore.searchTerm.trim().length > 0,
);

const resultsCount = computed(() =>
  groups.value.reduce((total, group) => total + group.instructions.length, 0),
);

const resultsCountText = computed(() =>
  t('agents.instructions.view.results_count', { count: resultsCount.value }),
);
</script>

<style lang="scss" scoped>
.categories-view {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  &__results-count {
    margin: 0;

    color: $unnnic-color-fg-muted;
    font: $unnnic-font-body;
  }
}
</style>
