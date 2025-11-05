<template>
  <section
    data-testid="modal-validate-instruction-textarea"
    class="modal-validate-instruction__textarea"
  >
    <UnnnicTextArea
      v-model="modelValue"
      data-testid="instruction-textarea"
      :placeholder="
        $t('agent_builder.instructions.new_instruction.textarea.placeholder')
      "
      resize="none"
    />
    <UnnnicButton
      data-testid="revalidate-button"
      :text="
        $t(
          'agent_builder.instructions.new_instruction.validate_instruction_by_ai.re-validate_button',
        )
      "
      :disabled="revalidateButtonTextDisabled"
      :loading="instructionsStore.instructionSuggestedByAI.status === 'loading'"
      @click="revalidateInstructionByAI"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

const instructionsStore = useInstructionsStore();

const modelValue = defineModel<string>('modelValue');

const revalidateButtonTextDisabled = computed(
  () =>
    !modelValue.value?.trim() ||
    modelValue.value?.trim() === instructionsStore.newInstruction.text?.trim(),
);

function revalidateInstructionByAI() {
  instructionsStore.getInstructionSuggestionByAI();
}
</script>

<style lang="scss" scoped>
.modal-validate-instruction__textarea {
  display: grid;
  gap: $unnnic-space-2;
}
</style>
