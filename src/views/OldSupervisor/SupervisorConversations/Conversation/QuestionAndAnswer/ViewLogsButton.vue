<template>
  <button
    data-testid="view-logs-button"
    :class="[
      'question-and-answer__view-logs-button',
      {
        'question-and-answer__view-logs-button--active': active,
      },
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <section class="view-logs-button__icon-loading">
      <UnnnicIconLoading
        v-if="loading"
        data-testid="icon-loading"
        size="sm"
        scheme="weni-300"
        class="icon-loading__icon"
      />
    </section>

    <section class="view-logs-button__content">
      <UnnnicIcon
        :icon="active ? 'visibility_off' : 'visibility'"
        data-testid="icon-visibility"
        size="xs"
        scheme="weni-300"
        class="view-logs-button__icon-visibility"
      />
      <UnnnicIntelligenceText
        color="weni-300"
        family="secondary"
        size="body-md"
        tag="p"
        data-testid="button-text"
      >
        {{
          active
            ? $t('agent_builder.supervisor.hide_logs')
            : $t('agent_builder.supervisor.view_logs')
        }}
      </UnnnicIntelligenceText>
    </section>
  </button>
</template>

<script setup>
const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  active: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['click']);

function handleClick() {
  emit('click');
}
</script>

<style lang="scss" scoped>
.question-and-answer__view-logs-button {
  border: none;

  position: relative;

  border-radius: calc($unnnic-border-radius-sm / 2);

  padding: 0 $unnnic-spacing-xs;

  width: fit-content;

  display: flex;
  align-items: center;
  justify-content: center;

  background: $unnnic-color-weni-700;

  cursor: pointer;

  &--active {
    background: $unnnic-color-weni-800;
  }

  .view-logs-button__icon-loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    display: flex;

    opacity: 0;
  }

  .view-logs-button__icon-visibility {
    margin-right: $unnnic-spacing-nano;
  }

  .view-logs-button__content {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:disabled {
    cursor: not-allowed;

    .view-logs-button__icon-loading {
      opacity: 1;
    }

    .view-logs-button__content {
      opacity: 0;
    }
  }
}
</style>
