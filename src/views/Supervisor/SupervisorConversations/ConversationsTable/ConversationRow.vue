<template>
  <UnnnicTableRow
    data-testid="conversation-row"
    class="conversation-row"
    :class="{
      'conversation-row--selected': isSelected,
    }"
  >
    <UnnnicTableCell
      class="conversations-table__col conversations-table__col--contact"
    >
      <ConversationInfos
        :username="conversation.username"
        :urn="conversation.urn"
        :isAmazing="conversation.is_amazing"
      />
    </UnnnicTableCell>

    <UnnnicTableCell
      class="conversations-table__col conversations-table__col--status"
    >
      <UnnnicToolTip
        v-if="statusProps.text"
        side="top"
        :text="$t('audit.conversations.unclassified_status_tooltip')"
        :enabled="conversation.status === 'unclassified'"
      >
        <UnnnicTag
          class="cell__status"
          data-testid="conversation-row-status"
          :scheme="statusProps.scheme"
          :text="statusProps.text"
        />
      </UnnnicToolTip>
    </UnnnicTableCell>

    <UnnnicTableCell
      class="conversations-table__col conversations-table__col--feedback"
    >
      <p
        class="conversation-row__feedback"
        data-testid="conversation-row-feedback"
      >
        {{ feedbackText }}
      </p>
    </UnnnicTableCell>

    <UnnnicTableCell
      class="conversations-table__col conversations-table__col--date"
    >
      <p
        class="conversation-row__date"
        data-testid="conversation-row-date"
      >
        {{ formatConversationDate(conversation.start) }}
      </p>
    </UnnnicTableCell>

    <UnnnicTableCell
      class="conversations-table__col conversations-table__col--hour"
    >
      <p
        class="conversation-row__time"
        data-testid="conversation-row-time"
      >
        {{ formatConversationTime(conversation.start) }}
      </p>
    </UnnnicTableCell>
  </UnnnicTableRow>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

import {
  formatConversationDate,
  formatConversationTime,
} from '@/utils/formatters';
import ConversationInfos from './ConversationInfos.vue';

import type { Conversation } from '@/store/types/Conversations.types';

const props = withDefaults(
  defineProps<{
    conversation?: Conversation;
    isSelected?: boolean;
  }>(),
  {
    conversation: undefined,
    isSelected: false,
  },
);

const t = (key: string) => i18n.global.t(key);

const statusProps = computed(() => {
  const status = props.conversation.status;

  const baseStatus = {
    text: status ? t(`audit.conversations.filters.status.${status}`) : '',
  };

  const mapStatus = {
    in_progress: {
      scheme: 'blue',
    },
    optimized_resolution: {
      scheme: 'green',
    },
    other_conclusion: {
      scheme: 'red',
    },
    unclassified: {
      scheme: 'gray',
    },
    transferred_to_human_support: {
      scheme: 'yellow',
    },
  };

  return {
    ...baseStatus,
    ...mapStatus[status],
  };
});

const feedbackText = computed(() => {
  if (!props.conversation.csat) return '-';

  const csat = props.conversation.csat;
  const csatTranslation = i18n.global.t(
    `audit.conversations.filters.csat.${csat.id}`,
  );

  return `${csatTranslation} | CSAT: ${csat.score}`;
});
</script>

<style lang="scss" scoped>
.conversation-row {
  &--selected {
    background-color: $unnnic-color-bg-base-soft;
  }

  &__feedback {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__date,
  &__time {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  .cell__status {
    white-space: nowrap;
  }
}
</style>
