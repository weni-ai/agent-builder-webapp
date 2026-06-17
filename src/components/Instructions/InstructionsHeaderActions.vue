<template>
  <UnnnicButton
    data-testid="export-instructions-button"
    type="secondary"
    :text="$t('agents.instructions.export_instructions.title')"
    @click="exportInstructions"
  />

  <UnnnicButton
    data-testid="new-instruction-button"
    type="primary"
    :text="$t('agents.instructions.new_instruction')"
    @click="instructionsStore.openNewInstructionDrawer"
  />

  <NewInstructionDrawer data-testid="new-instruction-drawer" />
  <ExportInstructionsModal
    v-model="isExportInstructionsModalOpen"
    data-testid="export-instructions-modal"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useInstructionsStore } from '@/store/Instructions';

import NewInstructionDrawer from '@/components/Instructions/NewInstructionDrawer/index.vue';
import ExportInstructionsModal from '@/components/Instructions/ExportInstructionsModal.vue';

const instructionsStore = useInstructionsStore();

const isExportInstructionsModalOpen = ref(false);

function exportInstructions() {
  isExportInstructionsModalOpen.value = true;
}
</script>
