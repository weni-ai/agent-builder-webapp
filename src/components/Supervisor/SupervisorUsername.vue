<template>
  <section class="supervisor-username">
    <h3
      data-testid="supervisor-username"
      class="supervisor-username__text"
      :class="`supervisor-username__text--${font}`"
    >
      {{ displayName }}
    </h3>
    <UnnnicPopover
      v-if="isAmazing"
      v-model:open="isPopoverOpen"
      class="is-amazing-popover"
      data-testid="amazing-conversation-popover"
    >
      <UnnnicPopoverTrigger
        class="supervisor-username__is-amazing"
        data-testid="amazing-conversation-trigger"
        @mouseenter="isPopoverOpen = true"
        @mouseleave="isPopoverOpen = false"
      >
        <UnnnicIcon
          class="is-amazing__icon"
          icon="star"
          filled
          scheme="fg-accent"
          size="sm"
          data-testid="amazing-conversation-icon"
        />
      </UnnnicPopoverTrigger>
      <UnnnicPopoverContent
        class="is-amazing-popover__content"
        side="top"
        size="large"
        :align="font === 'emphasis' ? 'start' : 'end'"
        data-testid="amazing-conversation-content"
        @close-auto-focus.prevent
      >
        <p
          class="is-amazing-popover__title"
          data-testid="amazing-conversation-title"
        >
          {{ $t('audit.conversations.amazing_conversation.title') }}
        </p>
        <p
          class="is-amazing-popover__description"
          data-testid="amazing-conversation-description"
        >
          {{ $t('audit.conversations.amazing_conversation.description') }}
        </p>
      </UnnnicPopoverContent>
    </UnnnicPopover>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import i18n from '@/utils/plugins/i18n';

const props = withDefaults(
  defineProps<{
    username?: string;
    fallbackKey?: string;
    font?: 'emphasis' | 'display-2';
    isAmazing?: boolean;
  }>(),
  {
    username: '',
    fallbackKey: 'audit.conversations.unnamed_contact',
    font: 'emphasis',
    isAmazing: false,
  },
);

const isPopoverOpen = ref(false);

const displayName = computed(() => {
  return props.username || `[${i18n.global.t(props.fallbackKey)}]`;
});
</script>

<style scoped lang="scss">
.supervisor-username {
  display: flex;
  align-items: center;
  gap: $unnnic-space-2;

  &__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: $unnnic-color-fg-emphasized;
    &--emphasis {
      @include unnnic-font-emphasis;
    }

    &--display-2 {
      @include unnnic-font-display-2;
    }
  }

  &__is-amazing {
    background-color: $unnnic-color-bg-accent-plain;
    border-radius: $unnnic-radius-full;

    padding: $unnnic-space-05;

    display: flex;
  }
}

.is-amazing-popover {
  color: $unnnic-color-fg-emphasized;

  &__title {
    @include unnnic-font-display-3;
    margin-bottom: $unnnic-space-2;
  }

  &__description {
    @include unnnic-font-body;
  }
}
</style>
