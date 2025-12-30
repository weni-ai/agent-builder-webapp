<template>
  <section class="conversation-example">
    <p class="conversation-example__title">
      {{ conversationExample.title }}
    </p>

    <div class="conversation-example__content">
      <article
        class="conversation-example__bubble conversation-example__bubble--customer"
      >
        <p class="conversation-example__bubble-author">
          {{ conversationExample.customerLabel }}
        </p>

        <p class="conversation-example__bubble-message">
          {{ conversationExample.customerMessage }}
        </p>
      </article>

      <article
        class="conversation-example__bubble conversation-example__bubble--concierge"
      >
        <p class="conversation-example__bubble-author">
          {{ conversationExample.conciergeLabel }}
        </p>

        <p class="conversation-example__bubble-message">
          {{ conversationExample.conciergeMessage }}
        </p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const conversationExample = computed(() => ({
  title: t('agents.assign_agents.setup.conversation_example.title'),
  customerLabel: t(
    'agents.assign_agents.setup.conversation_example.customer_label',
  ),
  customerMessage: t(
    'agents.assign_agents.setup.conversation_example.customer_message',
  ),
  conciergeLabel: t(
    'agents.assign_agents.setup.conversation_example.concierge_label',
  ),
  conciergeMessage: t(
    'agents.assign_agents.setup.conversation_example.concierge_message',
  ),
}));
</script>

<style scoped lang="scss">
.conversation-example {
  grid-row: 1 / 3;
  grid-column: 2 / 3;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-2;

  &__title {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-display-3;
  }

  &__content {
    background-color: $unnnic-color-blue-200;
    border-radius: $unnnic-radius-4;
    padding: $unnnic-space-6 $unnnic-space-6;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-4;
    justify-content: center;

    height: 100%;
  }

  &__bubble {
    max-width: 100%;

    padding: $unnnic-space-3 $unnnic-space-4;

    border-radius: $unnnic-radius-2;
    box-shadow: $unnnic-shadow-1;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;
  }

  &__bubble--customer {
    border-top-left-radius: 0;

    align-self: flex-start;
    margin-right: $unnnic-space-8;
    background-color: $unnnic-color-bg-base;
  }

  &__bubble--concierge {
    border-top-right-radius: 0;

    align-self: flex-end;
    margin-left: $unnnic-space-8;
    background-color: $unnnic-color-teal-50;
  }

  &__bubble-author {
    color: $unnnic-color-fg-emphasized;
    font: $unnnic-font-caption-2;
    font-weight: $unnnic-font-weight-bold;
  }

  &__bubble-message {
    color: $unnnic-color-fg-base;
    font: $unnnic-font-caption-1;
  }
}
</style>
