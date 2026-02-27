<template>
  <section class="instructions">
    <NewInstruction data-testid="new-instruction" />
    <InstructionsSection data-testid="instructions-section" />
  </section>
</template>

<script setup>
import NewInstruction from '@/components/Instructions/NewInstruction.vue';
import InstructionsSection from '@/components/Instructions/InstructionsSection.vue';
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
