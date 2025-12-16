<template>
  <section
    :class="[
      'modal-assign-agent__radio',
      {
        'modal-assign-agent__radio--selected': selected,
      },
    ]"
  >
    <input
      class="modal-assign-agent__radio-input"
      type="radio"
      :checked="selected"
      @change="handleChange"
    />
    <slot />
  </section>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:selected']);

const props = defineProps<{
  selected: boolean;
}>();

function handleChange() {
  emit('update:selected', !props.selected);
}
</script>

<style scoped lang="scss">
.modal-assign-agent__radio {
  border: 1px solid $unnnic-color-border-soft;

  &--selected {
    border: 1px solid $unnnic-color-border-active;
  }
}
</style>
