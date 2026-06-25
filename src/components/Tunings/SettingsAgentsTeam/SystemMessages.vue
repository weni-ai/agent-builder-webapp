<template>
  <section
    class="system-messages"
    data-testid="system-messages"
  >
    <h2
      class="system-messages__title"
      data-testid="system-messages-title"
    >
      {{ $t('agent_builder.tunings.system_messages.title') }}
    </h2>

    <UnnnicSkeletonLoading
      v-if="isLoading"
      tag="div"
      width="100%"
      height="120px"
      data-testid="system-messages-skeleton"
    />

    <UnnnicFormElement
      v-else
      class="system-messages__field"
      data-testid="system-messages-field"
      :label="$t('agent_builder.tunings.system_messages.error_message.label')"
      :tooltip="{
        text: $t('agent_builder.tunings.system_messages.error_message.tooltip'),
        side: 'top',
        maxWidth: '550px',
      }"
    >
      <UnnnicTextArea
        v-model="tuningsStore.settings.data.errorMessage"
        data-testid="system-messages-error-message"
        :maxLength="1000"
      />
    </UnnnicFormElement>
  </section>
</template>

<script setup>
import { computed } from 'vue';

import { useTuningsStore } from '@/store/Tunings';

const tuningsStore = useTuningsStore();

const isLoading = computed(() => tuningsStore.settings.status === 'loading');
</script>

<style lang="scss" scoped>
.system-messages {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__title {
    @include unnnic-font-action;
    color: $unnnic-color-fg-base;
  }

  &__field {
    width: 100%;
  }
}
</style>
