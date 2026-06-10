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

    <CategoriesView
      v-if="instructionsStore.activeInstructionsView === 'categories'"
      :isLoading="isLoading"
      data-testid="instructions-categories-view"
    />

    <InstructionsList
      v-else
      :instructions="instructionsStore.instructions.data"
      :isLoading="isLoading"
      showActions
      data-testid="instructions-baseline-list"
    />
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

import InstructionsList from '@/components/Instructions/InstructionsList.vue';
import CategoriesView from './CategoriesView.vue';

const views = ['categories', 'list'];

const instructionsStore = useInstructionsStore();

if (instructionsStore.instructions.status === null) {
  instructionsStore.loadInstructions();
}

const isLoading = computed(
  () => instructionsStore.instructions.status === 'loading',
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
