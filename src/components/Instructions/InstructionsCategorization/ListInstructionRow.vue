<template>
  <article
    class="list-instruction-row"
    data-testid="list-instruction-row"
  >
    <p
      class="list-instruction-row__instruction"
      data-testid="list-instruction-row-text"
    >
      {{ instruction.text }}
    </p>

    <section class="list-instruction-row__category-area">
      <UnnnicToolTip
        v-if="instruction.categoryLocked"
        side="top"
        :text="lockedTooltip"
        enabled
        data-testid="list-instruction-row-locked-tooltip"
      >
        <UnnnicTag
          scheme="gray"
          leftIcon="lock"
          :text="instruction.categoryLabel"
          data-testid="list-instruction-row-tag"
        />
      </UnnnicToolTip>

      <UnnnicTag
        v-else
        scheme="gray"
        :text="instruction.categoryLabel"
        data-testid="list-instruction-row-tag"
      />

      <ContentItemActions
        v-if="!instruction.locked"
        :actions="actions"
        data-testid="list-instruction-row-actions"
      />
    </section>

    <ModalRemoveInstruction
      v-model="showRemoveModal"
      :instruction="removeTarget"
      data-testid="list-instruction-row-remove-modal"
    />
  </article>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useInstructionsStore } from '@/store/Instructions';

import ContentItemActions from '@/components/ContentItemActions.vue';
import ModalRemoveInstruction from '@/components/Instructions/ModalRemoveInstruction.vue';

const props = defineProps({
  instruction: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['edit']);

const { t } = useI18n();

const instructionsStore = useInstructionsStore();

const showRemoveModal = ref(false);

const status = computed(
  () =>
    instructionsStore.instructions.data.find(
      (item) => item.id === props.instruction.id,
    )?.status,
);

const removeTarget = computed(() => ({
  id: props.instruction.id,
  text: props.instruction.text,
  status: status.value,
}));

const lockedTooltip = computed(() =>
  t('agents.instructions.view.locked_tooltip'),
);

const actions = computed(() => [
  {
    text: t('agent_builder.instructions.edit_instruction.title'),
    icon: 'edit_square',
    scheme: 'fg-base',
    onClick: () => emit('edit', props.instruction),
  },
  {
    text: t('agent_builder.instructions.remove_instruction.title'),
    icon: 'delete',
    scheme: 'red-10',
    onClick: () => (showRemoveModal.value = true),
  },
]);
</script>

<style lang="scss" scoped>
.list-instruction-row {
  display: grid;
  grid-template-columns: 1fr minmax(250px, 20%);
  align-items: center;
  gap: $unnnic-space-4;

  padding: $unnnic-space-4 $unnnic-space-3;

  border-top: $unnnic-border-width-thinner solid $unnnic-color-border-base;

  &:last-child {
    border-bottom: $unnnic-border-width-thinner solid $unnnic-color-border-base;
  }

  &__instruction {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-body;
  }

  &__category-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $unnnic-space-4;
  }
}
</style>
