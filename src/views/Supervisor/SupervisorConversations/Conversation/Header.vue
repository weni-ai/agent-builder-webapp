<template>
  <header class="conversation__header">
    <section class="header__info">
      <SupervisorUsername
        :username="conversation?.username"
        size="title-sm"
      />

      <UnnnicIntelligenceText
        tag="h2"
        color="neutral-cloudy"
        family="secondary"
        size="body-gt"
        weight="regular"
        data-testid="conversation-title"
      >
        {{ formattedUrn }}
      </UnnnicIntelligenceText>

      <section
        v-if="topics.length > 0"
        class="header__topics"
      >
        <UnnnicTag
          v-for="topic in topics"
          :key="topic"
          scheme="neutral-light"
          :text="topic"
        />
      </section>
    </section>

    <button
      class="header__close-button"
      data-testid="close-button"
      @click="supervisorStore.selectConversation(null)"
    >
      <UnnnicIcon
        data-testid="close-button-icon"
        icon="close"
        size="md"
        scheme="neutral-cloudy"
      />
    </button>
  </header>
</template>

<script setup>
import { computed } from 'vue';

import { useSupervisorStore } from '@/store/Supervisor';
import i18n from '@/utils/plugins/i18n';
import { formatWhatsappUrn } from '@/utils/formatters';
import SupervisorUsername from '@/components/Supervisor/SupervisorUsername.vue';

const supervisorStore = useSupervisorStore();

const conversation = computed(() => supervisorStore.selectedConversation);
const formattedUrn = computed(() =>
  i18n.global.t('agent_builder.supervisor.contact_urn', {
    urn: formatWhatsappUrn(conversation.value?.urn),
  }),
);
const topics = computed(() => {
  if (typeof conversation.value?.topics === 'string') {
    return [conversation.value?.topics];
  }

  if (conversation.value?.topics?.length === 0) {
    return conversation.value?.topics;
  }

  return [];
});
</script>

<style lang="scss" scoped>
.conversation__header {
  padding: $unnnic-spacing-sm;

  display: flex;
  justify-content: space-between;

  border-bottom: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  .header__info {
    overflow: hidden;

    display: flex;
    flex-direction: column;
    gap: $unnnic-spacing-xs;
  }

  .header__topics {
    display: flex;
    gap: $unnnic-spacing-xs;
    flex-wrap: wrap;

    :deep(.unnnic-tag) {
      background-color: $unnnic-color-neutral-light;
    }

    :deep(.unnnic-tag__label) {
      color: $unnnic-color-neutral-cloudy;
    }
  }

  .header__close-button {
    background-color: transparent;
    border: none;

    display: flex;

    cursor: pointer;
  }
}
</style>
