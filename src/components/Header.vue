<template>
  <header
    :class="[
      'agent-builder-header',
      {
        'agent-builder-header--actions-lg': actionsSize === 'lg',
        'agent-builder-header--actions-none': actionsSize === 'none',
      },
      props.class,
    ]"
    data-testid="agent-builder-header"
  >
    <section class="agent-builder-header__title">
      <h1
        class="agent-builder-header__title-text"
        data-testid="agent-builder-header-title"
      >
        {{ currentView?.title }}
      </h1>
      <h2
        class="agent-builder-header__title-description"
        data-testid="agent-builder-header-description"
      >
        {{ currentView?.description }}

        <SupervisorHeaderDetails v-if="currentView.page === 'conversations'" />
      </h2>
    </section>

    <slot name="actions" />
  </header>

  <UnnnicDivider
    v-if="withDivider"
    ySpacing="md"
    data-testid="agent-builder-header-divider"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import useBuildViews from '@/composables/useBuildViews';

import SupervisorHeaderDetails from './Supervisor/SupervisorHeaderDetails.vue';

import i18n from '@/utils/plugins/i18n';

const route = useRoute();

const props = defineProps({
  class: {
    type: String,
    default: '',
  },

  withDivider: {
    type: Boolean,
    default: true,
  },

  actionsSize: {
    type: String,
    default: 'md',
    validator: (value) => {
      return ['none', 'md', 'lg'].includes(value);
    },
  },
});

const currentView = computed(() => {
  const { t } = i18n.global;

  const views = [
    ...useBuildViews().value,
    {
      title: t('agent_builder.tabs.conversations.title'),
      description: t('agent_builder.tabs.conversations.description'),
      page: 'conversations',
    },
    {
      title: t('agent_builder.tabs.agents.title'),
      description: t('agent_builder.tabs.agents.description'),
      page: 'agents',
    },
  ];

  return views.find((e) => e.page === route.name) || views[0];
});
</script>

<style lang="scss" scoped>
.agent-builder-header {
  display: grid;
  grid-template-columns: 9fr 3fr;
  gap: $unnnic-spacing-sm;
  align-items: center;

  &__title {
    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;

    &-text {
      @include unnnic-font-display-1;
      color: $unnnic-color-fg-emphasized;
    }

    &-description {
      @include unnnic-font-body;
      color: $unnnic-color-fg-base;
    }
  }

  &--actions-lg {
    grid-template-columns: 6fr 6fr;
  }

  &--actions-none {
    grid-template-columns: 9fr 0fr;
  }
}
</style>
