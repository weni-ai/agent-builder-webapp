<template>
  <section
    :class="[
      'instructions-list',
      {
        'instructions-list--loading': isLoading,
        'instructions-list--no-instructions': instructions.length === 0,
      },
    ]"
    data-testid="instructions"
  >
    <template v-if="isLoading">
      <UnnnicSkeletonLoading
        v-for="index in 10"
        :key="index"
        tag="div"
        width="100%"
        height="60px"
        data-testid="instruction-loading"
      />
    </template>
    <section
      v-else-if="instructions.length === 0"
      class="instructions-list__no-instructions"
    >
      <UnnnicIcon
        icon="format_list_bulleted"
        size="xl"
        scheme="neutral-cleanest"
      />
      <p class="no-instructions__text">
        {{
          $t(
            'agent_builder.instructions.instructions_list.no_custom_instructions',
          )
        }}
      </p>
    </section>
    <template v-else>
      <Instruction
        v-for="instruction in instructions"
        :key="instruction.id"
        :instruction="instruction"
        :showActions="showActions"
        data-testid="instruction-added"
      />
    </template>
  </section>
</template>

<script setup>
import Instruction from './Instruction.vue';

defineProps({
  instructions: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
.instructions-list {
  margin-bottom: $unnnic-spacing-sm;

  display: flex;
  flex-direction: column;

  border-radius: $unnnic-border-radius-md;
  border: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  &--loading,
  &--no-instructions {
    height: 100%;

    gap: $unnnic-spacing-nano;

    border: none;
    border-radius: 0;
  }

  &__no-instructions {
    height: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-spacing-nano;

    .no-instructions__text {
      color: $unnnic-color-neutral-cloudy;
      font-family: $unnnic-font-family-secondary;
      font-size: $unnnic-font-size-body-gt;
      font-weight: $unnnic-font-weight-regular;
      line-height: $unnnic-font-size-body-gt + $unnnic-line-height-md;
    }
  }
}
</style>
