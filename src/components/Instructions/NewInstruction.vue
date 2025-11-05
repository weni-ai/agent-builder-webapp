<template>
  <section
    class="new-instruction"
    data-testid="new-instruction"
  >
    <header
      class="new-instruction__header"
      data-testid="new-instruction-header"
    >
      <h2
        class="new-instruction__title"
        data-testid="new-instruction-title"
      >
        {{ $t('agent_builder.instructions.new_instruction.title') }}
      </h2>
      <UnnnicSwitch
        v-if="featureFlagsStore.flags.instructionsValidatedByAI"
        data-testid="new-instruction-switch-validate-instruction-by-ai"
        :modelValue="instructionsStore.validateInstructionByAI"
        :textRight="
          $t(
            'agent_builder.instructions.new_instruction.validate_instruction_by_ai.switch',
          )
        "
        @update:model-value="
          instructionsStore.updateValidateInstructionByAI($event)
        "
      />
    </header>
    <UnnnicTextArea
      v-model="instructionsStore.newInstruction.text"
      data-testid="new-instruction-textarea"
      :placeholder="
        $t('agent_builder.instructions.new_instruction.textarea.placeholder')
      "
      :message="
        $t('agent_builder.instructions.new_instruction.textarea.description')
      "
    />
    <UnnnicButton
      class="new-instruction__add-instruction-button"
      data-testid="add-instruction-button"
      :disabled="!newInstruction.text.trim()"
      :text="primaryButtonText"
      :loading="newInstruction.status === 'loading'"
      @click="handlePrimaryButton"
    />

    <ModalValidateInstruction
      v-if="showValidateInstructionByAIModal"
      v-model="showValidateInstructionByAIModal"
      data-testid="modal-validate-instruction-by-ai"
    />
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';

import i18n from '@/utils/plugins/i18n';

import { useInstructionsStore } from '@/store/Instructions';
import { useFeatureFlagsStore } from '@/store/FeatureFlags';

import ModalValidateInstruction from './ModalValidateInstruction/index.vue';

const instructionsStore = useInstructionsStore();
const featureFlagsStore = useFeatureFlagsStore();

const showValidateInstructionByAIModal = ref(false);

const newInstruction = computed(() => instructionsStore.newInstruction);
const primaryButtonText = computed(() => {
  const newInstructionText = (value) =>
    i18n.global.t(`agent_builder.instructions.new_instruction.${value}`);

  return instructionsStore.validateInstructionByAI
    ? newInstructionText('validate_instruction_by_ai.button')
    : newInstructionText('publish_instruction');
});

function openValidateInstructionByAIModal() {
  showValidateInstructionByAIModal.value = true;
}

function handlePrimaryButton() {
  return instructionsStore.validateInstructionByAI
    ? openValidateInstructionByAIModal()
    : instructionsStore.addInstruction();
}
</script>

<style lang="scss" scoped>
.new-instruction {
  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  padding: $unnnic-spacing-sm;

  display: grid;
  grid-template-columns: repeat(12, 1fr);
  row-gap: $unnnic-spacing-sm;

  :deep(textarea) {
    resize: none;
  }

  & > * {
    grid-column: 1 / -1;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: $unnnic-space-2;
  }

  &__title {
    margin: 0;

    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-lg;
    font-weight: $unnnic-font-weight-bold;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__add-instruction-button {
    grid-column: 1 / 5;
  }
}
</style>
