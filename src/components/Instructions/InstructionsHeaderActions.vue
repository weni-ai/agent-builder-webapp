<template>
  <UnnnicButton
    data-testid="export-instructions-button"
    type="secondary"
    :text="$t('agents.instructions.export_instructions')"
    @click="exportInstructions"
  />

  <UnnnicButton
    data-testid="new-instruction-button"
    type="primary"
    :text="$t('agents.instructions.new_instruction')"
    @click="instructionsStore.openNewInstructionDrawer"
  />

  <NewInstructionDrawer data-testid="new-instruction-drawer" />
</template>

<script setup lang="ts">
import { useInstructionsStore } from '@/store/Instructions';

import NewInstructionDrawer from '@/components/Instructions/NewInstructionDrawer/index.vue';

const instructionsStore = useInstructionsStore();

function exportInstructions() {
  // TODO: Implement export instructions
}
</script>
