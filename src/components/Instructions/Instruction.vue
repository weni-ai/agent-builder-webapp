<template>
  <section class="instruction">
    <template v-if="isEditing">
      <section class="instruction__input">
        <UnnnicInput
          v-model="editingText"
          class="input__field"
          data-testid="instruction-input"
          size="sm"
          @keyup.enter="saveEditingInstruction"
        />
      </section>
      <UnnnicButton
        :text="$t('agent_builder.instructions.edit_instruction.save')"
        type="secondary"
        size="small"
        :disabled="editingText.trim() === ''"
        :loading="instruction.status === 'loading'"
        data-testid="instruction-save-button"
        @click="saveEditingInstruction"
      />
      <UnnnicButton
        :text="$t('agent_builder.instructions.edit_instruction.cancel')"
        type="tertiary"
        size="small"
        data-testid="instruction-cancel-button"
        @click="cancelEditingInstruction"
      />
    </template>

    <template v-else>
      <p
        class="instruction__text"
        data-testid="instruction-text"
      >
        {{ instruction.text }}
      </p>

      <p
        v-if="tag"
        class="instruction__tag"
        data-testid="instruction-tag"
      >
        {{ tag }}
      </p>

      <ContentItemActions
        v-if="showActions"
        :actions="actions"
        data-testid="instruction-actions"
      />
    </template>
  </section>

  <ModalRemoveInstruction
    v-model="showModalRemoveInstruction"
    data-testid="modal-remove-instruction"
    :instruction="instruction"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useInstructionsStore } from '@/store/Instructions';

import ContentItemActions from '@/components/ContentItemActions.vue';
import ModalRemoveInstruction from './ModalRemoveInstruction.vue';

const props = defineProps({
  instruction: {
    type: Object,
    required: true,
  },
  tag: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: true,
  },
});

const instructionsStore = useInstructionsStore();

const isEditing = ref(false);
const editingText = ref(props.instruction.text);
const MAX_INSTRUCTION_LENGTH = 200;

const showModalRemoveInstruction = ref(false);

const actions = computed(() => [
  {
    text: i18n.global.t('agent_builder.instructions.edit_instruction.title'),
    icon: 'edit_square',
    scheme: 'neutral-dark',
    onClick: () => (isEditing.value = true),
  },
  {
    text: i18n.global.t('agent_builder.instructions.remove_instruction.title'),
    icon: 'delete',
    scheme: 'aux-red-500',
    onClick: () => (showModalRemoveInstruction.value = true),
  },
]);

async function saveEditingInstruction() {
  const { status } = await instructionsStore.editInstruction(
    props.instruction.id,
    editingText.value,
  );

  if (status === 'complete') isEditing.value = false;
}

function cancelEditingInstruction() {
  isEditing.value = false;
  editingText.value = props.instruction.text;
}
</script>

<style lang="scss" scoped>
.instruction {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $unnnic-spacing-nano;

  padding: $unnnic-spacing-sm;

  &:not(:last-child) {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;
  }

  &__text {
    margin: 0;
    color: $unnnic-color-neutral-cloudy;

    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-gt;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
  }

  &__tag {
    border-radius: $unnnic-border-radius-pill;

    padding: $unnnic-spacing-nano $unnnic-spacing-ant;
    margin-left: $unnnic-spacing-ant;

    background-color: $unnnic-color-neutral-light;
    color: $unnnic-color-neutral-darkest;
    font-family: $unnnic-font-family-secondary;
    font-size: $unnnic-font-size-body-md;
    font-weight: $unnnic-font-weight-regular;
    line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
  }

  &__input {
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-nano;

    .input__length {
      color: $unnnic-color-neutral-cloudy;

      text-align: end;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-md;
      font-weight: $unnnic-font-weight-regular;
      line-height: $unnnic-font-size-body-md + $unnnic-line-height-md;
    }
  }
}
</style>
