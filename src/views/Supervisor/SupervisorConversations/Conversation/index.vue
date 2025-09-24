<template>
  <section
    class="conversation"
    data-testid="conversation"
  >
    <ConversationHeader data-testid="conversation-header" />
    <section
      ref="messagesContainer"
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
        <ConversationStartFinish
          v-if="conversation?.start"
          class="conversation__start"
          data-testid="start"
          type="start"
          :datetime="conversation?.start"
        />

        <QuestionAndAnswer
          v-for="message in results"
          :key="message.id"
          :data="{ ...message, username: conversation.username }"
          :isLoading="false"
          data-testid="message"
        />

        <ConversationStartFinish
          v-if="conversation?.end && conversation?.status !== 'in_progress'"
          class="conversation__finish"
          data-testid="finish"
          type="finish"
          :datetime="conversation?.end"
        />
      </template>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

import { useSupervisorStore } from '@/store/Supervisor';

import QuestionAndAnswer from './QuestionAndAnswer/index.vue';
import ConversationStartFinish from './QuestionAndAnswer/ConversationStartFinish.vue';
import NoMessagesFound from './NoMessagesFound.vue';
import ConversationHeader from './Header.vue';

const supervisorStore = useSupervisorStore();

const conversation = computed(() => supervisorStore.selectedConversation);
const status = computed(() => conversation.value?.data?.status);
const results = computed(() => conversation.value?.data?.results);

const messagesContainer = ref(null);

async function loadConversationData() {
  await supervisorStore.loadSelectedConversationData();

  messagesContainer.value.scrollTo({
    top: messagesContainer.value.scrollHeight,
  });
}

watch(
  () => supervisorStore.queryConversationUuid,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      loadConversationData();
    }
  },
);

onMounted(() => {
  loadConversationData();
});

function handleScroll(event) {
  if (event.target.scrollTop === 0) {
    supervisorStore.loadSelectedConversationData({ next: true });
  }
}
</script>

<style lang="scss" scoped>
.conversation {
  overflow-x: hidden;

  display: flex;
  flex-direction: column;
  min-height: 100vh;

  border-left: $unnnic-border-width-thinner solid $unnnic-color-neutral-soft;

  &__messages {
    padding: $unnnic-spacing-sm;

    overflow: hidden auto;

    height: 100%;
  }

  &__start {
    margin-bottom: $unnnic-spacing-xs;
  }

  &__finish {
    margin-top: $unnnic-spacing-xs;
  }
}
</style>
