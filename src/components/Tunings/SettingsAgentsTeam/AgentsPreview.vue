<template>
  <section class="agents-preview">
    <UnnnicIntelligenceText
      tag="p"
      family="secondary"
      size="body-lg"
      color="neutral-darkest"
      weight="bold"
      data-testid="title"
    >
      {{ $t('router.tunings.settings.agents_preview.title') }}
    </UnnnicIntelligenceText>

    <form class="agents-preview__form">
      <SettingsField
        v-model="tuningsStore.settings.data.progressiveFeedback"
        data-testid="progressive-feedback"
        :textRight="
          $t(
            'router.tunings.settings.agents_preview.agents_progressive_feedback.title',
          )
        "
        :description="
          $t(
            'router.tunings.settings.agents_preview.agents_progressive_feedback.description',
          )
        "
        :loading="isLoading"
      />

      <SettingsField
        v-model="tuningsStore.settings.data.components"
        data-testid="components"
        :textRight="
          $t(
            'router.tunings.settings.agents_preview.multiple_message_format.title',
          )
        "
        :description="
          $t(
            'router.tunings.settings.agents_preview.multiple_message_format.description',
          )
        "
        :loading="isLoading"
      />
    </form>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useTuningsStore } from '@/store/Tunings';
import { useProjectStore } from '@/store/Project';

import SettingsField from './SettingsField.vue';

const tuningsStore = useTuningsStore();
const projectStore = useProjectStore();

const isLoading = computed(() => {
  return (
    projectStore.details.status === 'loading' ||
    tuningsStore.settings.status === 'loading'
  );
});
</script>

<style lang="scss" scoped>
.agents-preview {
  display: flex;
  flex-direction: column;
  gap: $unnnic-spacing-sm;

  &__form {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-sm;

    .form__field {
      display: flex;
      flex-direction: column;
      gap: $unnnic-spacing-nano;
    }
  }
}
</style>
