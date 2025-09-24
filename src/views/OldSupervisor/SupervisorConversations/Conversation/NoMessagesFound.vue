<template>
  <section class="no-messages-found">
    <UnnnicIcon
      icon="search_off"
      scheme="neutral-dark"
      class="no-messages-found__icon"
      data-testid="no-messages-icon"
    />

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-dark"
      family="secondary"
      size="body-gt"
      weight="bold"
      class="no-messages-found__title"
      data-testid="no-messages-title"
    >
      {{ $t('agent_builder.supervisor.no_messages_found.title') }}
    </UnnnicIntelligenceText>

    <UnnnicIntelligenceText
      tag="p"
      color="neutral-dark"
      family="secondary"
      size="body-gt"
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

  height: calc(100vh - ($unnnic-spacing-xgiant + $unnnic-spacing-ant));

  text-align: center;

  & &__icon {
    $icon-size: 3.5 * $unnnic-font-size;

    font-size: $icon-size;
  }

  &__title {
    margin: $unnnic-spacing-ant 0 $unnnic-spacing-nano 0;
  }

  &__link {
    color: $unnnic-color-neutral-dark;
    font-weight: $unnnic-font-weight-bold;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
  }
}
</style>
