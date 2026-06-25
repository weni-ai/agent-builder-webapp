<template>
  <section class="instructions">
    <InstructionsCategorization
      v-if="categorizationEnabled"
      data-testid="instructions-categorization"
    />

    <template v-else>
      <NewInstruction data-testid="new-instruction" />
      <InstructionsSection data-testid="instructions-section" />
    </template>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';

import NewInstruction from '@/components/Instructions/NewInstruction.vue';
import InstructionsSection from '@/components/Instructions/InstructionsSection.vue';
import InstructionsCategorization from '@/components/Instructions/InstructionsCategorization/index.vue';

const featureFlagsStore = useFeatureFlagsStore();

const categorizationEnabled = computed(
  () => featureFlagsStore.flags.categorizationOfInstructions,
);
</script>

<style lang="scss" scoped>
.instructions {
  margin-top: $unnnic-space-6;

  height: 100%;

  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
