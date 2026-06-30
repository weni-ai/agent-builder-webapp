<template>
  <UnnnicTableRow
    data-testid="improvement-row"
    class="improvement-row"
    :class="{
      'improvement-row--selected': isSelected,
    }"
  >
    <UnnnicTableCell
      class="improvements-list__col improvements-list__col--improvement"
    >
      <p
        class="improvement-row__text"
        data-testid="improvement-row-text"
      >
        {{ improvement.text }}
      </p>
    </UnnnicTableCell>

    <UnnnicTableCell
      class="improvements-list__col improvements-list__col--type"
    >
      <UnnnicTag
        class="improvement-row__type"
        data-testid="improvement-row-type"
        :scheme="typeTag.scheme"
        :text="typeTag.text"
      />
    </UnnnicTableCell>

    <UnnnicTableCell
      class="improvements-list__col improvements-list__col--affected_conversations"
    >
      <p
        class="improvement-row__conversations-count"
        data-testid="improvement-row-conversations-count"
      >
        {{ improvement.conversationsCount }}
      </p>
    </UnnnicTableCell>
  </UnnnicTableRow>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  Improvement,
  ImprovementType,
} from '@/store/types/Improvements.types';

type ImprovementTagCategory =
  | 'behavior'
  | 'custom_analysis'
  | 'knowledge'
  | 'technical_issue';

const IMPROVEMENT_TYPE_CATEGORY_MAP: Record<
  ImprovementType,
  ImprovementTagCategory
> = {
  many_questions_before_answering: 'behavior',
  wrong_behavior_due_to_instructions: 'behavior',
  missing_static_knowledge: 'knowledge',
  personality_deviation: 'behavior',
  poor_product_search_results: 'technical_issue',
  repetitive_response: 'behavior',
  custom_analysis: 'custom_analysis',
};

const IMPROVEMENT_TAG_SCHEME_MAP: Record<ImprovementTagCategory, string> = {
  behavior: 'blue',
  knowledge: 'purple',
  technical_issue: 'orange',
  custom_analysis: 'yellow',
};

const props = withDefaults(
  defineProps<{
    improvement: Improvement;
    isSelected?: boolean;
  }>(),
  {
    isSelected: false,
  },
);

const { t } = useI18n();

const typeTag = computed(() => {
  const category = IMPROVEMENT_TYPE_CATEGORY_MAP[props.improvement.type];

  return {
    scheme: IMPROVEMENT_TAG_SCHEME_MAP[category],
    text: t(`audit.improvements.types.${category}`),
  };
});
</script>

<style scoped lang="scss">
.improvement-row {
  &--selected {
    background-color: $unnnic-color-bg-base-soft;
  }

  &__text,
  &__conversations-count {
    @include unnnic-font-body;
    color: $unnnic-color-fg-base;
  }

  &__type {
    white-space: nowrap;
  }
}
</style>
