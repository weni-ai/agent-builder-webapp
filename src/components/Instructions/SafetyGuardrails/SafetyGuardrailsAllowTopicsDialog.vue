<template>
  <UnnnicDialog
    v-model:open="open"
    data-testid="safety-guardrails-allow-topics-dialog"
    lazyMount
  >
    <UnnnicDialogContent>
      <UnnnicDialogHeader type="attention">
        <UnnnicDialogTitle
          data-testid="safety-guardrails-allow-topics-dialog-title"
        >
          {{ title }}
        </UnnnicDialogTitle>
      </UnnnicDialogHeader>

      <section
        class="safety-guardrails-allow-topics-dialog__content"
        data-testid="safety-guardrails-allow-topics-dialog-description"
      >
        <p>{{ description }}</p>
      </section>

      <UnnnicDialogFooter>
        <UnnnicDialogClose>
          <UnnnicButton
            data-testid="safety-guardrails-allow-topics-dialog-cancel"
            :text="$t('cancel')"
            type="tertiary"
            :disabled="loading"
          />
        </UnnnicDialogClose>
        <UnnnicButton
          data-testid="safety-guardrails-allow-topics-dialog-allow"
          :text="$t('agents.instructions.safety_guardrails.allow_topics.allow')"
          type="attention"
          :loading="loading"
          @click="emit('confirm')"
        />
      </UnnnicDialogFooter>
    </UnnnicDialogContent>
  </UnnnicDialog>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatListToReadable } from '@/utils/formatters';

const open = defineModel('open', {
  type: Boolean,
  required: true,
});

const props = defineProps({
  topicNames: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['confirm']);

const { t } = useI18n();

const isSingleTopic = computed(() => props.topicNames.length === 1);

function translateAllowTopics(key) {
  const base = 'agents.instructions.safety_guardrails.allow_topics';

  if (isSingleTopic.value) {
    return t(`${base}.${key}_single`, { topic: props.topicNames[0] });
  }

  return t(`${base}.${key}_multiple`, {
    count: props.topicNames.length,
    topics: formatListToReadable(props.topicNames),
  });
}

const title = computed(() => translateAllowTopics('title'));
const description = computed(() => translateAllowTopics('description'));
</script>

<style scoped lang="scss">
.safety-guardrails-allow-topics-dialog {
  &__content {
    padding: $unnnic-space-6;

    p {
      margin: 0;

      @include unnnic-font-body;
      color: $unnnic-color-fg-base;
    }
  }
}
</style>
