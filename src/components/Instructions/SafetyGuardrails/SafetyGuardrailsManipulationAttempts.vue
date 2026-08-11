<template>
  <section
    class="safety-guardrails-manipulation-attempts"
    data-testid="safety-guardrails-manipulation-attempts"
  >
    <h3
      class="safety-guardrails-manipulation-attempts__title"
      data-testid="safety-guardrails-manipulation-attempts-title"
    >
      {{
        $t('agents.instructions.safety_guardrails.manipulation_attempts.title')
      }}
    </h3>

    <div class="safety-guardrails-manipulation-attempts__row">
      <UnnnicSwitch
        class="safety-guardrails-manipulation-attempts__switch"
        :modelValue="modelValue"
        :textRight="
          $t(
            'agents.instructions.safety_guardrails.manipulation_attempts.prompt_injection.name',
          )
        "
        :helper="
          $t(
            'agents.instructions.safety_guardrails.manipulation_attempts.prompt_injection.description',
          )
        "
        data-testid="safety-guardrails-manipulation-attempts-switch"
        @update:model-value="emit('update:modelValue', $event)"
      />

      <p
        class="safety-guardrails-manipulation-attempts__status"
        data-testid="safety-guardrails-manipulation-attempts-status"
      >
        {{
          $t(
            `agents.instructions.safety_guardrails.${
              modelValue ? 'blocked' : 'allowed'
            }`,
          )
        }}
      </p>
    </div>
  </section>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style lang="scss" scoped>
.safety-guardrails-manipulation-attempts {
  padding-top: $unnnic-space-6;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  border-top: 1px solid $unnnic-color-border-base;

  &__title {
    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__row {
    display: flex;
    gap: $unnnic-space-4;
  }

  &__switch {
    flex: 1;
  }

  &__status {
    @include unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;
  }
}
</style>
