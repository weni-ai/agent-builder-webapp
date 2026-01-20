<template>
  <section
    class="modal-assign-agent__radio"
    data-testid="modal-assign-agent-radio"
    :class="{
      'modal-assign-agent__radio--selected': selected,
      'modal-assign-agent__radio--with-icon': hasSystemIcon,
    }"
    role="radio"
    :aria-checked="selected"
    tabindex="0"
    @click="handleChange"
    @keydown.enter.prevent="handleChange"
    @keydown.space.prevent="handleChange"
  >
    <input
      class="modal-assign-agent__radio-input"
      type="radio"
      :checked="selected"
      tabindex="-1"
      @change.stop
      data-testid="modal-assign-agent-radio-input"
    />

    <img
      v-if="systemIcon"
      class="modal-assign-agent__radio-icon"
      :src="systemIcon"
      :alt="systemIconAlt"
      data-testid="modal-assign-agent-radio-icon"
    />

    <section class="modal-assign-agent__radio-infos">
      <p
        class="modal-assign-agent__radio-title"
        data-testid="modal-assign-agent-radio-title"
      >
        {{ label }}
      </p>

      <p
        v-if="description"
        :class="descriptionClasses"
        data-testid="modal-assign-agent-radio-description"
      >
        {{ description }}
      </p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import useAgentSystems from '@/composables/useAgentSystems';

const emit = defineEmits(['update:selected']);

const props = defineProps<{
  selected: boolean;
  label: string;
  description?: string;
  system?: string;
  descriptionVariant?: 'caption' | 'body';
}>();

const { getSystemObject } = useAgentSystems();

const systemInfo = computed(() => {
  if (!props.system) return null;
  return getSystemObject(props.system);
});

const systemIcon = computed(() => systemInfo.value?.icon || '');
const hasSystemIcon = computed(() => Boolean(systemIcon.value));
const systemIconAlt = computed(() => {
  if (!hasSystemIcon.value) return '';
  return `${systemInfo.value?.name || props.label} logo`;
});
const descriptionClasses = computed(() => ({
  'modal-assign-agent__radio-description': true,
  'modal-assign-agent__radio-description--body':
    props.descriptionVariant === 'body',
}));

function handleChange() {
  if (props.selected) return;
  emit('update:selected', true);
}
</script>

<style scoped lang="scss">
.modal-assign-agent__radio {
  position: relative;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;

  width: 100%;

  padding: $unnnic-space-5;

  border-radius: $unnnic-radius-3;
  border: 1px solid $unnnic-color-border-soft;
  background-color: $unnnic-color-bg-base;

  transition-property: background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.15s;

  cursor: pointer;

  &:hover:not(&--selected) {
    border-color: $unnnic-color-border-muted;
  }

  &:focus-visible {
    border-color: $unnnic-color-border-active;
  }

  &--selected {
    border-color: $unnnic-color-border-active;
    background-color: $unnnic-color-teal-50;
  }

  &--with-icon {
    padding: $unnnic-space-5;
  }

  &-input {
    position: absolute;
    inset: 0;
    opacity: 0;

    pointer-events: none;
  }

  &-icon {
    width: $unnnic-icon-size-7;
    height: $unnnic-icon-size-7;

    display: flex;
    align-items: center;
    justify-content: center;
    object-fit: contain;
  }

  &-infos {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &-title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-action;
  }

  &-description {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-caption-1;

    &--body {
      font: $unnnic-font-body;
    }
  }
}
</style>
