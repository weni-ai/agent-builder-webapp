<template>
  <section class="instructions">
    <AgentBuilderHeader
      data-testid="instructions-header"
      :withDivider="false"
      actionsSize="none"
    />
    <NewInstruction data-testid="new-instruction" />
    <InstructionsSection data-testid="instructions-section" />
  </section>
</template>

<script setup>
import AgentBuilderHeader from '@/components/Header.vue';
import NewInstruction from '@/components/Instructions/NewInstruction.vue';
import InstructionsSection from '@/components/Instructions/InstructionsSection.vue';
</script>

<style lang="scss" scoped>
.instructions {
  height: 100%;

  display: grid;
  grid-template-rows: auto auto 1fr;
  flex-direction: column;
  gap: $unnnic-spacing-md;
}
</style>
