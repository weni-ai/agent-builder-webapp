<template>
  <section class="no-messages-found">
    <UnnnicIcon
      icon="chat_bubble"
      scheme="gray-100"
      filled
      class="no-messages-found__icon"
      data-testid="no-messages-icon"
    />

    <p
      class="no-messages-found__title"
      data-testid="no-messages-title"
    >
      {{ $t('agent_builder.supervisor.no_messages_found.title') }}
    </p>

    <p
      class="no-messages-found__description"
      data-testid="no-messages-description"
    >
      <!-- eslint-disable-next-line vue/component-name-in-template-casing -->
      <i18n-t
        keypath="agent_builder.supervisor.no_messages_found.description"
        tag="p"
        data-testid="no-messages-description-i18n"
      >
        <template #studio_link>
          <a
            :href="`${env('CONNECT_URL')}/projects/${projectStore.uuid}/studio/contact`"
            class="no-messages-found__link"
            target="_blank"
            data-testid="studio-link"
          >
            {{ $t('agent_builder.supervisor.no_messages_found.studio_link') }}
          </a>
        </template>
      </i18n-t>
    </p>
  </section>
</template>

<script setup>
import { useProjectStore } from '@/store/Project';
import env from '@/utils/env';

const projectStore = useProjectStore();
</script>

<style scoped lang="scss">
.no-messages-found {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: $unnnic-space-1;

  height: 100%;

  text-align: center;

  & &__icon {
    $icon-size: 3.5 * $unnnic-font-size;

    font-size: $icon-size;
  }

  &__title {
    font: $unnnic-font-display-3;
    color: $unnnic-color-gray-900;
  }

  &__description {
    font: $unnnic-font-caption-2;
    color: $unnnic-color-gray-300;
  }

  &__link {
    color: $unnnic-color-gray-300;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
}
</style>
