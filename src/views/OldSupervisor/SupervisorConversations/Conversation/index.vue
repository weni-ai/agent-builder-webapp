<template>
  <section
    class="conversation"
    data-testid="conversation"
  >
    <header class="conversation__header">
      <UnnnicIntelligenceText
        tag="h2"
        color="neutral-darkest"
        family="secondary"
        size="title-sm"
        weight="bold"
        data-testid="conversation-title"
      >
        {{ conversation?.urn }}
      </UnnnicIntelligenceText>

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

    <section
      class="conversation__messages"
      data-testid="messages-container"
      @scroll="handleScroll"
    >
      <template v-if="status === 'loading' && !results">
        <QuestionAndAnswer
          v-for="loadMessage in 3"
          :key="loadMessage"
          :data="loadMessage"
          :isLoading="true"
          data-testid="loading-message"
        />
      </template>

      <NoMessagesFound
        v-else-if="results?.length === 0"
        data-testid="no-messages-found"
      />

      <template v-else>
        <QuestionAndAnswer
          v-for="message in results"
          :key="message.id"
          :data="message"
          :isLoading="false"
          data-testid="message"
        />

        <ForwardedHumanSupport
          v-if="conversation?.human_support"
          class="conversation__forwarded-human-support"
          data-testid="forwarded-human-support"
        />
      </template>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted } from 'vue';

import { useOldSupervisorStore } from '@/store/OldSupervisor';

import QuestionAndAnswer from './QuestionAndAnswer/index.vue';
import ForwardedHumanSupport from './QuestionAndAnswer/ForwardedHumanSupport.vue';
import NoMessagesFound from './NoMessagesFound.vue';
const supervisorStore = useOldSupervisorStore();

const conversation = computed(() => supervisorStore.selectedConversation);
const status = computed(() => conversation.value?.data?.status);
const results = computed(() => conversation.value?.data?.results);

onMounted(() => {
  supervisorStore.loadSelectedConversationData();
});

function handleScroll(event) {
  if (event.target.scrollTop === 0) {
    supervisorStore.loadSelectedConversationData({ next: true });
  }
}
</script>

<style lang="scss" scoped>
$conversation-border: $unnnic-border-width-thinner solid
  $unnnic-color-neutral-soft;
.conversation {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  border-left: $conversation-border;

  &__header {
    padding: $unnnic-spacing-sm;

    display: flex;
    justify-content: space-between;
    align-items: center;

    border-bottom: $conversation-border;

    .header__close-button {
      background-color: transparent;
      border: none;

      display: flex;

      cursor: pointer;
    }
  }

  &__messages {
    padding: $unnnic-spacing-sm;

    overflow: hidden auto;
  }

  &__forwarded-human-support {
    margin-top: $unnnic-spacing-sm;
  }
}
</style>
