<template>
  <UnnnicModalDialog
    data-testid="modal-validate-instruction-by-ai"
    :modelValue="modelValue"
    size="lg"
    showCloseIcon
    showActionsDivider
    :title="
      $t(
        'agent_builder.instructions.new_instruction.validate_instruction_by_ai.modal_title',
      )
    "
    :secondaryButtonProps="{
      text: $t(
        'agent_builder.instructions.new_instruction.validate_instruction_by_ai.cancel_button',
      ),
      onClick: close,
    }"
    :primaryButtonProps="{
      text: $t(
        'agent_builder.instructions.new_instruction.validate_instruction_by_ai.publish_button',
      ),
      disabled:
        instructionsStore.instructionSuggestedByAI.status === 'loading' ||
        newInstruction.trim() === '',
      loading: instructionsStore.newInstruction.status === 'loading',
      onClick: publishInstruction,
    }"
    @update:model-value="close"
  >
    <InstructionTextarea
      v-model="newInstruction"
      data-testid="modal-validate-instruction-textarea"
    />
  </UnnnicModalDialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

import InstructionTextarea from './InstructionTextarea.vue';

const emit = defineEmits(['update:modelValue']);

const instructionsStore = useInstructionsStore();

const modelValue = ref(false);

const newInstruction = ref(instructionsStore.newInstruction.text);

function close() {
  emit('update:modelValue', false);
}

function publishInstruction() {
  instructionsStore.newInstruction.text = newInstruction.value;
  instructionsStore.addInstruction();
}

onMounted(() => {
  const isInstructionNotSuggested =
    instructionsStore.instructionSuggestedByAI.data.instruction !==
    instructionsStore.newInstruction.text;

  if (isInstructionNotSuggested) {
    instructionsStore.getInstructionSuggestionByAI();
  }
});
</script>
