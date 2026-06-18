<template>
  <UnnnicDialog
    data-testid="modal"
    :open="modelValue"
    lazyMount
    @update:open="onUpdateOpen"
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="warning">
        <UnnnicDialogTitle>
          {{ $t('agent_builder.instructions.remove_instruction.title') }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section class="modal-remove-instruction">
        <p
          class="modal-remove-instruction__description"
          data-testid="description"
        >
          {{
            $t(
              'agent_builder.instructions.remove_instruction.modal_description',
            )
          }}
        </p>

        <p
          class="modal-remove-instruction__snippet"
          data-testid="instruction-snippet"
        >
          {{ instruction.text }}
        </p>
      </section>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="cancel-button"
            :text="$t('agent_builder.instructions.remove_instruction.cancel')"
            type="tertiary"
            @click="close"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          data-testid="remove-button"
          :text="$t('agent_builder.instructions.remove_instruction.remove')"
          :loading="instruction.status === 'loading'"
          type="warning"
          @click="removeInstruction"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { useInstructionsStore } from '@/store/Instructions';

const instructionsStore = useInstructionsStore();

const props = defineProps({
  instruction: {
    type: Object,
    required: true,
  },
});

const modelValue = defineModel('modelValue', {
  type: Boolean,
  required: true,
});

function close() {
  modelValue.value = false;
}

function onUpdateOpen(open) {
  if (!open) close();
}

async function removeInstruction() {
  const { status } = await instructionsStore.removeInstruction(
    props.instruction.id,
  );

  if (status !== 'error') close();
}
</script>

<style lang="scss" scoped>
.modal-remove-instruction {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  padding: $unnnic-space-6;

  &__description {
    margin: 0;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &__snippet {
    margin: 0;
    padding: $unnnic-space-3;

    border-radius: $unnnic-radius-2;
    background-color: $unnnic-color-bg-base-soft;

    color: $unnnic-color-fg-base;
    font: $unnnic-font-caption-2;
  }
}
</style>
