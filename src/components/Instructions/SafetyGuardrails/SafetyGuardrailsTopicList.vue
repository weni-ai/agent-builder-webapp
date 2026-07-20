<template>
  <ul
    v-if="loading"
    class="safety-guardrails-topic-list"
    data-testid="safety-guardrails-topic-list-loading"
  >
    <li
      v-for="index in SKELETON_COUNT"
      :key="index"
      class="safety-guardrails-topic-list__item"
      :data-testid="`safety-guardrails-topic-skeleton-${index}`"
    >
      <div class="safety-guardrails-topic-list__skeleton-content">
        <div class="safety-guardrails-topic-list__skeleton-row">
          <UnnnicSkeletonLoading
            tag="div"
            width="38px"
            height="20px"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="150px"
            height="20px"
          />
        </div>
        <div class="safety-guardrails-topic-list__skeleton-row">
          <span
            class="safety-guardrails-topic-list__skeleton-spacer"
            aria-hidden="true"
          />
          <UnnnicSkeletonLoading
            tag="div"
            width="300px"
            height="16px"
          />
        </div>
      </div>

      <UnnnicSkeletonLoading
        tag="div"
        width="50px"
        height="16px"
      />
    </li>
  </ul>

  <ul
    v-else
    class="safety-guardrails-topic-list"
    data-testid="safety-guardrails-topic-list"
  >
    <li
      v-for="topic in topics"
      :key="topic.id"
      class="safety-guardrails-topic-list__item"
      :data-testid="`safety-guardrails-topic-${topic.id}`"
    >
      <UnnnicSwitch
        class="safety-guardrails-topic-list__switch"
        :modelValue="topic.enabled"
        :textRight="
          $t(`agents.instructions.safety_guardrails.topics.${topic.id}.name`)
        "
        :helper="
          $t(
            `agents.instructions.safety_guardrails.topics.${topic.id}.description`,
          )
        "
        :data-testid="`safety-guardrails-topic-switch-${topic.id}`"
        @update:model-value="onToggle(topic.id, $event)"
      />

      <p
        class="safety-guardrails-topic-list__status"
        :data-testid="`safety-guardrails-topic-status-${topic.id}`"
      >
        {{
          $t(
            `agents.instructions.safety_guardrails.${
              topic.enabled ? 'blocked' : 'allowed'
            }`,
          )
        }}
      </p>
    </li>
  </ul>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const SKELETON_COUNT = Object.keys(
  t('agents.instructions.safety_guardrails.topics'),
).length;

defineProps({
  topics: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:topic-enabled']);

function onToggle(topicId, enabled) {
  emit('update:topic-enabled', { id: topicId, enabled });
}
</script>

<style lang="scss" scoped>
.safety-guardrails-topic-list {
  margin: 0;
  padding: 0;

  list-style: none;

  display: flex;
  flex-direction: column;
  gap: $unnnic-space-4;

  &__item {
    display: flex;
    align-items: flex-start;
    gap: $unnnic-space-4;

    padding-bottom: $unnnic-space-4;

    border-bottom: 1px solid $unnnic-color-border-base;
  }

  &__switch {
    flex: 1;
  }

  &__status {
    font: $unnnic-font-caption-1;
    color: $unnnic-color-fg-muted;
  }

  &__skeleton-content {
    flex: 1;

    display: flex;
    flex-direction: column;
    gap: $unnnic-space-1;

    * {
      display: flex;
    }
  }

  &__skeleton-row {
    display: flex;
    align-items: center;
    gap: $unnnic-space-2;
  }

  &__skeleton-spacer {
    flex-shrink: 0;
    width: 38px;
    height: 20px;
  }
}
</style>
