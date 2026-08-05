<template>
  <section
    class="safety-guardrails"
    data-testid="safety-guardrails"
  >
    <div class="safety-guardrails__content">
      <h2
        class="safety-guardrails__title"
        data-testid="safety-guardrails-title"
      >
        {{ $t('agents.instructions.safety_guardrails.title') }}
      </h2>
      <p
        class="safety-guardrails__description"
        data-testid="safety-guardrails-description"
      >
        {{ $t('agents.instructions.safety_guardrails.description') }}
      </p>
    </div>

    <UnnnicButton
      type="secondary"
      :text="$t('agents.instructions.safety_guardrails.configure')"
      data-testid="safety-guardrails-configure"
    />
  </section>
</template>

<style lang="scss" scoped>
.safety-guardrails {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $unnnic-space-2;

  padding: $unnnic-space-4;

  border: 1px solid $unnnic-color-border-base;
  border-radius: $unnnic-radius-2;

  &__content {
    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;

    min-width: 0;
  }

  &__title {
    margin: 0;

    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    margin: 0;

    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
