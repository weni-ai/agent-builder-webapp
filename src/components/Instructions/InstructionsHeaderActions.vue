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
    @click="newInstruction"
  />

  <NewInstructionDrawer
    v-model="showNewInstructionDrawer"
    data-testid="new-instruction-drawer"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import NewInstructionDrawer from '@/components/Instructions/NewInstructionDrawer/index.vue';

const showNewInstructionDrawer = ref(false);

function exportInstructions() {
  // TODO: Implement export instructions
}

function newInstruction() {
  showNewInstructionDrawer.value = true;
}
</script>
