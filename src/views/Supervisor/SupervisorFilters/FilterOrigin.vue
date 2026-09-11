<template>
  <UnnnicRadioGroup
    v-model:modelValue="originFilter"
    state="vertical"
    data-testid="origin-radio-group"
    :label="$t('audit.conversations.filters.origin.label')"
  >
    <UnnnicRadio
      v-for="option in originOptions"
      :key="option.value"
      :data-testid="`origin-radio-${option.value}`"
      :label="option.label"
      :value="option.value"
    />
  </UnnnicRadioGroup>
</template>

<script setup>
import { computed } from 'vue';
import i18n from '@/utils/plugins/i18n';

import { useSupervisorStore } from '@/store/Supervisor';

const supervisorStore = useSupervisorStore();

const getOriginTranslation = (filter) =>
  i18n.global.t(`audit.conversations.filters.origin.${filter}`);

const originOptions = computed(() =>
  ['all_conversations', 'started_with_conversation_starter'].map((value) => ({
    label: getOriginTranslation(value),
    value,
  })),
);

const originFilter = computed({
  get: () =>
    supervisorStore.temporaryFilters.hasConversationStarter
      ? 'started_with_conversation_starter'
      : 'all_conversations',
  set: (selected) => {
    supervisorStore.temporaryFilters.hasConversationStarter =
      selected === 'started_with_conversation_starter' ? true : null;
  },
});
</script>
