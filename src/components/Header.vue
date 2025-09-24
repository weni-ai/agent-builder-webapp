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
      <UnnnicIntelligenceText
        tag="h1"
        size="title-sm"
        family="secondary"
        weight="bold"
        color="neutral-darkest"
        data-testid="agent-builder-header-title"
      >
        {{ currentView?.title }}
      </UnnnicIntelligenceText>
      <UnnnicIntelligenceText
        tag="h2"
        size="body-gt"
        family="secondary"
        color="neutral-cloudy"
        data-testid="agent-builder-header-description"
      >
        {{ currentView?.description }}

        <SupervisorHeaderDetails
          v-if="
            currentView.page === 'supervisor' &&
            featureFlagsStore.flags.newSupervisor
          "
        />
      </UnnnicIntelligenceText>
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

import useAgentBuilderViews from '@/composables/useAgentBuilderViews';

import SupervisorHeaderDetails from './Supervisor/SupervisorHeaderDetails.vue';

import { useFeatureFlagsStore } from '@/store/FeatureFlags';

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

const featureFlagsStore = useFeatureFlagsStore();

const currentView = computed(() => {
  const views = useAgentBuilderViews();
  return views.value.find((e) => e.page === route.name) || views.value[0];
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
  }

  &--actions-lg {
    grid-template-columns: 6fr 6fr;
  }

  &--actions-none {
    grid-template-columns: 9fr 0fr;
  }
}
</style>
