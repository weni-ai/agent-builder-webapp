<template>
  <section class="conversation-details">
    <DetailsTable :isCollapsed="isCollapsed" />

    <UnnnicButton
      type="secondary"
      @click="goToStudio"
    >
      {{ $t('agent_builder.supervisor.view_full_history') }}
    </UnnnicButton>

    <button
      class="conversation-details__collapse-button"
      @click="isCollapsed = !isCollapsed"
    >
      {{ $t('agent_builder.supervisor.conversation_details_collapse') }}
      <UnnnicIcon
        icon="keyboard_arrow_up"
        :class="[
          'conversation-details__collapse-button-icon',
          {
            'conversation-details__collapse-button-icon--collapsed':
              isCollapsed,
          },
        ]"
        size="ant"
        scheme="fg-base"
      />
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useProjectStore } from '@/store/Project';

import env from '@/utils/env';

import DetailsTable from './Table.vue';

const isCollapsed = ref(true);

function goToStudio() {
  window.open(
    `${env('CONNECT_URL')}/projects/${useProjectStore().uuid}/studio/contact`,
    '_blank',
  );
}
</script>

<style scoped lang="scss">
.conversation-details {
  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__collapse-button {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    font: $unnnic-font-action;
    color: $unnnic-color-fg-base;

    &-icon {
      &--collapsed {
        transform: rotate(180deg);
      }
    }
  }
}
</style>
