<template>
  <section
    class="insufficient-conversations-volume"
    data-testid="insufficient-conversations-volume"
  >
    <header class="insufficient-conversations-volume__header">
      <h2
        class="insufficient-conversations-volume__title"
        data-testid="insufficient-conversations-volume-title"
      >
        {{ $t('audit.improvements.insufficient_volume.title') }}
      </h2>
      <p
        class="insufficient-conversations-volume__description"
        data-testid="insufficient-conversations-volume-description"
      >
        {{ $t('audit.improvements.insufficient_volume.description') }}
      </p>
    </header>

    <RunAnalysisButton
      data-testid="insufficient-conversations-volume-run-button"
    />
  </section>
</template>

<script setup lang="ts">
import RunAnalysisButton from '@/components/ConversationsImprovements/RunAnalysisButton.vue';
</script>

<style scoped lang="scss">
.insufficient-conversations-volume {
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: $unnnic-space-4;

  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $unnnic-space-1;

    text-align: center;
  }

  &__title {
    font: $unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__description {
    font: $unnnic-font-body;
    color: $unnnic-color-fg-base;
  }
}
</style>
