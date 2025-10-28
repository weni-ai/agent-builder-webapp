<template>
  <section
    data-testid="modal-validate-instruction"
    class="modal-validate-instruction"
  >
    <section class="modal-validate-instruction__instruction">
      <UnnnicTextArea
        v-model="modelValue"
        data-testid="instruction-textarea"
        :placeholder="
          $t('agent_builder.instructions.new_instruction.textarea.placeholder')
        "
      />
      <InstructionAISuggestion
        v-if="!isSuggestionLoading"
        @apply-suggestion="applySuggestion"
      />
    </section>
    <UnnnicButton
      data-testid="revalidate-button"
      :text="
        $t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.re-validate_button',
        )
      "
      :disabled="revalidateButtonTextDisabled"
      :loading="isSuggestionLoading"
      @click="revalidateInstructionByAI"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

import InstructionAISuggestion from './InstructionAISuggestion.vue';

const instructionsStore = useInstructionsStore();

const modelValue = defineModel<string>('modelValue');

const isSuggestionLoading = computed(() => {
  return instructionsStore.instructionSuggestedByAI.status === 'loading';
});

const revalidateButtonTextDisabled = computed(() => {
  const isInstructionEqualsToNewInstruction =
    modelValue.value?.trim() === instructionsStore.newInstruction.text?.trim();

  return (
    !modelValue.value?.trim() ||
    isInstructionEqualsToNewInstruction ||
    instructionsStore.instructionSuggestedByAI.suggestionApplied
  );
});

function revalidateInstructionByAI() {
  instructionsStore.getInstructionSuggestionByAI();
}

function applySuggestion(suggestion: string) {
  modelValue.value = suggestion;
  instructionsStore.instructionSuggestedByAI.suggestionApplied = true;
  instructionsStore.resetInstructionSuggestedByAI();
}
</script>

<style lang="scss" scoped>
.modal-validate-instruction {
  display: grid;
  gap: $unnnic-space-2;

  &__instruction {
    position: relative;
  }
}
</style>
