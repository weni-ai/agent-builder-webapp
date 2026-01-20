<template>
  <section
    :class="[
      'modal-assign-agent__start-setup',
      { 'modal-assign-agent__start-setup--loading': isLoading },
    ]"
    data-testid="start-setup"
  >
    <StartSetupSkeleton v-if="isLoading" />
    <template v-else>
      <About
        :agent="agent"
        data-testid="start-setup-about-section"
      />

      <MCPs
        :mcps="agent.MCPs || []"
        data-testid="start-setup-mcps-section"
      />

      <ConversationExample
        :conversationExample="agent.presentation?.conversation_example || []"
        :agentName="agent.name"
        data-testid="start-setup-conversation-section"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import type { AgentGroup } from '@/store/types/Agents.types';

import About from './About.vue';
import MCPs from './MCPs.vue';
import ConversationExample from './ConversationExample.vue';
import StartSetupSkeleton from './StartSetupSkeleton.vue';

withDefaults(
  defineProps<{
    agent: AgentGroup;
    isLoading?: boolean;
  }>(),
  {
    isLoading: false,
  },
);
</script>

<style lang="scss" scoped>
.modal-assign-agent__start-setup {
  overflow: auto;

  padding: $unnnic-space-6;

  display: grid;
  grid-template-columns: 4fr 3fr;
  gap: $unnnic-space-4;

  &--loading {
    grid-template-columns: 1fr;
  }
}
</style>
