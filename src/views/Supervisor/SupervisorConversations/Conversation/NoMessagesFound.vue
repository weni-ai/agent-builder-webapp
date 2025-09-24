<template>
  <section class="no-messages-found">
    <UnnnicIcon
      icon="sms"
      scheme="neutral-soft"
      filled
      class="no-messages-found__icon"
      data-testid="no-messages-icon"
    />

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-cloudy"
      family="secondary"
      size="body-gt"
      class="no-messages-found__title"
      data-testid="no-messages-title"
    >
      {{ $t('agent_builder.supervisor.no_messages_found.title') }}
    </UnnnicIntelligenceText>

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-clean"
      family="secondary"
      size="body-md"
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
    </UnnnicIntelligenceText>
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
  gap: $unnnic-spacing-nano;

  height: 100%;

  text-align: center;

  & &__icon {
    $icon-size: 3.5 * $unnnic-font-size;

    font-size: $icon-size;
  }

  &__link {
    color: $unnnic-color-neutral-clean;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
}
</style>
