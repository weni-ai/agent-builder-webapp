<template>
  <section
    class="no-improvement-identified"
    data-testid="no-improvement-identified"
  >
    <hgroup class="no-improvement-identified__content">
      <h2
        class="no-improvement-identified__title"
        data-testid="no-improvement-identified-title"
      >
        <span
          class="no-improvement-identified__emoji"
          aria-hidden="true"
        >
          🎉
        </span>
        <p>{{ $t('audit.improvements.no_improvement_identified.title') }}</p>
      </h2>
      <p
        class="no-improvement-identified__description"
        data-testid="no-improvement-identified-description"
      >
        {{ $t('audit.improvements.no_improvement_identified.description') }}
      </p>
    </hgroup>
  </section>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.no-improvement-identified {
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-1;

    text-align: center;
  }

  &__title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-05;

    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
