<template>
  <section class="agents-preview">
    <h2
      class="agents-preview__title"
      data-testid="title"
    >
      {{ $t('router.tunings.settings.agents_preview.title') }}
    </h2>

    <form class="agents-preview__form">
      <SettingsField
        v-model="tuningsStore.settings.data.components"
        data-testid="components"
        :disabled="isComponentsDisabled"
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

      <SettingsField
        v-if="showProgressiveFeedback"
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
    </form>
  </section>
</template>

<script setup>
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';

import { useTuningsStore } from '@/store/Tunings';
import { useProjectStore } from '@/store/Project';
import { useManagerSelectorStore } from '@/store/ManagerSelector';
import { useEngineSourceStore } from '@/store/EngineSource';

import SettingsField from './SettingsField.vue';

const tuningsStore = useTuningsStore();
const projectStore = useProjectStore();
const managerSelectorStore = useManagerSelectorStore();
const engineSourceStore = useEngineSourceStore();

const { selectedManager, newManagerAcceptsComponents } =
  storeToRefs(managerSelectorStore);

const isLoading = computed(() => {
  return (
    projectStore.details.status === 'loading' ||
    tuningsStore.settings.status === 'loading'
  );
});

const showProgressiveFeedback = computed(() => {
  return !useProjectStore().details?.backend?.toLowerCase().includes('openai');
});

const isComponentsDisabled = computed(() => {
  if (engineSourceStore.engineType === 'custom') {
    return !engineSourceStore.selectedProviderAcceptsComponents;
  }

  const { managers } = managerSelectorStore.options;
  return (
    !newManagerAcceptsComponents.value &&
    selectedManager.value === managers?.new?.id
  );
});

watch(isComponentsDisabled, (disabled) => {
  if (disabled) {
    tuningsStore.settings.data.components = false;
  }
});
</script>

<style lang="scss" scoped>
.agents-preview {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-3;

  &__title {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

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
