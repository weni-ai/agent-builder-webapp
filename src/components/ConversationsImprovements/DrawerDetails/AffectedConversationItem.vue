<template>
  <section
    class="affected-conversation-item"
    :class="{
      'affected-conversation-item--expanded': isExpanded,
      'affected-conversation-item--first': isFirst,
      'affected-conversation-item--last': isLast,
    }"
    :data-testid="`affected-conversation-item-${conversation.uuid}`"
  >
    <button
      class="affected-conversation-item__header"
      type="button"
      :data-testid="`affected-conversation-item-toggle-${conversation.uuid}`"
      @click="emit('toggle')"
    >
      <UnnnicIcon
        :icon="isExpanded ? 'keyboard_arrow_down' : 'chevron_forward'"
        size="ant"
        scheme="fg-emphasized"
        :data-testid="`affected-conversation-item-icon-${conversation.uuid}`"
      />

      <p
        class="affected-conversation-item__label"
        :data-testid="`affected-conversation-item-label-${conversation.uuid}`"
      >
        {{ contactLabel }}
      </p>
    </button>

    <section
      v-if="isExpanded"
      class="affected-conversation-item__content"
      :data-testid="`affected-conversation-item-content-${conversation.uuid}`"
    >
      <section class="affected-conversation-item__messages">
        <QuestionAndAnswer
          v-for="message in conversation.messages"
          :key="message.uuid"
          :data="
            mapMessageToQuestionAndAnswer(message, conversation.contactName)
          "
          :isLoading="false"
          :showViewLogs="false"
          :showDate="false"
          :scheme="questionAndAnswerScheme(message)"
          :data-testid="`affected-conversation-item-message-${conversation.uuid}`"
        />
      </section>

      <UnnnicButton
        class="affected-conversation-item__view-full-button"
        type="secondary"
        size="small"
        :text="$t('audit.improvements.drawer.view_full_conversation')"
        :data-testid="`affected-conversation-item-view-full-${conversation.uuid}`"
        @click="emit('view-full')"
      />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { mapMessageToQuestionAndAnswer } from '@/api/adapters/supervisor/affectedConversations';

import QuestionAndAnswer from '@/views/Supervisor/SupervisorConversations/Conversation/QuestionAndAnswer/index.vue';

import type {
  AffectedConversation,
  AffectedConversationMessage,
} from '@/store/types/Improvements.types';

const props = defineProps<{
  conversation: AffectedConversation;
  isExpanded: boolean;
  isFirst: boolean;
  isLast: boolean;
}>();

const emit = defineEmits<{
  toggle: [];
  'view-full': [];
}>();

const contactLabel = computed(
  () => props.conversation.contactName || props.conversation.contactUrn,
);

const questionAndAnswerScheme = (message: AffectedConversationMessage) => {
  return message.source === 'incoming'
    ? 'improvement-incoming'
    : 'improvement-outgoing';
};
</script>

<style scoped lang="scss">
.affected-conversation-item {
  border: 1px solid $unnnic-color-border-soft;
  margin-bottom: -1px;

  &--first {
    border-top-left-radius: $unnnic-radius-2;
    border-top-right-radius: $unnnic-radius-2;
  }

  &--last {
    border-bottom-left-radius: $unnnic-radius-2;
    border-bottom-right-radius: $unnnic-radius-2;
  }

  &__header {
    width: 100%;
    padding: $unnnic-space-3 $unnnic-space-4;

    display: flex;
    align-items: center;
    gap: $unnnic-space-2;

    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  &--expanded &__header {
    padding-bottom: $unnnic-space-2;
  }

  &__label {
    @include unnnic-font-action;
    color: $unnnic-color-fg-emphasized;
  }

  &__content {
    padding: 0 $unnnic-space-4 $unnnic-space-4;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__messages {
    background-color: $unnnic-color-bg-base-soft;
    border-radius: $unnnic-radius-2;
    padding: $unnnic-space-4;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-2;
  }

  &__view-full-button {
    align-self: flex-start;
  }
}
</style>
