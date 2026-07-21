<template>
  <section
    class="instructions-categorization"
    data-testid="instructions-categorization"
  >
    <header class="instructions-categorization__toolbar">
      <UnnnicInput
        v-model="instructionsStore.searchTerm"
        iconLeft="search"
        :placeholder="$t('agents.instructions.view.search_placeholder')"
        data-testid="instructions-search"
      />

      <UnnnicSegmentedControl
        v-model="instructionsStore.activeInstructionsView"
        data-testid="instructions-view-segmented"
      >
        <UnnnicSegmentedControlList>
          <UnnnicSegmentedControlTrigger
            v-for="view in views"
            :key="view"
            :value="view"
            :data-testid="`instructions-view-trigger-${view}`"
          >
            {{ $t(`agents.instructions.view.segmented.${view}`) }}
          </UnnnicSegmentedControlTrigger>
        </UnnnicSegmentedControlList>
      </UnnnicSegmentedControl>
    </header>

    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        v-for="index in 7"
        :key="index"
        width="100%"
        height="69px"
        data-testid="instructions-loading"
      />
    </template>

    <template v-else>
      <InstructionsResultsCount />

      <CategoriesView
        v-if="showCategoriesView"
        data-testid="instructions-categories-view"
        @edit="instructionsStore.startEditingInstruction"
      />

      <ListView
        v-if="showListView"
        data-testid="instructions-list-view"
        @edit="instructionsStore.startEditingInstruction"
      />
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

import InstructionsResultsCount from './InstructionsResultsCount.vue';
import CategoriesView from './CategoriesView.vue';
import ListView from './ListView.vue';

const views = ['categories', 'list'];

const instructionsStore = useInstructionsStore();

if (instructionsStore.instructions.status === null) {
  instructionsStore.loadInstructions();
}

const isLoading = computed(
  () => instructionsStore.instructions.status === 'loading',
);

const showCategoriesView = computed(
  () =>
    !isLoading.value &&
    instructionsStore.flatInstructions.length > 0 &&
    instructionsStore.activeInstructionsView === 'categories',
);

const showListView = computed(
  () =>
    !isLoading.value &&
    instructionsStore.flatInstructions.length > 0 &&
    instructionsStore.activeInstructionsView === 'list',
);
</script>

<style lang="scss" scoped>
.instructions-categorization {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  // Mirrors UnnnicPageHeader's grid (1fr + minmax(250px, 20%))
  &__toolbar {
    display: grid;
    grid-template-columns: 1fr minmax(250px, 20%);
    align-items: center;
    gap: $unnnic-space-4;
  }
}
</style>
