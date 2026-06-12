<template>
  <form
    class="new-instruction-drawer__form"
    data-testid="new-instruction-drawer-form"
    @submit.prevent="validate"
  >
    <textarea
      id="new-instruction-drawer-textarea"
      ref="textareaRef"
      v-model="instructionsStore.newInstruction.text"
      class="new-instruction-drawer__textarea"
      data-testid="new-instruction-drawer-textarea"
    />

    <UnnnicButton
      data-testid="new-instruction-drawer-validate-button"
      type="secondary"
      :text="$t('agents.instructions.new_instruction_drawer.validate')"
      :disabled="validateButtonDisabled"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { useInstructionsStore } from '@/store/Instructions';

const instructionsStore = useInstructionsStore();

const textareaRef = ref<HTMLTextAreaElement | null>(null);

const validateButtonDisabled = computed(() => {
  const instructionSuggestionStatus =
    instructionsStore.instructionSuggestedByAI.status;
  const newInstructionText = instructionsStore.newInstruction.text.trim();
  return (
    !newInstructionText ||
    instructionSuggestionStatus === 'complete' ||
    instructionSuggestionStatus === 'loading'
  );
});

function validate() {
  instructionsStore.getInstructionSuggestionByAI(
    instructionsStore.newInstruction.text,
  );
}

onMounted(() => {
  textareaRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.new-instruction-drawer {
  &__form {
    border-radius: $unnnic-radius-2;
    border: 1px solid $unnnic-color-border-base;
    background-color: $unnnic-color-bg-base;

    padding: $unnnic-space-4;

    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: $unnnic-space-3;
  }

  &__textarea {
    border-radius: $unnnic-radius-1;

    resize: none;
    width: 100%;
    height: 80px;

    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-body;

    &:focus {
      outline: 1px solid $unnnic-color-border-accent-strong;
    }
  }
}
</style>
