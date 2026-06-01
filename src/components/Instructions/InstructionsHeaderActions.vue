<template>
  <UnnnicButton
    type="secondary"
    :text="$t('agents.instructions.export_instructions')"
    @click="exportInstructions"
  />

  <UnnnicButton
    type="primary"
    :text="$t('agents.instructions.new_instruction')"
    @click="newInstruction"
  />
</template>

<script setup lang="ts">
function exportInstructions() {
  // TODO: Implement export instructions
}

function newInstruction() {
  // TODO: Implement new instruction drawer
}
</script>
