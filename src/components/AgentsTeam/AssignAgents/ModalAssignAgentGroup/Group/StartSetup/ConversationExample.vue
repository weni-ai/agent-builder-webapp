<template>
  <section
    class="conversation-example"
    data-testid="conversation-example"
  >
    <p
      class="conversation-example__title"
      data-testid="conversation-example-title"
    >
      {{ conversationMeta.title }}
    </p>

    <article class="conversation-example__content">
      <section
        v-for="(message, index) in messages"
        :key="`${message.direction}-${index}`"
        :class="[
          'conversation-example__bubble',
          `conversation-example__bubble--${message.direction}`,
        ]"
        :data-testid="`conversation-example-bubble-${message.direction}`"
      >
        <p class="conversation-example__bubble-author">
          {{ message.label }}
        </p>

        <p class="conversation-example__bubble-message">
          {{ message.text }}
        </p>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  agentName: string;
  conversationExample: {
    direction: 'incoming' | 'outgoing';
    text: string;
  }[];
}>();

const conversationMeta = computed(() => ({
  title: t('agents.assign_agents.setup.conversation_example.title'),
}));

const messages = computed(() =>
  (props.conversationExample || []).map((message) => ({
    direction: message.direction ?? 'outgoing',
    text: message.text,
    label:
      message.direction === 'incoming'
        ? t('agents.assign_agents.setup.conversation_example.customer_label')
        : props.agentName,
  })),
);
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

  &__bubble--incoming {
    border-top-left-radius: 0;

    align-self: flex-start;
    margin-right: $unnnic-space-8;
    background-color: $unnnic-color-bg-base;
  }

  &__bubble--outgoing {
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
