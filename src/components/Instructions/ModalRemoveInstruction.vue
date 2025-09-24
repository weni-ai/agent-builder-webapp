<template>
  <UnnnicModalDialog
    :modelValue="modelValue"
    data-testid="modal"
    class="modal-remove-instruction"
    showCloseIcon
    icon="warning"
    iconScheme="aux-red-500"
    :title="$t('agent_builder.instructions.remove_instruction.title')"
    size="sm"
    :secondaryButtonProps="{
      text: $t('agent_builder.instructions.remove_instruction.cancel'),
    }"
    :primaryButtonProps="{
      text: $t('agent_builder.instructions.remove_instruction.remove'),
      loading: instruction.status === 'loading',
      type: 'warning',
    }"
    @secondary-button-click="close"
    @primary-button-click="removeInstruction"
    @update:model-value="close"
  >
    <p
      class="modal-remove-instruction__description"
      data-testid="description"
    >
      {{
        $t('agent_builder.instructions.remove_instruction.modal_description')
      }}
    </p>
  </UnnnicModalDialog>
</template>

<script setup>
import { useInstructionsStore } from '@/store/Instructions';
import { ref } from 'vue';

const instructionsStore = useInstructionsStore();

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  instruction: {
    type: Object,
    required: true,
  },
});

const modelValue = ref(false);

function close() {
  emit('update:modelValue', false);
}

async function removeInstruction() {
  const { status } = await instructionsStore.removeInstruction(
    props.instruction.id,
  );

  if (status === 'complete') close();
}
</script>

<style lang="scss" scoped>
.modal-remove-instruction {
  :deep(.unnnic-modal-dialog__container__content) {
    padding-bottom: $unnnic-spacing-xs;
  }

  &__description {
    color: $unnnic-color-neutral-cloudy;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }
}
</style>
