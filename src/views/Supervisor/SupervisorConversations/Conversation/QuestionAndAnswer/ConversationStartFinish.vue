<template>
  <section class="conversation-start-finish">
    <UnnnicIntelligenceText
      color="neutral-clean"
      family="secondary"
      size="body-md"
      tag="p"
    >
      {{ text }}
    </UnnnicIntelligenceText>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'date-fns';

import i18n from '@/utils/plugins/i18n';

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['start', 'finish'].includes(value),
  },
  datetime: {
    type: Date,
    required: true,
  },
});

const text = computed(() => {
  return i18n.global.t(
    `agent_builder.supervisor.conversation_start_finish.${props.type}`,
    {
      datetime: format(props.datetime, 'dd/MM/yy HH:mm'),
    },
  );
});
</script>

<style lang="scss" scoped>
.conversation-start-finish {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $unnnic-spacing-nano;
}
</style>
