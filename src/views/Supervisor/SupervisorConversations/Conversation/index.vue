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
import { computed, nextTick, onMounted, ref, watch } from 'vue';

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

  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function handleScroll(event) {
  const el = event.target;

  // Load more only when user scrolled to top, not already loading, and there is a next page
  if (el.scrollTop !== 0) return;
  if (supervisorStore.selectedConversation?.data?.status === 'loading') return;
  if (!supervisorStore.selectedConversation?.data?.next) return;

  const scrollHeightBefore = el.scrollHeight;
  await supervisorStore.loadSelectedConversationData({ next: true });

  await nextTick();
  // Compensate scroll so the list doesn't jump: new messages are prepended above, set scrollTop to the added height
  if (messagesContainer.value) {
    const scrollHeightAfter = messagesContainer.value.scrollHeight;
    const heightAdded = scrollHeightAfter - scrollHeightBefore;
    messagesContainer.value.scrollTop = heightAdded;
  }
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
