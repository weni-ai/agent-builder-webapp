<template>
  <InstructionsList
    data-testid="instructions-custom"
    :instructions="instructionsStore.instructions.data"
    :isLoading="instructionsStore.instructions.status === 'loading'"
    showActions
  />
</template>

<script setup>
import { useInstructionsStore } from '@/store/Instructions';

import InstructionsList from './InstructionsList.vue';

const instructionsStore = useInstructionsStore();
</script>
