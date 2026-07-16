<template>
  <ul
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
defineProps({
  topics: {
    type: Array,
    required: true,
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
}
</style>
