<template>
  <UnnnicSkeletonLoading
    v-if="isLoading"
    tag="div"
    width="100%"
    height="58px"
  />

  <tr
    v-else
    class="conversation-row"
    :class="{
      'conversation-row--selected': isSelected,
      'conversation-row--with-divider': showDivider,
    }"
  >
    <section class="conversation-row__main-infos">
      <td class="main-infos__avatar">
        <AvatarLetter :text="conversation?.username" />
      </td>

      <td class="main-infos__user-data">
        <ConversationInfos
          :username="conversation.username"
          :urn="conversation.urn"
        />
      </td>

      <td class="main-infos__status">
        <UnnnicToolTip
          v-if="statusProps.text"
          side="top"
          :text="$t('agent_builder.supervisor.unclassified_status_tooltip')"
          :enabled="conversation.status === 'unclassified'"
        >
          <UnnnicTag
            class="cell__status"
            :scheme="statusProps.scheme"
            :text="statusProps.text"
          />
        </UnnnicToolTip>
      </td>
    </section>

    <section class="conversation-row__secondary-infos">
      <td
        v-if="csatText"
        class="secondary-infos__csat"
      >
        <UnnnicTag :text="csatText" />
      </td>

      <td class="secondary-infos__date">
        <ConversationDate :date="conversation.start" />
      </td>
    </section>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import i18n from '@/utils/plugins/i18n';

import ConversationDate from './ConversationDate.vue';
import ConversationInfos from './ConversationInfos.vue';
import AvatarLetter from '@/components/Supervisor/AvatarLetter.vue';

import type { Conversation } from '@/store/types/Conversations.types';

const props = withDefaults(
  defineProps<{
    conversation?: Conversation;
    isSelected?: boolean;
    isLoading?: boolean;
    showDivider?: boolean;
  }>(),
  {
    conversation: undefined,
    isSelected: false,
    isLoading: false,
    showDivider: false,
  },
);

const t = (key: string) => i18n.global.t(key);

const statusProps = computed(() => {
  const status = props.conversation.status;

  const baseStatus = {
    text: status ? t(`agent_builder.supervisor.filters.status.${status}`) : '',
  };

  const mapStatus = {
    in_progress: {
      scheme: 'aux-blue-500',
    },
    optimized_resolution: {
      scheme: 'aux-green-500',
    },
    other_conclusion: {
      scheme: 'aux-red-500',
    },
    unclassified: {
      scheme: 'neutral-cloudy',
    },
    transferred_to_human_support: {
      scheme: 'aux-yellow-500',
    },
  };

  return {
    ...baseStatus,
    ...mapStatus[status],
  };
});

const csatText = computed(() => {
  if (!props.conversation.csat) return '';

  const csat = props.conversation.csat;
  const csatTranslation = i18n.global.t(
    `agent_builder.supervisor.filters.csat.${csat.id}`,
  );

  return `${csatTranslation} | CSAT: ${csat.score}`;
});
</script>

<style lang="scss" scoped>
.conversation-row {
  overflow: hidden;

  position: relative;

  border-radius: $unnnic-border-radius-md;

  padding: $unnnic-spacing-xs $unnnic-spacing-sm;

  display: flex;
  gap: $unnnic-spacing-sm;
  align-items: center;
  justify-content: space-between;

  cursor: pointer;

  &--selected,
  &:hover {
    background-color: $unnnic-color-background-sky;
  }

  &--with-divider::after {
    content: '';
    background-color: $unnnic-color-neutral-light;

    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);

    width: calc(100% - $unnnic-spacing-sm * 2);
    height: $unnnic-border-width-thinner;
  }

  td {
    padding: 0;
  }

  &__main-infos,
  &__secondary-infos {
    display: flex;
    gap: $unnnic-spacing-sm;
    align-items: center;
  }

  .main-infos__status,
  .secondary-infos__date,
  .secondary-infos__csat {
    white-space: nowrap;

    :deep(.unnnic-tag),
    :deep(.unnnic-tag__label) {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &__main-infos {
    .main-infos__status {
      overflow: hidden;

      display: flex;
      gap: $unnnic-spacing-nano;
    }
  }

  &__secondary-infos {
    .secondary-infos__csat {
      :deep(.unnnic-tag) {
        background-color: transparent;
        border: 1px solid $unnnic-color-neutral-cleanest;
      }

      :deep(.unnnic-tag__label) {
        color: $unnnic-color-neutral-cloudy;
      }
    }
  }
}
</style>
